import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

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

export default function EditorPage(): React.ReactElement {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const template = (searchParams.get('template') as Template) || '';

    const [title, setTitle] = useState('');
    const [bodyHtml, setBodyHtml] = useState('');
    const [lastSaved, setLastSaved] = useState('');

    // holds a function we can call to get current HTML from Tiptap
    const getEditorHtmlRef = useRef<(() => string) | null>(null);

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
                    <h2>Page editor</h2>
                    <p className="muted">
                        This editor keeps your work in this browser and can be prefilled
                        from templates. Later you can connect it to real pages and versions.
                    </p>
                </div>

                <div className="quick-actions quick-actions--right">
                    <button className="secondary-button" disabled>
                        AI summary
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
                        onChange={handleTitleChange}
                    />
                </label>

                <RichTextEditor
                    initialContent={bodyHtml}
                    onReady={(getHtml: () => string) => {
                        getEditorHtmlRef.current = getHtml;
                    }}
                />

                <div className="editor-footer">
                    <span className="muted">Last saved: {formattedLastSaved}</span>
                    <span className="muted">
            Auto-saved for user {user?.name || 'guest'}
                        {template ? ` · Template: ${template}` : ''}
          </span>
                </div>
            </article>
        </section>
    );
}
