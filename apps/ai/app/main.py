from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .contracts import CONTRACT_VERSION, FEATURE_SCHEMA_VERSION, PROVIDER_NAME, PROVIDER_TYPE, InferenceRequest, InferenceResponse
from .reference_provider import reference_provider

app = FastAPI(title="ODYSSEY Advisory Intelligence Service", version="0.2.0")


@app.exception_handler(RequestValidationError)
async def controlled_validation_error(_request: Request, exc: RequestValidationError):
    details = [{"location": list(error["loc"]), "type": error["type"], "message": error["msg"]} for error in exc.errors()]
    return JSONResponse(status_code=422, content={"error": {"code": "INVALID_REQUEST", "message": "The structured inference request is invalid.", "details": details}})

@app.get('/health')
def health():
    return {
        'success': True,
        'data': {
            'service': 'odyssey-ai',
            'status': 'ok',
            'contractVersion': CONTRACT_VERSION,
            'featureSchemaVersion': FEATURE_SCHEMA_VERSION,
            'provider': PROVIDER_NAME,
            'providerType': PROVIDER_TYPE,
            'productionTrained': False,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    }


@app.post('/v1/intelligence/infer', response_model=InferenceResponse, response_model_by_alias=True, response_model_exclude_none=True)
def infer(request: InferenceRequest):
    try:
        return reference_provider.infer(request)
    except Exception:
        raise HTTPException(status_code=500, detail={'code': 'INTELLIGENCE_PROVIDER_FAILURE', 'message': 'The advisory intelligence provider could not complete the request.'}) from None
