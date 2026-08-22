from datetime import datetime, timezone

from .contracts import (
    CONTRACT_VERSION, FEATURE_SCHEMA_VERSION, MODEL_NAME, MODEL_VERSION, PROVIDER_NAME, PROVIDER_TYPE,
    AbstainedInferenceResponse, CompletedInferenceResponse, ContributingFactor, FactorDirection,
    InferenceRequest, ProviderProvenance, RecommendedActionSuggestion,
)


class ReferenceProvider:
    """Deterministic integration fixture: non-ML, untrained, uncalibrated, and advisory only."""

    _required_features = ("asset_type", "emergency_flag", "structural_condition", "crack_severity", "corrosion_level", "traffic_importance", "hospital_route", "weather_risk", "heavy_rain_expected")

    def _provenance(self, request: InferenceRequest, inferred_at: datetime) -> ProviderProvenance:
        return ProviderProvenance(provider=PROVIDER_NAME, providerType=PROVIDER_TYPE, modelName=MODEL_NAME, modelVersion=MODEL_VERSION, featureSchemaVersion=request.feature_schema_version, contractVersion=request.contract_version, inferredAt=inferred_at, productionTrained=False)

    def _abstain(self, request: InferenceRequest, code: str, message: str, inferred_at: datetime):
        return AbstainedInferenceResponse(status="ABSTAINED", explanation="Reference provider abstained; no advisory prediction was produced.", abstentionReasons=[{"code": code, "message": message}], provenance=self._provenance(request, inferred_at))

    def infer(self, request: InferenceRequest, inferred_at: datetime | None = None):
        now = inferred_at or datetime.now(timezone.utc)
        if request.contract_version != CONTRACT_VERSION:
            return self._abstain(request, "UNSUPPORTED_CONTRACT_VERSION", "The requested intelligence contract version is not supported.", now)
        if request.feature_schema_version != FEATURE_SCHEMA_VERSION:
            return self._abstain(request, "UNSUPPORTED_FEATURE_SCHEMA", "The requested feature schema version is not supported.", now)
        if any(getattr(request, name) is None for name in self._required_features):
            return self._abstain(request, "INSUFFICIENT_FEATURES", "Required structured safety features are incomplete.", now)

        factors = self._factors(request)
        actions = [RecommendedActionSuggestion(actionCode="ACT_INSPECT_DETAILED", rationale="Use governed detailed inspection to confirm current structured observations.")]
        if factors:
            actions.append(RecommendedActionSuggestion(actionCode="ACT_INCREASE_MONITORING", rationale="Structured observations support closer governed monitoring."))
        if request.emergency_flag or request.deterministic_risk_level.value == "CRITICAL":
            actions.append(RecommendedActionSuggestion(actionCode="ACT_ESCALATE_AUTHORITY", rationale="Existing authoritative context warrants prompt human review."))

        # This fixture deliberately retains the authoritative baseline; it is not a second risk engine.
        return CompletedInferenceResponse(status="COMPLETED", predictedRiskScore=request.deterministic_risk_score, predictedRiskLevel=request.deterministic_risk_level, recommendedPriority=request.deterministic_priority_level, confidence=1.0, confidenceSemantics="INPUT_COMPLETENESS_NOT_CALIBRATED_PROBABILITY", contributingFactors=factors, explanation="Non-ML reference provider retained the deterministic baseline and summarized structured input signals for integration testing.", recommendedActions=actions, provenance=self._provenance(request, now))

    def _factors(self, request: InferenceRequest) -> list[ContributingFactor]:
        factors: list[ContributingFactor] = []
        if request.structural_condition.value in {"POOR", "CRITICAL"}:
            factors.append(ContributingFactor(code="STRUCTURAL_CONDITION_SIGNAL", direction=FactorDirection.INCREASES_RISK, importance=1.0, observedValue=request.structural_condition.value, explanation="The structured inspection records degraded structural condition."))
        if request.crack_severity.value == "SEVERE":
            factors.append(ContributingFactor(code="CRACK_SEVERITY_SIGNAL", direction=FactorDirection.INCREASES_RISK, importance=1.0, observedValue=request.crack_severity.value, explanation="The structured inspection records severe cracking."))
        if request.heavy_rain_expected:
            factors.append(ContributingFactor(code="WEATHER_EXPOSURE_SIGNAL", direction=FactorDirection.INCREASES_RISK, importance=0.5, observedValue=True, explanation="The structured inspection indicates expected heavy rain."))
        if not factors:
            factors.append(ContributingFactor(code="NO_REFERENCE_ALERT_SIGNAL", direction=FactorDirection.NEUTRAL, importance=0.0, observedValue="NONE", explanation="No reference-provider alert signal was present in the allow-listed features."))
        return factors


reference_provider = ReferenceProvider()
