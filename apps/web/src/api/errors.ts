export type ApiFailureKind = 'api' | 'network' | 'malformed_response';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly kind: ApiFailureKind,
    public readonly status: number | null,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
