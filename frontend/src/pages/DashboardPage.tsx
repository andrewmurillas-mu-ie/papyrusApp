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
                            <h3>Loading Pages</h3>
                            <p>Your pages are being loaded...</p>
                        </div>
                    ) : recentPages.length === 0 ? (
                        <div className="empty-state">
                            <h3>No Pages Yet</h3>
                            <p>Create your first page to get started with Papyrus!</p>
                            <Link to="/editor" className="primary-button">
                                Create First Page
                            </Link>
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {recentPages.map((page) => (
                                <li key={page.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                    <Link to={`/editor/${page.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{page.title}</strong>
                                                {page.icon && <span style={{ marginLeft: '8px' }}>{page.icon}</span>}
                                                {page.workspaceId ? (
                                                    <small style={{ marginLeft: '8px', color: '#666' }}>• Workspace</small>
                                                ) : (
                                                    <small style={{ marginLeft: '8px', color: '#666' }}>• Personal</small>
                                                )}
                                            </div>
                                            <small style={{ color: '#666' }}>
                                                {new Date(page.updatedAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>
            </div>

            <div className="panel-card">
                <h2>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/editor" className="secondary-button">
                        Create New Page
                    </Link>
                    <Link to="/templates" className="secondary-button">
                        Browse Templates
                    </Link>
                    <Link to="/workspace" className="secondary-button">
                        Manage Workspace
                    </Link>
                </div>
            </div>

            <div className="panel-card">
                <h2>Page Statistics</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>Total Pages</span>
                    <strong>{pages.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>Personal Pages</span>
                    <strong>{pages.filter(p => !p.workspaceId).length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Workspace Pages</span>
                    <strong>{pages.filter(p => p.workspaceId).length}</strong>
                </div>
            </div>

            <div className="panel-card">
                <h2>Users from backend</h2>
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
            ) : (
                <div className="panel-card">
                    <h2>Users from backend</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sortedUsers.map((item) => (
                            <div key={item._id} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <strong>{item.fullName}</strong>
                                <p className="muted">{item.email || 'No email set'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
