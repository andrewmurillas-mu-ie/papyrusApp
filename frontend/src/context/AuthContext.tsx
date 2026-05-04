import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  githubId: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; mode?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ ok: boolean; mode?: string }>;
  loginWithGithubToken: (token: string) => Promise<{ ok: boolean; mode?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const decodeJwt = (token: string): any => {
  try {
    const [, payloadBase64] = token.split('.');
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('papyrus_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem('papyrus_user');
      }
    }
    setLoading(false);
  }, []);

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
        _id: 'demo-user',
        fullName: email.split('@')[0],
        email,
        githubId: 'demo-github-id',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'user',
      };
      localStorage.setItem('papyrus_token', `local-dev-token:${password.length}`);
      setUser(demoUser);
      return { ok: true, mode: 'placeholder' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ ok: boolean; mode?: string }> => {
    setLoading(true);
    try {
      const newUser: User = {
        _id: 'local-demo-user',
        fullName: name,
        email,
        githubId: 'local-demo-github-id',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'user',
      };
      localStorage.setItem('papyrus_token', `local-dev-token:${password.length}`);
      setUser(newUser);
      return { ok: true, mode: 'placeholder' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithubToken = async (token: string): Promise<{ ok: boolean; mode?: string }> => {
    const payload = decodeJwt(token);
    if (!payload) return { ok: false };

    const githubUser: User = {
      _id: payload._id,
      fullName: payload.fullName,
      email: payload.email || `${payload.githubId}@github.local`,
      githubId: payload.githubId,
      avatarUrl: payload.avatarUrl || '',
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString(),
      role: payload.role || 'user',
    };

    localStorage.setItem('papyrus_token', token);
    localStorage.setItem('papyrus_user', JSON.stringify(githubUser));
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