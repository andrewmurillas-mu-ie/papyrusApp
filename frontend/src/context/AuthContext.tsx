import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; mode?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ ok: boolean; mode?: string }>;
  loginWithGithubToken: (token: string) => { ok: boolean; mode?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to decode JWT payload (no verification, just reading data)
const decodeJwt = (token: string): any => {
  try {
    const [, payloadBase64] = token.split('.');
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
    );
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('papyrus_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('papyrus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('papyrus_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ ok: boolean; mode?: string }> => {
    setLoading(true);
    try {
      const demoUser: User = {
        id: 'local-demo-user',
        name: 'Papyrus User',
        email,
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('papyrus_token', `local-dev-token:${password.length}`);
      setUser(demoUser);
      return { ok: true, mode: 'placeholder' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }: { name: string; email: string; password: string }): Promise<{ ok: boolean; mode?: string }> => {
    setLoading(true);
    try {
      const newUser: User = {
        id: 'local-demo-user',
        name,
        email,
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('papyrus_token', `local-dev-token:${password.length}`);
      setUser(newUser);
      return { ok: true, mode: 'placeholder' };
    } finally {
      setLoading(false);
    }
  };

  // New: handle GitHub login using the JWT from backend
  const loginWithGithubToken = (token: string): { ok: boolean; mode?: string } => {
    console.log('[AuthContext] Processing GitHub token:', token.substring(0, 50) + '...');
    const payload = decodeJwt(token);
    console.log('[AuthContext] Decoded payload:', payload);
    if (!payload) {
      console.log('[AuthContext] Failed to decode token');
      return { ok: false };
    }

    const githubUser: User = {
      id: payload.id,
      name: payload.fullName,
      email: payload.email || `${payload.githubId}@github.local`, // Fallback email
      avatarUrl: payload.avatarUrl || '',
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString(),
      role: payload.role,
    };

    localStorage.setItem('papyrus_token', token);
    setUser(githubUser);
    return { ok: true, mode: 'github' };
  };

  const logout = () => {
    localStorage.removeItem('papyrus_token');
    localStorage.removeItem('papyrus_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      register,
      loginWithGithubToken,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
