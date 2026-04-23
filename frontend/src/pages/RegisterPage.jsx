import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoBanner from '../components/InfoBanner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register(form);
      navigate('/dashboard');
    } catch {
      setError(
        'Registration failed. Wire this form to backend auth when routes are added.',
      );
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Papyrus</p>
          <h1>Create your workspace account</h1>
          <p className="muted">Start simple now and connect full auth later.</p>
        </div>

        <InfoBanner title="Needs backend auth routes" tone="warning">
          To make this page real, add routes such as POST /auth/register and
          POST /auth/login, plus password hashing and token issuing.
        </InfoBanner>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Jane Doe"
            />
          </label>

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
              placeholder="Create password"
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Confirm password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="muted">
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </section>
    </div>
  );
}