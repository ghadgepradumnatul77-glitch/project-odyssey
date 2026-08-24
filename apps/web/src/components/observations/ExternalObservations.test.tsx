import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../auth/AuthProvider';
import ExternalObservations from './ExternalObservations';

const ctx: AuthContextValue = { user: { id: 'u', name: 'O', email: 'o@x', employeeCode: 'E', designation: 'Officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' }, token: 't', organization: null, isAuthenticated: true, authStatus: 'authenticated', sessionMessage: null, login: vi.fn(), logout: vi.fn() };
const response = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
const first = { id: 'first', sourceRecordId: 'wx-1', sourceVersion: '1', observationType: 'WEATHER', schemaVersion: '1', normalizedData: { rainfallMm: 42 }, sourceMetadata:{providerId:'OPEN_METEO',dataSemantics:'CURRENT_MODEL_DERIVED'}, observedAt: '2026-08-24T00:00:00Z', ingestedAt: '2026-08-24T01:00:00Z', qualityState: 'VALID', validationState: 'ACCEPTED', assetId: 'a', caseId: null, fingerprint: 'sha256:1', source: { id: 's', name: 'First Source', sourceCode: 'WX', versionNumber: 1, sourceType: 'WEATHER_PROVIDER', contractVersion: 'V1', isActive: true } };

afterEach(() => vi.unstubAllGlobals());

it('renders contextual governed observations without raw provider metadata', async () => {
  vi.stubGlobal('fetch', vi.fn(() => response({ items: [first], nextCursor: null, limit: 25 })));
  render(<AuthContext.Provider value={ctx}><ExternalObservations assetId="a" /></AuthContext.Provider>);
  expect(await screen.findByText('First Source')).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
  expect(screen.getByText(/does not automatically change ODYSSEY risk, priority, approval, or execution/i)).toBeInTheDocument();
  expect(screen.getByText(/Weather data by Open-Meteo.com/)).toBeInTheDocument();
  expect(screen.getByText(/not a verified infrastructure condition/)).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(/provider secret|password/i);
});

it('offers a bounded officer fetch action, prevents repeat clicks, and refreshes after success', async()=>{let resolveFetch:(value:Response)=>void=()=>{};const fetch=vi.fn().mockImplementationOnce(()=>response({items:[],nextCursor:null,limit:25})).mockImplementationOnce(()=>new Promise<Response>(resolve=>{resolveFetch=resolve})).mockImplementationOnce(()=>response({items:[first],nextCursor:null,limit:25}));vi.stubGlobal('fetch',fetch);render(<AuthContext.Provider value={ctx}><ExternalObservations assetId="a"/></AuthContext.Provider>);await screen.findByText(/No external observations/);const button=screen.getByRole('button',{name:'Fetch weather context'});fireEvent.click(button);expect(screen.getByRole('button',{name:'Fetching weather…'})).toBeDisabled();fireEvent.click(screen.getByRole('button',{name:'Fetching weather…'}));expect(fetch).toHaveBeenCalledTimes(2);resolveFetch(new Response(JSON.stringify({success:true,data:{...first,idempotentReplay:false}}),{status:201,headers:{'Content-Type':'application/json'}}));expect(await screen.findByText(/Weather context fetched and recorded/)).toBeInTheDocument();expect(await screen.findByText('First Source')).toBeInTheDocument()});

it.each(['AUDITOR','POLICY_ADMIN','SYSTEM_ADMIN'])('hides provider mutation from %s',async role=>{vi.stubGlobal('fetch',vi.fn(()=>response({items:[],nextCursor:null,limit:25})));render(<AuthContext.Provider value={{...ctx,user:{...ctx.user!,role:role as any}}}><ExternalObservations assetId="a"/></AuthContext.Provider>);await screen.findByText(/No external observations/);expect(screen.queryByRole('button',{name:'Fetch weather context'})).not.toBeInTheDocument()});

it('renders an empty observation state', async () => {
  vi.stubGlobal('fetch', vi.fn(() => response({ items: [], nextCursor: null, limit: 25 })));
  render(<AuthContext.Provider value={ctx}><ExternalObservations assetId="a" /></AuthContext.Provider>);
  expect(await screen.findByText(/No external observations/)).toBeInTheDocument();
});

it('loads later pages, deduplicates records, and retains earlier results when a later page fails', async () => {
  const second = { ...first, id: 'second', sourceRecordId: 'wx-2', fingerprint: 'sha256:2', source: { ...first.source, name: 'Second Source' } };
  const fetch = vi.fn().mockImplementationOnce(() => response({ items: [first], nextCursor: 'page-2', limit: 25 })).mockImplementationOnce(() => response({ items: [first, second], nextCursor: 'page-3', limit: 25 })).mockRejectedValueOnce(new Error('Later page unavailable'));
  vi.stubGlobal('fetch', fetch);
  render(<AuthContext.Provider value={ctx}><ExternalObservations assetId="a" /></AuthContext.Provider>);
  expect(await screen.findByText('First Source')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
  expect(await screen.findByText('Second Source')).toBeInTheDocument();
  expect(screen.getAllByText('First Source')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
  expect(await screen.findByText(/service could not be reached/i)).toBeInTheDocument();
  expect(screen.getByText('First Source')).toBeInTheDocument();
  expect(screen.getByText('Second Source')).toBeInTheDocument();
});
