import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthContextValue, AuthSession, LoginCredentials } from '../types/auth';
import * as authService from '../services/auth.service';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = authService.getSession();
    setSession(existingSession);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newSession = await authService.login(credentials);
      if (newSession) {
        setSession(newSession);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // MVP: validate but can't actually change env password
    return authService.validatePasswordChange(currentPassword, newPassword);
  }, []);

  const value: AuthContextValue = {
    session,
    isAuthenticated: session?.isAuthenticated ?? false,
    isSuspended: false,
    planTier: 'pro', // Give full access to the single shop
    isLoading,
    login,
    logout,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
