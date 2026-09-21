-- Explicit absence of trusted provenance; not eligible for ML dataset use.
-- No default, backfill, or modification of existing records or guards.
ALTER TYPE "PredictiveProvenanceClass" ADD VALUE 'UNKNOWN';
