import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import { requestGrammarAssistance, savePageForSearch } from '../api/aiService';

function getInitialContent(template) {
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

function escapeHtmlForEditor(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function plainTextToEditorHtml(text) {
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

export default function EditorPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const template = searchParams.get('template') || '';

  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState(null);
  const [grammarError, setGrammarError] = useState('');
  const [searchSyncStatus, setSearchSyncStatus] = useState('');
  const [searchSyncError, setSearchSyncError] = useState('');

  // holds a function we can call to get current HTML from Tiptap
  const getEditorHtmlRef = useRef(null);
  const lastSearchSyncRef = useRef('');

  const storageKey = user
    ? `papyrus_editor_${user.id}_${template || 'default'}`
    : `papyrus_editor_guest_${template || 'default'}`;

  // Load from localStorage or template
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTitle(parsed.title || '');
        setBodyHtml(parsed.bodyHtml || '');
        setLastSaved(parsed.lastSaved || '');
        return;
      } catch {
        /* fall back to template */
      }
    }

    setTitle('');
    setBodyHtml(getInitialContent(template));
    setLastSaved('');
  }, [storageKey, template]);

  // Autosave every 2 seconds while on this page (read-only from editor)
  useEffect(() => {
    const interval = setInterval(() => {
      const getHtml = getEditorHtmlRef.current;
      if (!getHtml) return;

      const currentHtml = getHtml();

      const payload = {
        title,
        bodyHtml: currentHtml,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSaved(payload.lastSaved);
    }, 2000);

    return () => clearInterval(interval);
  }, [title, storageKey]);

  const handleGrammarAssist = async () => {
    const getHtml = getEditorHtmlRef.current;

    if (!getHtml) {
      setGrammarError('Editor is not ready yet. Please try again.');
      return;
    }

    const currentHtml = getHtml();

    if (!currentHtml || currentHtml.trim() === '<p></p>') {
      setGrammarError('Please write some text before using grammar assistance.');
      return;
    }

    setGrammarLoading(true);
    setGrammarError('');
    setGrammarResult(null);

    try {
      const result = await requestGrammarAssistance(currentHtml);
      setGrammarResult(result);
    } catch (error) {
      setGrammarError(
        error.response?.data?.error ||
          'Grammar assistance failed. Please check the backend terminal.',
      );
    } finally {
      setGrammarLoading(false);
    }
  };

  // Auto-sync editor content to MongoDB so it can be found by Smart Search
  useEffect(() => {
    const interval = setInterval(async () => {
      const getHtml = getEditorHtmlRef.current;

      if (!getHtml || !user?.id) return;

      const currentHtml = getHtml();
      const plainText = currentHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!plainText) return;

      const syncKey = `${title || 'Untitled page'}|${currentHtml}`;

      if (lastSearchSyncRef.current === syncKey) return;

      try {
        setSearchSyncStatus('Syncing page...');

        await savePageForSearch({
          title: title || 'Untitled page',
          contentHtml: currentHtml,
          ownerId: user.id,
          sourceKey: `editor-${user.id}-${template || 'default'}`,
        });

        lastSearchSyncRef.current = syncKey;
        setSearchSyncStatus(
          `Saved and searchable · Last synced: ${new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        );
        setSearchSyncError('');
      } catch (error) {
        setSearchSyncError(
          error.response?.data?.error ||
            'Could not sync this page for smart search.',
        );
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [title, template, user?.id]);

  const handleApplyCorrectedText = () => {
    if (!grammarResult?.correctedText) return;

    const nextHtml = plainTextToEditorHtml(grammarResult.correctedText);
    const savedAt = new Date().toISOString();

    setBodyHtml(nextHtml);
    setLastSaved(savedAt);
    setGrammarError('');
    setSearchSyncStatus('Updated editor with corrected text. Syncing soon...');

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        title,
        bodyHtml: nextHtml,
        lastSaved: savedAt,
      }),
    );
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
          <h2>Page editor</h2>
          <p className="muted">
            This editor keeps your work in this browser and can be prefilled
            from templates. Later you can connect it to real pages and versions.
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

      <InfoBanner title="Local-only editor" tone="warning">
        Content is auto-saved to this browser only. Wire this up to a real page
        API when you are ready for backend persistence and collaboration.
      </InfoBanner>

      <article className="panel-card editor-card">
        <label>
          Page title
          <input
            type="text"
            placeholder="Untitled page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <RichTextEditor
          initialContent={bodyHtml}
          onReady={(getHtml) => {
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
            Auto-saved for user {user?.name || 'guest'}
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