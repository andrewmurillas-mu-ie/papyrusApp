import InfoBanner from '../components/InfoBanner';

const mockPages = [
    { title: 'Quarterly planning', status: 'Updated 2h ago' },
    { title: 'Research notes', status: 'Draft' },
    { title: 'Client checklist', status: 'Shared' },
];

export default function WorkspacePage() {
    return (
        <section className="page-stack">
            <div className="hero-card">
                <div>
                    <p className="eyebrow">Workspace</p>
                    <h2>Design Studio</h2>
                    <p className="muted">
                        A single solid workspace page for the current frontend stage. The
                        structure is ready for workspace data, pages, members, and chat
                        later.
                    </p>
                </div>
            </div>

            <InfoBanner
                title="Backend needed for full workspace mode"
                tone="warning"
            >
                Add workspace routes, a workspace model, membership data, and workspace
                page listing endpoints to replace these placeholders.
            </InfoBanner>

            <div className="workspace-grid">
                <aside className="panel-card">
                    <div className="panel-header">
                        <h3>Pages</h3>
                    </div>
                    <div className="list-stack">
                        {mockPages.map((page) => (
                            <button key={page.title} className="workspace-link">
                                <strong>{page.title}</strong>
                                <span>{page.status}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <article className="panel-card">
                    <div className="panel-header">
                        <h3>Workspace overview</h3>
                    </div>
                    <p className="muted">
                        This area can later show workspace description, pinned pages,
                        activity, and role-aware actions.
                    </p>

                    <div className="grid-two compact-grid">
                        <div className="mini-card">
                            <span>Members:</span>
                            <strong> 3</strong>
                        </div>
                        <div className="mini-card">
                            <span>Active pages:</span>
                            <strong> 12</strong>
                        </div>
                    </div>

                    <div className="chat-placeholder">
                        <strong>Team chat placeholder</strong>
                        <p>Needs a collaboration or comments backend later.</p>
                    </div>
                </article>
            </div>
        </section>
    );
}