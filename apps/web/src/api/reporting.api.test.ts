import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCaseTimeline, getDecisionBrief } from './reporting.api';
import { ApiClientError } from './errors';
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
afterEach(() => vi.unstubAllGlobals());
describe('reporting API', () => {
  it('requests the Decision Brief with Bearer authentication and AbortSignal', async () => { const fetchMock=vi.fn().mockResolvedValue(ok({})); vi.stubGlobal('fetch',fetchMock); const controller=new AbortController(); await getDecisionBrief('case/id','private-token',controller.signal); expect(fetchMock.mock.calls[0][0]).toContain('/cases/case/id/decision-brief'); const init=fetchMock.mock.calls[0][1]; expect((init.headers as Headers).get('Authorization')).toBe('Bearer private-token'); expect(init.signal).toBe(controller.signal); });
  it('requests Timeline with encoded pagination and AbortSignal', async () => { const fetchMock=vi.fn().mockResolvedValue(ok({})); vi.stubGlobal('fetch',fetchMock); const controller=new AbortController(); await getCaseTimeline('case','token',{limit:100,cursor:'opaque +/='},controller.signal); expect(fetchMock.mock.calls[0][0]).toContain('/cases/case/timeline?limit=100&cursor=opaque+%2B%2F%3D'); expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal); });
  it('preserves controlled reporting errors', async () => { vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({success:false,error:{code:'REPORTING_DATA_INTEGRITY_ERROR',message:'Internal detail'}}),{status:409}))); const error=await getDecisionBrief('case','token').catch((reason:unknown)=>reason); expect(error).toBeInstanceOf(ApiClientError); expect(error).toMatchObject({status:409,code:'REPORTING_DATA_INTEGRITY_ERROR'}); });
});
