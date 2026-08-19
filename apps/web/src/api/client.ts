import { API_BASE_URL } from '../config/env';
import type { ApiErrorEnvelope, ApiSuccess } from '../types/api';
import { ApiClientError } from './errors';

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSuccess<T>(value: unknown): value is ApiSuccess<T> {
  return isRecord(value) && value.success === true && Object.prototype.hasOwnProperty.call(value, 'data');
}

function isErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (!isRecord(value) || value.success !== false || !isRecord(value.error)) return false;
  return typeof value.error.code === 'string' && typeof value.error.message === 'string';
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return JSON.parse(await response.text()) as unknown;
  } catch {
    throw new ApiClientError('The server returned an invalid response.', 'malformed_response', response.status, 'MALFORMED_RESPONSE');
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, body, headers: suppliedHeaders, ...requestInit } = options;
  const headers = new Headers(suppliedHeaders);
  headers.set('Accept', 'application/json');
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
      ...requestInit,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiClientError('The JanSeva IntelliGov service could not be reached.', 'network', null, 'NETWORK_ERROR');
  }

  if (response.status === 401 && accessToken) unauthorizedHandler?.();
  const payload = await parseJson(response);
  if (response.ok && isSuccess<T>(payload)) return payload.data;
  if (isErrorEnvelope(payload)) {
    throw new ApiClientError(payload.error.message, 'api', response.status, payload.error.code);
  }
  throw new ApiClientError('The server returned an invalid response.', 'malformed_response', response.status, 'MALFORMED_RESPONSE');
}
