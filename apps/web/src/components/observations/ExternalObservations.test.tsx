import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../auth/AuthProvider';
import ExternalObservations from './ExternalObservations';

const ctx: AuthContextValue = { user: { id: 'u', name: 'O', email: 'o@x', employeeCode: 'E', designation: 'Officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' }, token: 't', organization: null, isAuthenticated: true, authStatus: 'authenticated', sessionMessage: null, login: vi.fn(), logout: vi.fn() };
const response = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
const first = { id: 'first', sourceRecordId: 'wx-1', sourceVersion: '1', observationType: 'WEATHER', schemaVersion: '1', normalizedData: { rainfallMm: 42 }, observedAt: '2026-08-24T00:00:00Z', ingestedAt: '2026-08-24T01:00:00Z', qualityState: 'VALID', validationState: 'ACCEPTED', assetId: 'a', caseId: null, fingerprint: 'sha256:1', source: { id: 's', name: 'First Source', sourceCode: 'WX', versionNumber: 1, sourceType: 'WEATHER_PROVIDER', contractVersion: 'V1', isActive: true } };

afterEach(() => vi.unstubAllGlobals());

it('renders contextual governed observations without raw provider metadata', async () => {
  vi.stubGlobal('fetch', vi.fn(() => response({ items: [first], nextCursor: null, limit: 25 })));
  render(<AuthContext.Provider value={ctx}><ExternalObservations assetId="a" /></AuthContext.Provider>);
  expect(await screen.findByText('First Source')).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
  expect(screen.getByText(/do not replace inspection, risk assessment, or authorized human decisions/i)).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(/provider secret|password/i);
});

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
