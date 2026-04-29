import React, {ChangeEvent, ReactElement, useEffect, useState} from 'react';
import { userService } from '../api/userService';
import { useAuth } from '../context/AuthContext.tsx';
import InfoBanner from '../components/InfoBanner';

export default function SettingsPage(): ReactElement {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    createdAt: '',
    updatedAt: '',
  });
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  interface Profile {
    name: string;
    email: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
  }

  useEffect((): void => {
    if (user) {
      setProfile((current: Profile): Profile => ({
        ...current,
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || '',
      }));
    }
  }, [user]);

  const onSubmit: (e: {
    preventDefault: () => void;
  }) => Promise<void> = async (e: { preventDefault: () => void; }): Promise<void> => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    if (!user?.id || user.id === 'local-demo-user') {
      const updated = {
        id: user?.id ?? 'local-demo-user',
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      setUser(updated);
      setStatus({
        loading: false,
        error: '',
        success:
          'Saved locally. Replace with backend update once authenticated user IDs are available.',
      });
      return;
    }

    try {
      const payload = { ...profile, updatedAt: new Date().toISOString() };
      await userService.updateUser(user.id, payload);
      setUser({...user, ...payload});
      setStatus({
        loading: false,
        error: '',
        success: 'Profile updated successfully.',
      });
    } catch {
      setStatus({
        loading: false,
        error:
          'Profile update failed. Confirm the backend user id and payload shape.',
        success: '',
      });
    }
  };

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Profile and preferences</h2>
          <p className="muted">
            This is the most complete page in the current frontend stage and is
            structured to connect to your user backend first.
          </p>
        </div>
      </div>

      <InfoBanner title="Current backend fit">
        User CRUD exists, so this page is prepared for user profile integration.
        A current-user auth endpoint and real authenticated session will improve
        it later.
      </InfoBanner>

      <div className="grid-settings">
        <form className="panel-card form-grid" onSubmit={onSubmit}>
          <div className="settings-header">
            <div className="avatar-large">
              {profile.name?.[0] || 'P'}
            </div>
            <div>
              <h3>Profile</h3>
              <p className="muted">
                Edit the information currently available in the user model.
              </p>
            </div>
          </div>

          <label>
            Full name
            <input
              value={profile.name}
              onChange={(e: ChangeEvent<HTMLInputElement, HTMLInputElement>): void =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(e: ChangeEvent<HTMLInputElement, HTMLInputElement>): void =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </label>

          <label>
            Avatar URL
            <input
              value={profile.avatarUrl}
              onChange={(e: ChangeEvent<HTMLInputElement, HTMLInputElement>): void =>
                setProfile({ ...profile, avatarUrl: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
            />
          </label>

          {status.error ? (
            <p className="form-error">{status.error}</p>
          ) : null}
          {status.success ? (
            <p className="form-success">{status.success}</p>
          ) : null}

          <button
            className="primary-button"
            type="submit"
            disabled={status.loading}
          >
            {status.loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <div className="settings-column">
          <article className="panel-card">
            <div className="panel-header">
              <h3>Account</h3>
            </div>
            <div className="detail-list">
              <div>
                <span>Created</span>
                <strong>{profile.createdAt || 'Not available yet'}</strong>
              </div>
              <div>
                <span>Updated</span>
                <strong>{profile.updatedAt || 'Not available yet'}</strong>
              </div>
            </div>
          </article>

          <article className="panel-card">
            <div className="panel-header">
              <h3>Preferences</h3>
            </div>
            <div className="toggle-row">
              <span>Compact layout</span>
              <input type="checkbox" disabled />
            </div>
            <div className="toggle-row">
              <span>Email notifications</span>
              <input type="checkbox" disabled />
            </div>
            <p className="muted">
              Needs a preferences backend field or separate preferences
              collection later.
            </p>
          </article>

          <article className="panel-card">
            <div className="panel-header">
              <h3>Export and backup</h3>
            </div>
            <button className="secondary-button" disabled>
              Request export
            </button>
            <p className="muted">
              Add an export endpoint and file generation flow when backup
              features are ready.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}