import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoBanner from '../components/InfoBanner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch {
      setError(
        'Login failed. Replace this with the backend auth flow once available.',
      );
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

        <InfoBanner title="Current backend status">
          The backend currently exposes user CRUD. Email/password login is not
          available yet, so this screen uses placeholder local auth.
        </InfoBanner>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Enter password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="muted">
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </section>
    </div>
  );
}