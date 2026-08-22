# ODYSSEY advisory intelligence service

This optional FastAPI service is stateless and advisory only. `ODYSSEY_REFERENCE_PROVIDER_V1` is a deterministic, non-ML integration fixture—not trained, calibrated or suitable for production prediction. Confidence describes structured-input completeness, not failure probability, correctness or authority.

## Setup and operation

Python is not pinned. Use a maintained interpreter compatible with `requirements.txt` and certify an exact version before production.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

POSIX activation: `source .venv/bin/activate`.

- `GET /health`
- `POST /v1/intelligence/infer`
- Tests: `python -m pytest`

## Safety contract

The provider abstains when contract versions or required structured safety features are unavailable. It accepts no reporter PII, notes, credentials, prompts or arbitrary free text. It has no database access and cannot decide policy applicability, approve, execute, verify or close. The API remains the authentication, reconciliation, governance and persistence boundary.

Unavailable, slow, malformed, stale or low-confidence responses must fail safe to governed status while deterministic safety continues. A prohibited action cannot become permissible here. Provider/version provenance is retained by the API.

Synthetic G6 data is not training data. Production ML requires legitimate representative data, validation, bias/safety review, calibration, approval, monitoring, drift detection and rollback governance outside Phase 1.
