# ODYSSEY advisory intelligence service

This service is stateless and advisory only. `ODYSSEY_REFERENCE_PROVIDER_V1` is a deterministic, non-ML integration fixture: it is not trained, calibrated, or suitable for production risk prediction. Its normalized confidence value describes complete required structured input only; it is not a probability of failure, correctness, authority, or policy applicability.

The provider abstains when supported contract versions or required structured safety features are unavailable. It accepts no reporter PII, inspection notes, credentials, prompts, or arbitrary free text. It has no database access and does not decide policy applicability or mutate Odyssey records. `apps/api` remains the governance and persistence boundary.
