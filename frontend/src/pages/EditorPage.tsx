import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import pageService from '../api/pageService';
import {
  requestGrammarAssistance,
  savePageForSearch,
  type GrammarResponse,
} from '../api/aiService';

type Template = 'meeting-notes' | 'project-brief' | 'study-tracker' | '';

function getInitialContent(template: Template): string {
  switch (template) {
    case 'meeting-notes':
      return (
        '<h1>Meeting notes</h1>' +
        '<p><strong>Agenda</strong></p>' +
        '<ul><li></li></ul>' +
        '<p><strong>Notes</strong></p>' +
        '<ul><li></li></ul>' +
        '<p><strong>Action items</strong></p>' +
        '<ul><li></li></ul>'
      );
    case 'project-brief':
      return (
        '<h1>Project brief</h1>' +
        '<p><strong>Scope</strong></p><p></p>' +
        '<p><strong>Goals</strong></p><p></p>' +
        '<p><strong>Milestones</strong></p><p></p>' +
        '<p><strong>Owners</strong></p><p></p>'
      );
    case 'study-tracker':
      return (
        '<h1>Study tracker</h1>' +
        '<p><strong>Topic</strong></p><p></p>' +
        '<p><strong>Deadline</strong></p><p></p>' +
        '<p><strong>Revision blocks</strong></p><p></p>'
      );
    default:
      return '';
  }
}

function escapeHtmlForEditor(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function plainTextToEditorHtml(text: string): string {
  const paragraphs = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return '<p></p>';
  }

  return paragraphs
    .map((paragraph) => `<p>${escapeHtmlForEditor(paragraph)}</p>`)
    .join('');
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function EditorPage(): React.ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pageId } = useParams();
  const [searchParams] = useSearchParams();
  const template = (searchParams.get('template') as Template) || '';

  const [currentPageId, setCurrentPageId] = useState(pageId || '');
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarResponse | null>(null);
  const [grammarError, setGrammarError] = useState('');
  const [searchSyncStatus, setSearchSyncStatus] = useState('');
  const [searchSyncError, setSearchSyncError] = useState('');

  const getEditorHtmlRef = useRef<(() => string) | null>(null);
  const lastPageSyncRef = useRef('');

  useEffect(() => {
    const loadPage = async () => {
      setPageError('');
      setGrammarResult(null);
      setGrammarError('');
      setSearchSyncStatus('');
      setSearchSyncError('');
      lastPageSyncRef.current = '';

      if (!pageId) {
        setCurrentPageId('');
        setTitle('');
        setBodyHtml(getInitialContent(template));
        setLastSaved('');
        return;
      }

      setPageLoading(true);

      try {
        const page = await pageService.getPageById(pageId);
        setCurrentPageId(page._id);
        setTitle(page.title || '');
        setBodyHtml(page.contentHtml || '');
        setLastSaved(page.lastUpdate || '');
      } catch (error: any) {
        setPageError(
          error.response?.data?.error ||
            'Could not load this page. Check that you have access to it.',
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [pageId, template]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const getHtml = getEditorHtmlRef.current;

      if (!getHtml || !user?._id) return;

      const currentHtml = getHtml();
      const plainText = htmlToPlainText(currentHtml);

      if (!plainText) return;

      const syncKey = `${currentPageId || 'new'}|${title || 'Untitled page'}|${currentHtml}`;

      if (lastPageSyncRef.current === syncKey) return;

      try {
        setSearchSyncStatus('Saving page...');

        const pagePayload = {
          title: title || 'Untitled page',
          contentHtml: currentHtml,
        };

        const savedPage = currentPageId
          ? await pageService.updatePage(currentPageId, pagePayload)
          : await pageService.createPage(pagePayload);

        const savedPageId = savedPage._id;

        if (!currentPageId) {
          setCurrentPageId(savedPageId);
          navigate(`/editor/${savedPageId}`, { replace: true });
        }

        if (
          !title.trim() &&
          savedPage.title &&
          savedPage.title.toLowerCase() !== 'untitled page'
        ) {
          setTitle(savedPage.title);
        }

        await savePageForSearch({
          title: savedPage.title || title || 'Untitled page',
          contentHtml: currentHtml,
          ownerId: user._id,
          sourceKey: `page-${savedPageId}`,
        });

        lastPageSyncRef.current = syncKey;
        setLastSaved(savedPage.lastUpdate || new Date().toISOString());
        setSearchSyncStatus(
          `Saved and searchable · Last synced: ${new Date().toLocaleTimeString(
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
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [currentPageId, title, user?._id, navigate]);

  const handleGrammarAssist = async () => {
    const getHtml = getEditorHtmlRef.current;

    if (!getHtml) {
      setGrammarError('Editor is not ready yet. Please try again.');
      return;
    }

    const currentHtml = getHtml();

    if (!htmlToPlainText(currentHtml)) {
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

    const nextHtml = plainTextToEditorHtml(grammarResult.correctedText);
    const savedAt = new Date().toISOString();

    setBodyHtml(nextHtml);
    setLastSaved(savedAt);
    setGrammarError('');
    setSearchSyncStatus('Updated editor with corrected text. Syncing soon...');
  };

  const formattedLastSaved = lastSaved
    ? new Date(lastSaved).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not saved yet';

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <section className="page-stack">
      <div className="hero-card hero-card--split">
        <div className="hero-copy">
          <p className="eyebrow">Editor</p>
          <h2>{currentPageId ? 'Edit page' : 'New page'}</h2>
          <p className="muted">
            Write a page, check grammar, save it to MongoDB, and sync it for
            Smart Search.
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

      <InfoBanner title={currentPageId ? 'Saved page editor' : 'New blank page'}>
        {currentPageId
          ? 'This page is loaded from MongoDB and autosaves back to the same page.'
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
              Cache available: {grammarResult.cacheAvailable ? 'Yes' : 'No'} ·
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
            {template ? ` · Template: ${template}` : ''}
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
