import { useEffect, useState } from 'react';
import { userService } from '../api/userService';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
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

    useEffect(() => {
        if (user) {
            setProfile((current) => ({
                ...current,
                name: user.name || '',
                email: user.email || '',
                avatarUrl: user.avatarUrl || '',
                createdAt: user.createdAt || '',
                updatedAt: user.updatedAt || '',
            }));
        }
    }, [user]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        try {
            if (!user?.id) {
                setUser({
                    ...user,
                    ...profile,
                    updatedAt: new Date().toISOString(),
                });
                setStatus({
                    loading: false,
                    error: '',
                    success: 'Saved locally.',
                });
                return;
            }

            const payload = {
                name: profile.name,
                email: profile.email,
                avatarUrl: profile.avatarUrl,
                createdAt: profile.createdAt,
                updatedAt: new Date().toISOString(),
            };

            const updated = await userService.updateUser(user.id, payload);

            setUser(updated);
            setStatus({
                loading: false,
                error: '',
                success: 'Profile saved.',
            });
        } catch (err) {
            setStatus({
                loading: false,
                error: 'Could not save profile. Please try again.',
                success: '',
            });
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <section className="page-stack">
            <div className="hero-card">
                <div>
                    <p className="eyebrow">Settings</p>
                    <h2>Profile and preferences</h2>
                    <p className="muted">
                        Manage your account details and app preferences.
                    </p>
                </div>
            </div>

            <div className="grid-settings">
                <form className="panel-card form-grid" onSubmit={onSubmit}>
                    <div className="settings-header">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.name}
                                className="avatar-large"
                                style={{
                                    objectFit: 'cover',
                                    borderRadius: '18px',
                                }}
                            />
                        ) : (
                            <div className="avatar-large">
                                {profile.name?.[0] || 'P'}
                            </div>
                        )}
                        <div>
                            <h3>Profile</h3>
                            <p className="muted">
                                Update your name, email, and avatar.
                            </p>
                        </div>
                    </div>

                    <label>
                        Full name
                        <input
                            value={profile.name}
                            onChange={(e) =>
                                setProfile({ ...profile, name: e.target.value })
                            }
                        />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile({ ...profile, email: e.target.value })
                            }
                        />
                    </label>

                    <label>
                        Avatar URL
                        <input
                            value={profile.avatarUrl}
                            onChange={(e) =>
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
                                <span>Joined</span>
                                <strong>{formatDate(profile.createdAt)}</strong>
                            </div>
                            <div>
                                <span>Last updated</span>
                                <strong>{formatDate(profile.updatedAt)}</strong>
                            </div>
                        </div>
                    </article>

                    <article className="panel-card">
                        <div className="panel-header">
                            <h3>Export and backup</h3>
                        </div>
                        <button className="secondary-button" disabled>
                            Request export
                        </button>
                        <p className="muted">
                            Export your data when backup features are ready.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}