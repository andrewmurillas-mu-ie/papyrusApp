import { ChangeEvent, ReactElement, useState } from "react";
import { Link, NavigateFunction, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function LoginPage(): ReactElement {
  const navigate: NavigateFunction = useNavigate();
  const [params] = useSearchParams();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    params.get('error') === 'github_failed' ? 'GitHub sign-in failed. Please try again.' : ''
  );

  const onSubmit: (e: {
    preventDefault: () => void;
  }) => Promise<any> = async (e: {
    preventDefault: () => void;
  }): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.error;
      setError(message ?? "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Papyrus</p>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to continue into your workspace.</p>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Email
            <input
              id={"input_email"}
              type="email"
              value={form.email}
              onChange={(
                e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
              ): void => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              id={"input_password"}
              type="password"
              value={form.password}
              onChange={(
                e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
              ): void => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <a
          className="secondary-button"
          href="http://localhost:3000/auth/github"
        >
          Sign in with GitHub
        </a>

        <p className="muted">
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </section>
    </div>
  );
}
