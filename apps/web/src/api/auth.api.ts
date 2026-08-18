import type { SafeUser } from '../types/api';
import { apiRequest } from './client';

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: SafeUser;
}

interface DepartmentDto { id: string; name: string; code: string; }
interface JurisdictionDto { id: string; name: string; type: string; }
export interface OrganizationContext {
  departmentName: string;
  departmentCode: string | null;
  jurisdictionName: string;
  jurisdictionType: string | null;
}

export function loginRequest(email: string, password: string, signal?: AbortSignal) {
  return apiRequest<LoginResult>('/auth/login', {
    method: 'POST', body: { email, password }, signal
  });
}

export function getCurrentUser(accessToken: string, signal?: AbortSignal) {
  return apiRequest<SafeUser>('/auth/me', { accessToken, signal });
}

export async function getOrganizationContext(user: SafeUser, accessToken: string, signal?: AbortSignal): Promise<OrganizationContext> {
  const [departments, jurisdictions] = await Promise.all([
    apiRequest<DepartmentDto[]>('/departments', { accessToken, signal }),
    apiRequest<JurisdictionDto[]>('/jurisdictions', { accessToken, signal })
  ]);
  const department = departments.find((item) => item.id === user.departmentId);
  const jurisdiction = jurisdictions.find((item) => item.id === user.jurisdictionId);
  return {
    departmentName: department?.name ?? 'Assigned department',
    departmentCode: department?.code ?? null,
    jurisdictionName: jurisdiction?.name ?? 'Assigned jurisdiction',
    jurisdictionType: jurisdiction?.type ?? null
  };
}
