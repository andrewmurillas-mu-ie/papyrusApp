import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import pageService from '../api/pageService';
import Page from '../backend_objects/Page';
import {
  requestSmartSearch,
  type SmartSearchResponse,
} from '../api/aiService';

function formatDate(value: string): string {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WorkspacePage(): React.ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pages, setPages] = useState<Page[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [pagesError, setPagesError] = useState('');

  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState<SmartSearchResponse | null>(
    null,
  );

  useEffect(() => {
    const loadPages = async () => {
      setPagesLoading(true);
      setPagesError('');

      try {
        const data = await pageService.getAll();
        setPages(Array.isArray(data) ? data : []);
      } catch (error: any) {
        setPagesError(
          error.response?.data?.error ||
            'Could not load pages from MongoDB.',
        );
      } finally {
        setPagesLoading(false);
      }
    };

    loadPages();
  }, []);

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
      <div className="hero-card hero-card--split">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Design Studio</h2>
          <p className="muted">
            View saved pages, reopen them in the editor, and search synced
            content using AI-powered Smart Search.
          </p>
        </div>

        <div className="quick-actions quick-actions--right">
          <Link className="primary-button" to="/editor">
            New page
          </Link>
        </div>
      </div>

      <InfoBanner title="Workspace pages connected">
        Pages saved from the editor are stored in MongoDB. Click a page below to
        reopen it in the editor.
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
            <span>{pagesLoading ? 'Loading...' : `${pages.length} loaded`}</span>
          </div>

          {pagesError ? <p className="form-error">{pagesError}</p> : null}

          {!pagesLoading && !pages.length && !pagesError ? (
            <div className="empty-state">
              <p>No saved pages yet.</p>
              <span>Create a new page from the editor.</span>
            </div>
          ) : null}

          <div className="list-stack">
            {pages.map((page) => (
              <button
                key={page._id}
                className="workspace-link"
                onClick={() => navigate(`/editor/${page._id}`)}
              >
                <strong>{page.title || 'Untitled page'}</strong>
                <span>Updated {formatDate(page.lastUpdate)}</span>
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
              <strong> {pages.length}</strong>
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
