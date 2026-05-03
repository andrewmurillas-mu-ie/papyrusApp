import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../api/userService';
import { useAuth } from '../context/AuthContext';
import InfoBanner from '../components/InfoBanner';

const formatDate = (value) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(Array.isArray(data) ? data : []);
            } catch {
                setError(
                    'Could not load users from the backend. Check the API server and MongoDB connection.',
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        if (!user?.id) return 0;
        const aIsCurrent = a._id === user.id;
        const bIsCurrent = b._id === user.id;
        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;
        return 0;
    });

    return (
        <section className="page-stack">
            {/* hero card with content left, buttons right-middle */}
            <div className="hero-card hero-card--split">
                <div className="hero-copy">
                    <p className="eyebrow">Dashboard</p>
                    <h2>Hello, {user?.name || 'there'}</h2>
                    <p className="muted">
                        This is the current frontend base for Papyrus. It uses the existing
                        user API and leaves workspace features ready for later.
                    </p>
                </div>

                <div className="quick-actions quick-actions--right">
                    <Link className="primary-button" to="/workspace">
                        Open workspace
                    </Link>
                    <Link className="secondary-button" to="/templates">
                        Browse templates
                    </Link>
                </div>
            </div>

            <InfoBanner title="Backend integration status">
                User accounts are live and connected to MongoDB. Workspaces, pages,
                templates, versions, and AI actions are still frontend-only
                placeholders.
            </InfoBanner>

            <div className="grid-two">
                <article className="panel-card">
                    <div className="panel-header">
                        <h3>Current user</h3>
                    </div>

                    <div className="settings-header" style={{ marginBottom: '1rem' }}>
                        <div className="avatar-large">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user?.name || 'User avatar'}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: 'inherit',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                (user?.name?.[0] || 'U')
                            )}
                        </div>
                        <div>
                            <h3>{user?.name || 'Papyrus User'}</h3>
                            <p className="muted">
                                {user?.email || 'GitHub-connected user'}
                            </p>
                        </div>
                    </div>

                    <div className="detail-list">
                        <div>
                            <span>Joined</span>
                            <strong>{formatDate(user?.createdAt)}</strong>
                        </div>
                        <div>
                            <span>Last updated</span>
                            <strong>{formatDate(user?.updatedAt)}</strong>
                        </div>
                    </div>
                </article>

                <article className="panel-card">
                    <div className="panel-header">
                        <h3>Recent pages</h3>
                    </div>
                    <div className="empty-state">
                        <p>No recent pages yet.</p>
                        <span>
              Add page routes and a pages collection to replace this
              placeholder.
            </span>
                    </div>
                </article>
            </div>

            <article className="panel-card">
                <div className="panel-header">
                    <h3>Users from backend</h3>
                    <span>{loading ? 'Loading...' : `${users.length} loaded`}</span>
                </div>

                {error ? <p className="form-error">{error}</p> : null}

                {!loading && !users.length && !error ? (
                    <div className="empty-state">
                        <p>No users in the database yet.</p>
                        <span>
              Create one through the backend or use Settings later when update
              flows are finalized.
            </span>
                    </div>
                ) : null}

                <div className="list-stack">
                    {sortedUsers.map((item, index) => {
                        const isCurrent = user?.id && item._id === user.id;
                        return (
                            <div
                                key={`${item.email}-${index}`}
                                className="list-row"
                                style={
                                    isCurrent ? { borderColor: 'var(--primary)' } : undefined
                                }
                            >
                                <div className="avatar-circle">
                                    {item.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <strong>{item.name}</strong>
                                    <p className="muted">{item.email || 'No email set'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </article>
        </section>
    );
}