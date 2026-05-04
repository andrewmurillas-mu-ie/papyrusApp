import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import { usePages } from '../context/PagesContext';
import { useWorkspace } from '../context/WorkspaceContext';
import RichTextEditor from '../components/RichTextEditor';
import pageService from '../api/pageService';
import {
  requestGrammarAssistance,
  savePageForSearch,
  type GrammarResponse,
} from '../api/aiService';

export default function EditorPage(): React.ReactElement {
  const { user } = useAuth();
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const { 
    currentPage, 
    setCurrentPage, 
    updatePage, 
    createPage,
    getRootPages,
    loading 
  } = usePages();
  const { currentWorkspace } = useWorkspace();

  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  // AI Grammar Assistance State
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState('');
  const [grammarResult, setGrammarResult] = useState<GrammarResponse | null>(null);

  // Search Sync State
  const [searchSyncStatus, setSearchSyncStatus] = useState('');
  const [searchSyncError, setSearchSyncError] = useState('');

  // Template state
  const [searchParams] = useSearchParams();
  const template = searchParams.get('template') as any;

  // Refs
  const getEditorHtmlRef = useRef<(() => string) | null>(null);
  const lastPageSyncRef = useRef<string>('');

  // Handle page selection and routing
  useEffect(() => {
    const handlePageRouting = async () => {
      if (loading) return;

      if (pageId) {
        // If pageId is provided, set it as current page
        await setCurrentPage(pageId);
      } else if (!currentPage) {
        // If no pageId and no current page, redirect to first available page
        const rootPages = getRootPages();
        if (rootPages.length > 0) {
          navigate(`/editor/${rootPages[0].id}`, { replace: true });
        } else {
          // If no pages exist, create one
          if (currentWorkspace) {
            const newPage = await createPage({ 
              title: 'Untitled', 
              content: '',
              workspaceId: currentWorkspace.id 
            });
            navigate(`/editor/${newPage.id}`, { replace: true });
          }
        }
      }
    };

    handlePageRouting();
  }, [pageId, currentPage, loading, setCurrentPage, createPage, getRootPages, navigate, currentWorkspace]);

  // Update local state when currentPage changes
  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
      setBodyHtml(currentPage.content || '');
      setLastSaved(currentPage.updatedAt);
    }
  }, [currentPage]);

  // Auto-save and search sync
  useEffect(() => {
    const interval = setInterval(async () => {
      const getHtml = getEditorHtmlRef.current;
      if (!getHtml || !currentPage) return;

      const currentHtml = getHtml();
      const syncKey = `${currentPage.id}-${currentHtml.length}`;

      if (lastPageSyncRef.current === syncKey) return;

      try {
        setPageLoading(true);
        setPageError('');

        const savedPage = await pageService.updatePage(currentPage.id, {
          title: title || 'Untitled page',
          contentHtml: currentHtml,
        });

        if (!title.trim() && savedPage.title && savedPage.title.toLowerCase() !== 'untitled page') {
          setTitle(savedPage.title);
        }

        // Save for AI search
        await savePageForSearch({
          title: savedPage.title || title || 'Untitled page',
          contentHtml: currentHtml,
          ownerId: user?._id || '',
          sourceKey: `page-${currentPage.id}`,
        });

        lastPageSyncRef.current = syncKey;
        setLastSaved(savedPage.updatedAt || new Date().toISOString());
        setSearchSyncStatus(
          `Saved and searchable ┬╖ Last synced: ${new Date().toLocaleTimeString(
            'en-GB',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          )}`,
        );
        setSearchSyncError('');
      } catch (error: any) {
        setSearchSyncError(
          error.response?.data?.error ||
            'Could not save or sync this page.',
        );
      } finally {
        setPageLoading(false);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [currentPage, title, user?._id]);

  const handleGrammarAssist = async () => {
    const getHtml = getEditorHtmlRef.current;

    if (!getHtml) {
      setGrammarError('Editor is not ready yet. Please try again.');
      return;
    }

    const currentHtml = getHtml();

    if (!currentHtml.trim()) {
      setGrammarError('Please write some text before using grammar assistance.');
      return;
    }

    setGrammarLoading(true);
    setGrammarError('');
    setGrammarResult(null);

    try {
      const result = await requestGrammarAssistance(currentHtml);
      setGrammarResult(result);
    } catch (error: any) {
      setGrammarError(
        error.response?.data?.error ||
          'Grammar assistance failed. Please check the backend terminal.',
      );
    } finally {
      setGrammarLoading(false);
    }
  };

  const handleApplyCorrectedText = () => {
    if (!grammarResult?.correctedText) return;

    setBodyHtml(grammarResult.correctedText);
    setGrammarError('');
    setSearchSyncStatus('Updated editor with corrected text. Syncing soon...');
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const formattedLastSaved = lastSaved
    ? new Date(lastSaved).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not saved yet';

  return (
    <section className="page-stack">
      <div className="hero-card hero-card--split">
        <div className="hero-copy">
          <p className="eyebrow">Editor</p>
          <h2>{currentPage ? 'Edit page' : 'New page'}</h2>
          <p className="muted">
            Write a page, check grammar, save it to workspace, and sync it for Smart Search.
          </p>
        </div>

        <div className="quick-actions quick-actions--right">
          <button
            type="button"
            className="secondary-button"
            onClick={handleGrammarAssist}
            disabled={grammarLoading}
          >
            {grammarLoading ? 'Checking grammar...' : 'Grammar Assist'}
          </button>
          <button className="secondary-button" disabled>
            Version history
          </button>
          <button className="secondary-button" disabled>
            Export
          </button>
        </div>
      </div>

      <InfoBanner title={currentPage ? 'Saved page editor' : 'New blank page'}>
        {currentPage
          ? 'This page is loaded from your workspace and autosaves back to the same page.'
          : 'Start typing to create a new page. Once saved, it can be opened again from the workspace.'}
      </InfoBanner>

      {pageError ? (
        <div className="info-banner info-banner--warning">{pageError}</div>
      ) : null}

      <article className="panel-card editor-card">
        <label>
          Page title
          <input
            type="text"
            placeholder="Untitled page"
            value={title}
            onChange={handleTitleChange}
            disabled={pageLoading}
          />
        </label>

        <RichTextEditor
          initialContent={bodyHtml}
          onReady={(getHtml: () => string) => {
            getEditorHtmlRef.current = getHtml;
          }}
        />

        {grammarError && (
          <div className="info-banner info-banner--warning">
            {grammarError}
          </div>
        )}

        {grammarResult && (
          <div className="panel-card">
            <h3>Grammar assistance result</h3>
            <p className="muted">
              Cache available: {grammarResult.cacheAvailable ? 'Yes' : 'No'} ┬╖
              Cached result: {grammarResult.cached ? 'Yes' : 'No'}
            </p>

            <label>
              Corrected text
              <textarea
                readOnly
                value={grammarResult.correctedText || ''}
                rows={5}
              />
            </label>

            <button
              type="button"
              className="primary-button"
              onClick={handleApplyCorrectedText}
              disabled={!grammarResult.correctedText}
            >
              Apply corrected text to editor
            </button>

            {grammarResult.suggestions?.length > 0 && (
              <div>
                <h4>Suggestions</h4>
                <ul>
                  {grammarResult.suggestions.map((suggestion, index) => (
                    <li key={`${suggestion.offset}-${index}`}>
                      <strong>{suggestion.shortMessage || 'Suggestion'}:</strong>{' '}
                      {suggestion.message}
                      {suggestion.replacements?.length > 0
                        ? ` Suggested: ${suggestion.replacements.join(', ')}`
                        : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="editor-footer">
          <span className="muted">Last saved: {formattedLastSaved}</span>
          <span className="muted">
            Auto-saved for user {user?.fullName || 'guest'}
            {template ? ` ┬╖ Template: ${template}` : ''}
          </span>
          <span className="muted">
            Smart search: {searchSyncStatus || 'Waiting for page content'}
          </span>
          {searchSyncError ? (
            <span className="form-error">{searchSyncError}</span>
          ) : null}
        </div>
      </article>
    </section>
  );
}
