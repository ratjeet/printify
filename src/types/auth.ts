// Auth session state
export interface AuthSession {
  isAuthenticated: boolean;
  role: 'admin' | 'shop_owner';
  printifyId: string;
  shopId?: string; // Optional because Admin doesn't have a shopId
  token: string;
  expiresAt: number;
}

// Login credentials
export interface LoginCredentials {
  printifyId: string;
  password: string;
}

// Auth context value
export interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isSuspended: boolean;
  planTier: 'free' | 'pro';
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}
