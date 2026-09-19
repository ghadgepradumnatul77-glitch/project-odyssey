-- No data rewrite. Freeze all facts by default, including future columns.
-- Only the existing ACTIVE -> VOID lifecycle metadata is permitted to change.
BEGIN;

CREATE FUNCTION public.guard_predictive_record_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
DECLARE
  mutable_fields text[] := ARRAY[
    'status', 'voidedAt', 'voidedById', 'voidReason',
    'replacementSnapshotId', 'replacementOutcomeId'
  ];
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'PREDICTIVE_RECORD_DELETE_FORBIDDEN';
  END IF;

  IF (to_jsonb(NEW) - mutable_fields) IS DISTINCT FROM (to_jsonb(OLD) - mutable_fields) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'PREDICTIVE_RECORD_FACTS_IMMUTABLE';
  END IF;

  -- Preserve harmless idempotent no-op updates, including on historical rows.
  IF to_jsonb(NEW) IS NOT DISTINCT FROM to_jsonb(OLD) THEN
    RETURN NEW;
  END IF;

  IF OLD.status::text <> 'ACTIVE' OR NEW.status::text <> 'VOID'
     OR NEW."voidedAt" IS NULL OR NEW."voidedById" IS NULL
     OR NEW."voidReason" IS NULL OR length(btrim(NEW."voidReason")) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'PREDICTIVE_RECORD_VOID_TRANSITION_REQUIRED';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER predictive_feature_snapshot_immutable
BEFORE UPDATE OR DELETE ON public."PredictiveFeatureSnapshot"
FOR EACH ROW EXECUTE FUNCTION public.guard_predictive_record_mutation();

CREATE TRIGGER predictive_outcome_immutable
BEFORE UPDATE OR DELETE ON public."PredictiveOutcome"
FOR EACH ROW EXECUTE FUNCTION public.guard_predictive_record_mutation();

-- Normal runtime grants cannot disable these triggers or bypass them via replica mode.
ALTER TABLE public."PredictiveFeatureSnapshot" ENABLE ALWAYS TRIGGER predictive_feature_snapshot_immutable;
ALTER TABLE public."PredictiveOutcome" ENABLE ALWAYS TRIGGER predictive_outcome_immutable;

COMMIT;
