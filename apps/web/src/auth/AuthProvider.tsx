import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentUser, getOrganizationContext, loginRequest, type OrganizationContext } from '../api/auth.api';
import { setUnauthorizedHandler } from '../api/client';
import type { SafeUser } from '../types/api';

export type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated';
export interface AuthContextValue {
  user: SafeUser | null;
  token: string | null;
  organization: OrganizationContext | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  sessionMessage: string | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [organization, setOrganization] = useState<OrganizationContext | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const clearAuthentication = useCallback((message: string | null = null) => {
    setToken(null);
    setUser(null);
    setOrganization(null);
    setAuthStatus('unauthenticated');
    setSessionMessage(message);
  }, []);

  useEffect(() => setUnauthorizedHandler(() => {
    clearAuthentication('Your session expired. Please sign in again.');
  }), [clearAuthentication]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthStatus('authenticating');
    setSessionMessage(null);
    try {
      const result = await loginRequest(email, password);
      const authoritativeUser = await getCurrentUser(result.accessToken);
      const authoritativeOrganization = await getOrganizationContext(authoritativeUser, result.accessToken);
      setToken(result.accessToken);
      setUser(authoritativeUser);
      setOrganization(authoritativeOrganization);
      setAuthStatus('authenticated');
    } catch (error) {
      clearAuthentication();
      throw error;
    }
  }, [clearAuthentication]);

  const logout = useCallback(() => clearAuthentication(), [clearAuthentication]);
  const value = useMemo<AuthContextValue>(() => ({
    user, token, organization, authStatus, sessionMessage,
    isAuthenticated: authStatus === 'authenticated' && Boolean(user && token),
    login, logout
  }), [authStatus, login, logout, organization, sessionMessage, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
