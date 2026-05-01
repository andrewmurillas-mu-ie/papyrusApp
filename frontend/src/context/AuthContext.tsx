import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; mode: string }>;
  loginWithToken: (token: string) => void;
  register: (form: RegisterForm) => Promise<{ ok: boolean; mode: string }>;
  logout: () => void;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const AuthContext: React.Context<AuthContextValue | null> =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement<any, any> {
  const [user, setUser] = useState<AuthUser | null>((): AuthUser | null => {
    const raw: string | null = localStorage.getItem("papyrus_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect((): void => {
    if (user) {
      localStorage.setItem("papyrus_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("papyrus_user");
    }
  }, [user]);

  const login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; mode: string }> = async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; mode: string }> => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("papyrus_token", data.token);
      setUser({
        id: "",
        name: data.user.name,
        email: data.user.email,
        avatarUrl: data.user.avatarUrl,
        createdAt: "",
        updatedAt: "",
      });
      return { ok: true, mode: "email" };
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken: (token: string) => void = (token: string): void => {
    localStorage.setItem("papyrus_token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({
      id: "",
      name: payload.name ?? "",
      email: payload.email ?? "",
      avatarUrl: payload.avatarUrl ?? "",
      createdAt: payload.createdAt ?? "",
      updatedAt: payload.updatedAt ?? "",
    });
  };

  const register: ({ name, email, password }: RegisterForm) => Promise<{
    ok: boolean;
    mode: string;
  }> = async ({
    name,
    email,
    password,
  }: RegisterForm): Promise<{ ok: true; mode: string }> => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("papyrus_token", data.token);
      setUser({
        id: "",
        name: data.user.name,
        email: data.user.email,
        avatarUrl: data.user.avatarUrl,
        createdAt: "",
        updatedAt: "",
      });
      return { ok: true, mode: "email" };
    } finally {
      setLoading(false);
    }
  };

  const logout: () => void = (): void => {
    localStorage.removeItem("papyrus_token");
    localStorage.removeItem("papyrus_user");
    setUser(null);
  };

  const value: AuthContextValue = useMemo(
    (): AuthContextValue => ({
      user,
      setUser,
      loading,
      login,
      loginWithToken,
      register,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth(): AuthContextValue {
  const context: AuthContextValue | null = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
