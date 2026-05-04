import { FormEvent, useState } from 'react';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import {
  requestSmartSearch,
  type SmartSearchResponse,
} from '../api/aiService';

interface MockPage {
  title: string;
  status: string;
}

const mockPages: MockPage[] = [
  { title: 'Quarterly planning', status: 'Updated 2h ago' },
  { title: 'Research notes', status: 'Draft' },
  { title: 'Client checklist', status: 'Shared' },
];

export default function WorkspacePage(): React.ReactElement {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState<SmartSearchResponse | null>(
    null,
  );

  const handleSmartSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      setSearchError('Please enter a search query.');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const result = await requestSmartSearch({
        query,
        ownerId: user?._id || '',
      });

      setSearchResult(result);
    } catch (error: any) {
      setSearchError(
        error.response?.data?.error ||
          'Smart search failed. Check the backend terminal.',
      );
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Design Studio</h2>
          <p className="muted">
            A single workspace page for pages, members, chat, and AI-powered
            smart search.
          </p>
        </div>
      </div>

      <InfoBanner title="Smart Search enabled">
        Pages written in the editor are synced into MongoDB and can be searched
        here using natural-language style queries.
      </InfoBanner>

      <article className="panel-card">
        <div className="panel-header">
          <h3>AI-powered Smart Search</h3>
        </div>

        <form onSubmit={handleSmartSearch} className="page-stack">
          <label>
            Search your saved pages
            <input
              type="text"
              placeholder="Example: Find notes about boundary value testing"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <p className="muted">
            Smart Search looks through pages that have been synced from the
            editor. Try queries like “Find notes about software testing”, “Find
            notes about equivalence partitioning”, or “Find notes about project
            tasks”.
          </p>

          <button
            type="submit"
            className="primary-button"
            disabled={searchLoading}
          >
            {searchLoading ? 'Searching...' : 'Smart Search'}
          </button>
        </form>

        {searchError ? <p className="form-error">{searchError}</p> : null}

        {searchResult ? (
          <div className="page-stack" style={{ marginTop: '1rem' }}>
            <div className="mini-card">
              <span>Search summary:</span>
              <strong> {searchResult.summary}</strong>
            </div>

            <p className="muted">
              Keywords used:{' '}
              {searchResult.keywords?.length
                ? searchResult.keywords.join(', ')
                : 'None'}
            </p>

            {searchResult.results?.length ? (
              <div className="list-stack">
                {searchResult.results.map((page) => (
                  <div key={page.id} className="list-row">
                    <div>
                      <strong>{page.title}</strong>
                      <p className="muted">{page.snippet}</p>
                      <p className="muted">
                        Score: {page.score} · Updated:{' '}
                        {new Date(page.updatedAt).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No matching pages found.</p>
                <span>
                  Try writing in the editor first, wait until it says “Saved and
                  searchable”, then search again using broader keywords.
                </span>
              </div>
            )}
          </div>
        ) : null}
      </article>

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
