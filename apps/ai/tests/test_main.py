from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.contracts import CompletedInferenceResponse
from app.main import app, reference_provider

client = TestClient(app)


def request_body(**overrides):
    body = {
        'contractVersion': 'ODYSSEY_INTELLIGENCE_V1', 'featureSchemaVersion': 'ODYSSEY_INFRA_FEATURES_V1',
        'sourceFingerprint': 'sha256:' + 'a' * 64, 'caseId': 'case-1', 'inspectionId': 'inspection-1', 'riskAssessmentId': 'risk-1',
        'assetType': 'BRIDGE', 'emergencyFlag': False, 'structuralCondition': 'POOR', 'crackSeverity': 'SEVERE',
        'corrosionLevel': 'MODERATE', 'trafficImportance': 'HIGH', 'hospitalRoute': True, 'weatherRisk': 'HIGH',
        'heavyRainExpected': True, 'estimatedDailyUsers': 42000, 'deterministicRiskScore': 77,
        'deterministicRiskLevel': 'VERY_HIGH', 'deterministicPriorityLevel': 'CRITICAL', 'deterministicAssessmentVersion': 'ODYSSEY_RISK_V1',
    }
    body.update(overrides)
    return body


def test_health_exposes_safe_non_ml_metadata():
    response = client.get('/health')
    assert response.status_code == 200
    data = response.json()['data']
    assert data['contractVersion'] == 'ODYSSEY_INTELLIGENCE_V1'
    assert data['provider'] == 'ODYSSEY_REFERENCE_PROVIDER_V1'
    assert data['providerType'] == 'REFERENCE_NON_ML'
    assert data['productionTrained'] is False
    assert set(data) == {'service', 'status', 'contractVersion', 'featureSchemaVersion', 'provider', 'providerType', 'productionTrained', 'timestamp'}


def test_valid_completed_inference_is_structured_and_repeatable():
    first = client.post('/v1/intelligence/infer', json=request_body())
    second = client.post('/v1/intelligence/infer', json=request_body())
    assert first.status_code == second.status_code == 200
    left, right = first.json(), second.json()
    left['provenance'].pop('inferredAt'); right['provenance'].pop('inferredAt')
    assert left == right
    assert left['status'] == 'COMPLETED'
    assert left['confidence'] == 1.0
    assert left['confidenceSemantics'] == 'INPUT_COMPLETENESS_NOT_CALIBRATED_PROBABILITY'
    assert not left['abstentionReasons']


@pytest.mark.parametrize('field', ['reporterName', 'reporterPhone', 'reporterEmail', 'reporterIdentity', 'publicReportDescription', 'inspectionNotes', 'humanDecisionNotes', 'password', 'jwt', 'bearerToken', 'prompt'])
def test_unknown_sensitive_and_free_text_fields_are_rejected_without_value_echo(field):
    response = client.post('/v1/intelligence/infer', json=request_body(**{field: 'SENSITIVE_VALUE_MUST_NOT_ECHO'}))
    assert response.status_code == 422
    assert response.json()['error']['code'] == 'INVALID_REQUEST'
    assert 'SENSITIVE_VALUE_MUST_NOT_ECHO' not in response.text


def test_malformed_enum_is_controlled_validation_error():
    response = client.post('/v1/intelligence/infer', json=request_body(structuralCondition='UNKNOWN'))
    assert response.status_code == 422
    assert response.json()['error']['code'] == 'INVALID_REQUEST'


@pytest.mark.parametrize('field', ['structuralCondition', 'crackSeverity', 'corrosionLevel', 'trafficImportance', 'weatherRisk'])
def test_missing_safety_critical_feature_abstains(field):
    body = client.post('/v1/intelligence/infer', json=request_body(**{field: None})).json()
    assert body['status'] == 'ABSTAINED'
    assert body['abstentionReasons'][0]['code'] == 'INSUFFICIENT_FEATURES'
    assert 'confidence' not in body
    assert 'predictedRiskScore' not in body


@pytest.mark.parametrize(('field', 'value', 'code'), [
    ('contractVersion', 'FUTURE', 'UNSUPPORTED_CONTRACT_VERSION'),
    ('featureSchemaVersion', 'FUTURE', 'UNSUPPORTED_FEATURE_SCHEMA'),
])
def test_unsupported_versions_abstain(field, value, code):
    body = client.post('/v1/intelligence/infer', json=request_body(**{field: value})).json()
    assert body['status'] == 'ABSTAINED'
    assert body['abstentionReasons'][0]['code'] == code


def test_confidence_contract_enforces_lower_and_upper_bounds():
    common = dict(status='COMPLETED', predictedRiskScore=50, predictedRiskLevel='HIGH', recommendedPriority='HIGH', confidenceSemantics='INPUT_COMPLETENESS_NOT_CALIBRATED_PROBABILITY', contributingFactors=[], explanation='Controlled explanation.', recommendedActions=[], provenance={'provider': 'ODYSSEY_REFERENCE_PROVIDER_V1', 'providerType': 'REFERENCE_NON_ML', 'modelName': 'ODYSSEY_REFERENCE_HEURISTIC', 'modelVersion': '1', 'featureSchemaVersion': 'ODYSSEY_INFRA_FEATURES_V1', 'contractVersion': 'ODYSSEY_INTELLIGENCE_V1', 'inferredAt': datetime.now(timezone.utc), 'productionTrained': False})
    for confidence in (-0.01, 1.01):
        with pytest.raises(ValidationError):
            CompletedInferenceResponse(confidence=confidence, **common)


def test_factor_structure_and_controlled_explanation_have_no_internal_trace():
    body = client.post('/v1/intelligence/infer', json=request_body()).json()
    assert body['contributingFactors']
    for factor in body['contributingFactors']:
        assert set(factor) == {'code', 'direction', 'importance', 'observedValue', 'explanation'}
        assert 0.0 <= factor['importance'] <= 1.0
    serialized = str(body).lower()
    assert 'chain-of-thought' not in serialized
    assert 'internal reasoning' not in serialized


def test_provenance_is_non_ml_untrained_and_has_no_fake_artifact_digest():
    provenance = client.post('/v1/intelligence/infer', json=request_body()).json()['provenance']
    assert provenance['providerType'] == 'REFERENCE_NON_ML'
    assert provenance['productionTrained'] is False
    assert 'modelArtifactDigest' not in provenance


def test_action_suggestions_have_stable_codes_and_no_policy_authority():
    actions = client.post('/v1/intelligence/infer', json=request_body()).json()['recommendedActions']
    assert actions
    for action in actions:
        assert set(action) == {'actionCode', 'rationale'}
        assert action['actionCode'].startswith('ACT_')
        assert not ({'mandatory', 'prohibited', 'approved', 'permitted', 'enforcementClassification'} & set(action))


def test_unexpected_provider_failure_is_generic_and_does_not_echo_request(monkeypatch):
    def fail(_request):
        raise RuntimeError('private stack and database detail')
    monkeypatch.setattr(reference_provider, 'infer', fail)
    response = client.post('/v1/intelligence/infer', json=request_body())
    assert response.status_code == 500
    assert response.json()['detail']['code'] == 'INTELLIGENCE_PROVIDER_FAILURE'
    assert 'private stack' not in response.text
    assert 'case-1' not in response.text
