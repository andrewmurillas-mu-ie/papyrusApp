import { ReactElement, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function GitHubCallbackPage(): ReactElement {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect((): void => {
    const token = params.get("token");
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
