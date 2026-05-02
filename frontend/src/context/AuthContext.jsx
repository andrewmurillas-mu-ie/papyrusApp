import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// Helper to decode JWT payload (no verification, just reading data)
const decodeJwt = (token) => {
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
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

  const login = async (email, password) => {
    setLoading(true);
    try {
      const demoUser = {
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

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const newUser = {
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
  const loginWithGithubToken = (token) => {
    const payload = decodeJwt(token);
    if (!payload) {
      return { ok: false };
    }

    const githubUser = {
      id: payload._id || payload.id || payload.userId || payload.githubId,
      name: payload.name,
      email: payload.email || '',
      avatarUrl: payload.avatarUrl || '',
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}