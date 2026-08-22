from datetime import datetime
from enum import Enum
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field

CONTRACT_VERSION = "ODYSSEY_INTELLIGENCE_V1"
FEATURE_SCHEMA_VERSION = "ODYSSEY_INFRA_FEATURES_V1"
PROVIDER_NAME = "ODYSSEY_REFERENCE_PROVIDER_V1"
PROVIDER_TYPE = "REFERENCE_NON_ML"
MODEL_NAME = "ODYSSEY_REFERENCE_HEURISTIC"
MODEL_VERSION = "1"


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class StrictContract(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, extra="forbid", populate_by_name=False, strict=True)


class RiskLevel(str, Enum):
    VERY_LOW = "VERY_LOW"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"
    CRITICAL = "CRITICAL"


class PriorityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"
    CRITICAL = "CRITICAL"


class AssetType(str, Enum):
    BRIDGE = "BRIDGE"
    ROAD = "ROAD"
    FLYOVER = "FLYOVER"


class StructuralCondition(str, Enum):
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"
    CRITICAL = "CRITICAL"


class CrackSeverity(str, Enum):
    NONE = "NONE"
    MINOR = "MINOR"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"


class CorrosionLevel(str, Enum):
    NONE = "NONE"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


class TrafficImportance(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class WeatherRisk(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SEVERE = "SEVERE"


class InferenceRequest(StrictContract):
    contract_version: str = Field(min_length=1, max_length=80)
    feature_schema_version: str = Field(min_length=1, max_length=80)
    source_fingerprint: str = Field(pattern=r"^sha256:[a-f0-9]{64}$")
    case_id: str = Field(min_length=1, max_length=200)
    inspection_id: str = Field(min_length=1, max_length=200)
    risk_assessment_id: str = Field(min_length=1, max_length=200)
    asset_type: AssetType | None = None
    emergency_flag: bool | None = None
    structural_condition: StructuralCondition | None = None
    crack_severity: CrackSeverity | None = None
    corrosion_level: CorrosionLevel | None = None
    traffic_importance: TrafficImportance | None = None
    hospital_route: bool | None = None
    weather_risk: WeatherRisk | None = None
    heavy_rain_expected: bool | None = None
    estimated_daily_users: int | None = Field(default=None, ge=0)
    deterministic_risk_score: int = Field(ge=0, le=100)
    deterministic_risk_level: RiskLevel
    deterministic_priority_level: PriorityLevel
    deterministic_assessment_version: str = Field(min_length=1, max_length=80)


class FactorDirection(str, Enum):
    INCREASES_RISK = "INCREASES_RISK"
    DECREASES_RISK = "DECREASES_RISK"
    NEUTRAL = "NEUTRAL"


class ContributingFactor(StrictContract):
    code: str = Field(pattern=r"^[A-Z][A-Z0-9_]+$")
    direction: FactorDirection
    importance: float = Field(ge=0.0, le=1.0)
    observed_value: str | int | float | bool
    explanation: str = Field(min_length=1, max_length=240)


class RecommendedActionSuggestion(StrictContract):
    action_code: str = Field(pattern=r"^ACT_[A-Z0-9_]+$")
    rationale: str = Field(min_length=1, max_length=240)


class AbstentionReason(StrictContract):
    code: Literal["INSUFFICIENT_FEATURES", "UNSUPPORTED_FEATURE_SCHEMA", "UNSUPPORTED_CONTRACT_VERSION", "INPUT_OUT_OF_DOMAIN"]
    message: str = Field(min_length=1, max_length=240)


class ProviderProvenance(StrictContract):
    provider: Literal[PROVIDER_NAME]
    provider_type: Literal[PROVIDER_TYPE]
    model_name: Literal[MODEL_NAME]
    model_version: Literal[MODEL_VERSION]
    feature_schema_version: str
    contract_version: str
    inferred_at: datetime
    production_trained: Literal[False] = False


class CompletedInferenceResponse(StrictContract):
    status: Literal["COMPLETED"]
    predicted_risk_score: int = Field(ge=0, le=100)
    predicted_risk_level: RiskLevel
    recommended_priority: PriorityLevel
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_semantics: Literal["INPUT_COMPLETENESS_NOT_CALIBRATED_PROBABILITY"]
    contributing_factors: list[ContributingFactor]
    explanation: str = Field(min_length=1, max_length=300)
    recommended_actions: list[RecommendedActionSuggestion]
    abstention_reasons: list[AbstentionReason] = Field(default_factory=list, max_length=0)
    provenance: ProviderProvenance


class AbstainedInferenceResponse(StrictContract):
    status: Literal["ABSTAINED"]
    predicted_risk_score: None = None
    predicted_risk_level: None = None
    recommended_priority: None = None
    confidence: None = None
    contributing_factors: list[ContributingFactor] = Field(default_factory=list, max_length=0)
    explanation: Literal["Reference provider abstained; no advisory prediction was produced."]
    recommended_actions: list[RecommendedActionSuggestion] = Field(default_factory=list, max_length=0)
    abstention_reasons: list[AbstentionReason] = Field(min_length=1)
    provenance: ProviderProvenance


InferenceResponse = Annotated[Union[CompletedInferenceResponse, AbstainedInferenceResponse], Field(discriminator="status")]
