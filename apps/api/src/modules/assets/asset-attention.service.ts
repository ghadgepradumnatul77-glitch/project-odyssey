import { SystemRole } from '../../generated/prisma';
import { QueryValidationError, parseCursor, parseLimit, parseUuidQuery } from '../../lib/pagination';
import { ScopedResourceNotFoundError, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { timestamp } from './asset-evidence-baseline.calculations';
import type { BaselineQuery } from './asset-evidence-baseline.repository';
import { deriveAssetAttention } from './asset-attention.calculations';
import { ASSET_ATTENTION_CALCULATION_VERSION, ASSET_ATTENTION_CONTRACT_VERSION, attentionCategories, attentionStates, type AttentionCategory, type AttentionState } from './asset-attention.contracts';
import { createAssetAttentionRepository, type AssetAttentionRows } from './asset-attention.repository';

export interface AttentionQuery extends BaselineQuery { category?: unknown; state?: unknown }
export function validateAttentionQuery(query: Record<string, unknown>, summary = false): AttentionQuery {
  const allowed = ['departmentId', 'jurisdictionId', 'assetId', 'category', 'state', ...(summary ? [] : ['limit', 'cursor'])];
  if (Object.keys(query).some(key => !allowed.includes(key))) throw new QueryValidationError('Unsupported Asset attention query.');
  for (const key of ['departmentId', 'jurisdictionId', 'assetId']) parseUuidQuery(query[key], key);
  if (!summary) { parseLimit(query.limit); parseCursor(query.cursor); }
  if (query.category !== undefined && (typeof query.category !== 'string' || !attentionCategories.includes(query.category as AttentionCategory))) throw new QueryValidationError('Invalid attention category.');
  if (query.state !== undefined && (typeof query.state !== 'string' || !attentionStates.includes(query.state as AttentionState))) throw new QueryValidationError('Invalid attention state.');
  return Object.fromEntries(allowed.filter(key => query[key] !== undefined).map(key => [key, query[key]]));
}
const repositoryQuery = (query: AttentionQuery): BaselineQuery => ({ departmentId: query.departmentId, jurisdictionId: query.jurisdictionId, assetId: query.assetId, limit: query.limit, cursor: query.cursor });
function project(row: AssetAttentionRows, asOf: Date, query: AttentionQuery) {
  const full = deriveAssetAttention(row.input, asOf);
  const categories = full.categories.filter(item => (!query.category || item.category === query.category) && (!query.state || item.state === query.state || item.signals.some(signal => signal.state === query.state)));
  return {
    asset: { id: row.asset.id, assetCode: row.asset.assetCode, assetType: row.asset.assetType, departmentId: row.asset.departmentId, jurisdictionId: row.asset.jurisdictionId },
    attention: { ...full, categories }, sourceCounts: { ...row.sourceCounts },
    caseHistory: { closedOrCancelledCount: row.closedOrCancelledCaseIds.length, referenceIds: row.closedOrCancelledCaseIds.slice(0, 20), referencesTruncated: row.closedOrCancelledCaseIds.length > 20 },
    predictiveAvailability: row.predictiveAvailability
  };
}
function metadata(principal: OrganizationalPrincipal, query: AttentionQuery, asOf: Date) {
  return { contractVersion: ASSET_ATTENTION_CONTRACT_VERSION, calculationVersion: ASSET_ATTENTION_CALCULATION_VERSION, asOf: asOf.toISOString(),
    scope: { mode: principal.role === SystemRole.SYSTEM_ADMIN ? 'GLOBAL_READ' : 'ORGANIZATIONAL', departmentId: principal.role === SystemRole.SYSTEM_ADMIN ? null : principal.departmentId, jurisdictionId: principal.role === SystemRole.SYSTEM_ADMIN ? null : principal.jurisdictionId,
      filters: { departmentId: query.departmentId ?? null, jurisdictionId: query.jurisdictionId ?? null, assetId: query.assetId ?? null, category: query.category ?? null, state: query.state ?? null } },
    disclosures: ['Asset-first descriptive decision support; Assets without Cases remain included.', 'Category and state filters are applied after complete evidence derivation; a state matches the category aggregate or any retained signal and does not alter source evidence.', 'Signals are multi-label and are not collapsed into a severity, rank, score, prediction or Case priority.', 'Unknown, invalid and conflicting evidence remain explicit.', 'Raw ages have no inferred freshness threshold.', 'Public and external records remain contextual; predictive access restrictions are preserved.', 'No risk, priority, workflow or business record is mutated.'] };
}

export function createAssetAttentionService(repository = createAssetAttentionRepository(), clock: () => Date = () => new Date()) {
  const referenceTime = () => { const value = clock(); if (timestamp(value).state !== 'PRESENT') throw new Error('ATTENTION_CLOCK_INVALID'); return value; };
  return {
    async page(principal: OrganizationalPrincipal, input: Record<string, unknown> = {}) {
      const query = validateAttentionQuery(input), asOf = referenceTime();
      const result = await repository.page(principal, repositoryQuery(query));
      if (query.assetId && !result.items.length) throw new ScopedResourceNotFoundError('ASSET_NOT_FOUND');
      return { ...metadata(principal, query, asOf), items: result.items.map(row => project(row, asOf, query)), limit: result.limit, nextCursor: result.nextCursor };
    },
    async summary(principal: OrganizationalPrincipal, input: Record<string, unknown> = {}) {
      const query = validateAttentionQuery(input, true), asOf = referenceTime();
      const categoryStates = Object.fromEntries(attentionCategories.filter(category => !query.category || category === query.category).map(category => [category, Object.fromEntries(attentionStates.map(state => [state, 0]))])) as Record<AttentionCategory, Record<AttentionState, number>>;
      const signalStates = Object.fromEntries(attentionStates.map(state => [state, 0])) as Record<AttentionState, number>;
      let assetsVisited = 0, assetsWithMatchingProjection = 0, signalsCounted = 0;
      const result = await repository.traverse(principal, repositoryQuery(query), rows => {
        for (const row of rows) {
          assetsVisited++;
          const full = deriveAssetAttention(row.input, asOf);
          const selected = full.categories.filter(item => (!query.category || item.category === query.category) && (!query.state || item.state === query.state || item.signals.some(signal => signal.state === query.state)));
          if (selected.length) assetsWithMatchingProjection++;
          for (const item of selected) {
            categoryStates[item.category][item.state]++;
            for (const signal of item.signals) { signalStates[signal.state]++; signalsCounted++; }
          }
        }
      });
      if (!result.complete || result.totalAssets !== assetsVisited) throw new Error('ATTENTION_TRAVERSAL_INCOMPLETE');
      if (query.assetId && assetsVisited === 0) throw new ScopedResourceNotFoundError('ASSET_NOT_FOUND');
      return { ...metadata(principal, query, asOf), totalAssets: assetsVisited, assetsWithMatchingProjection, categoryStates, signalStates, signalsCounted, complete: true as const };
    }
  };
}
export const assetAttentionService = createAssetAttentionService();
