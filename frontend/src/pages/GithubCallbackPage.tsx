import { ReactElement, useEffect } from "react";
import {
  NavigateFunction,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import useAuth from "../context/AuthContext.tsx";

export default function GithubCallbackPage(): ReactElement {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate: NavigateFunction = useNavigate();

  useEffect((): void => {
    const token: string | null = params.get("token");
    if (token) {
      loginWithToken(token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login?error=github_failed", { replace: true });
    }
  }, []);

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <p className="muted">Completing GitHub sign-in…</p>
      </section>
    </div>
  );
}
