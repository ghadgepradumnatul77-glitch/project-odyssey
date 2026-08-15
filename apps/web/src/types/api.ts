export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorEnvelope;
