
import type { AuthSession, LoginCredentials } from '../types/auth';
import { SESSION_KEY, SESSION_DURATION_MS } from '../utils/constants';

/**
 * Auth Service - Custom Multi-Shop Authentication
 */

export function getSession(): AuthSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      destroySession();
      return null;
    }

    return session;
  } catch {
    destroySession();
    return null;
  }
}

export function destroySession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

const PRINTIFY_ID = import.meta.env.VITE_PRINTIFY_ID || 'PRINTIFY-001';
const PRINTIFY_PASSWORD = import.meta.env.VITE_PRINTIFY_PASSWORD || 'admin';

function generateToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `admin_${timestamp}_${random}`;
}

export async function login(credentials: LoginCredentials): Promise<AuthSession | null> {
  try {
    if (credentials.printifyId === PRINTIFY_ID && credentials.password === PRINTIFY_PASSWORD) {
      const adminSession: AuthSession = {
        isAuthenticated: true,
        role: 'admin',
        printifyId: credentials.printifyId,
        token: generateToken(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(adminSession));
      return adminSession;
    } else {
      console.error('Invalid credentials');
      return null;
    }
  } catch (err) {
    console.error('Login exception:', err);
    return null;
  }
}

export function logout(): void {
  destroySession();
}

export async function validatePasswordChange(_currentPassword: string, _newPassword: string): Promise<boolean> {
  // In a real implementation, you'd add another RPC function to change password
  // For now, this is a placeholder
  return false;
}
