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

export type SystemRole = 'OFFICER' | 'AUDITOR' | 'POLICY_ADMIN' | 'SYSTEM_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface SafeUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  designation: string;
  role: SystemRole;
  status: UserStatus;
  departmentId: string;
  jurisdictionId: string;
}
