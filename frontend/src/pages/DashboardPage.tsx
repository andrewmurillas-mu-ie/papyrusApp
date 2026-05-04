import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userService from '../api/userService';
import { useAuth } from '../context/AuthContext';
import { usePages } from '../context/PagesContext';
import InfoBanner from '../components/InfoBanner';

interface User {
    _id: string;
    fullName: string;
    email: string;
    githubId: string;
    avatarUrl: string;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
}

const formatDate = (value: string | undefined): string => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function DashboardPage(): React.ReactElement {
    const { user } = useAuth();
    const { pages, loading: pagesLoading } = usePages();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await userService.getAll();
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
        if (!user?._id) return 0;
        const aIsCurrent = a._id === user._id;
        const bIsCurrent = b._id === user._id;
        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;
        return 0;
    });

    // Get recent pages (sorted by updatedAt, limited to 5)
    const recentPages = [...pages]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    return (
        <section className="page-stack">
            {/* hero card with content left, buttons right-middle */}
            <div className="hero-card hero-card--split">
                <div className="hero-copy">
                    <p className="eyebrow">Dashboard</p>
                    <h2>Hello, {user?.fullName || 'there'}</h2>
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
                                    alt={user?.fullName || 'User avatar'}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: 'inherit',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                (user?.fullName?.[0] || 'U')
                            )}
                        </div>
                        <div>
                            <h3>{user?.fullName || 'Papyrus User'}</h3>
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
                        <span>{pagesLoading ? 'Loading...' : `${recentPages.length} pages`}</span>
                    </div>
                    {pagesLoading ? (
                        <div className="empty-state">
                            <p>Loading recent pages...</p>
                        </div>
                    ) : recentPages.length === 0 ? (
                        <div className="empty-state">
                            <p>No recent pages yet.</p>
                            <span>
                Create your first page to get started with the "New Page" button in the sidebar.
              </span>
                            <div style={{ marginTop: '1rem' }}>
                                <Link className="primary-button" to="/editor">
                                    Create First Page
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="list-stack">
                            {recentPages.map((page) => (
                                <Link
                                    key={page.id}
                                    to={`/editor/${page.id}`}
                                    className="list-row"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="avatar-circle">
                                        {page.icon || '📄'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                                            {page.title}
                                        </strong>
                                        <p className="muted" style={{ fontSize: '12px', margin: 0 }}>
                                            Updated {formatDate(page.updatedAt)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
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
                        const isCurrent = user?._id && item._id === user._id;
                        return (
                            <div
                                key={`${item.email}-${index}`}
                                className="list-row"
                                style={
                                    isCurrent ? { borderColor: 'var(--primary)' } : undefined
                                }
                            >
                                <div className="avatar-circle">
                                    {item.fullName?.[0] || 'U'}
                                </div>
                                <div>
                                    <strong>{item.fullName}</strong>
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
