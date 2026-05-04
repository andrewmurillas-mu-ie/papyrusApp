import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePages } from '../context/PagesContext';
import RichTextEditor from '../components/RichTextEditor';

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

    const [title, setTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [lastSaved, setLastSaved] = useState('');

    // holds a function we can call to get current HTML from Tiptap
    const getEditorHtmlRef = useRef<(() => string) | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                    const newPage = await createPage({ title: 'Untitled', content: '' });
                    navigate(`/editor/${newPage.id}`, { replace: true });
                }
            }
        };

        handlePageRouting();
    }, [pageId, currentPage, loading, setCurrentPage, createPage, getRootPages, navigate]);

    // Update local state when currentPage changes
    useEffect(() => {
        if (currentPage) {
            setTitle(currentPage.title);
            setEditTitle(currentPage.title);
            setLastSaved(currentPage.updatedAt);
        }
    }, [currentPage]);

    // Debounced save function
    const savePageContent = useRef((content: string) => {
        if (!currentPage) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            updatePage(currentPage.id, { content });
            setLastSaved(new Date().toISOString());
        }, 1000); // 1 second debounce
    }).current;

    // Setup editor with current page content
    useEffect(() => {
        if (currentPage && getEditorHtmlRef.current) {
            // Editor will be initialized with current page content
        }
    }, [currentPage]);

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditTitle(e.target.value);
    };

    const handleTitleSave = async () => {
        if (!currentPage) return;
        
        const newTitle = editTitle.trim() || 'Untitled';
        setTitle(newTitle);
        await updatePage(currentPage.id, { title: newTitle });
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setEditTitle(title);
            setIsEditingTitle(false);
        }
    };

    const handleStartEditTitle = () => {
        setIsEditingTitle(true);
        setEditTitle(title);
    };

    const handleToggleFavorite = async () => {
        if (!currentPage) return;
        await updatePage(currentPage.id, { isFavorite: !currentPage.isFavorite });
    };

    const handleDuplicate = async () => {
        if (!currentPage) return;
        const duplicatedPage = await createPage({
            title: `${currentPage.title} (copy)`,
            content: currentPage.content,
        });
        navigate(`/editor/${duplicatedPage.id}`);
    };

    const handleCreateSubpage = async () => {
        if (!currentPage) return;
        const subpage = await createPage({
            title: 'Untitled',
            parentId: currentPage.id,
            content: '',
        });
        navigate(`/editor/${subpage.id}`);
    };

    
    const formattedLastSaved = lastSaved
        ? new Date(lastSaved).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Not saved yet';

    if (loading || !currentPage) {
        return (
            <section className="page-stack">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div>Loading page...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="page-stack">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                {/* Title and actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleSave}
                            onKeyDown={handleTitleKeyDown}
                            className="page-title-input"
                            style={{
                                fontSize: '2rem',
                                fontWeight: '600',
                                border: '1px solid var(--color-border, #ccc)',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                background: 'var(--color-background, #fff)',
                                color: 'var(--color-text, #333)',
                            }}
                            autoFocus
                        />
                    ) : (
                        <h1
                            onClick={handleStartEditTitle}
                            style={{
                                fontSize: '2rem',
                                fontWeight: '600',
                                margin: 0,
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-hover, #f5f5f5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {currentPage.title}
                        </h1>
                    )}

                    {/* Page actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                        <button
                            onClick={handleToggleFavorite}
                            className="ghost-button"
                            title={currentPage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            style={{ fontSize: '16px' }}
                        >
                            {currentPage.isFavorite ? '⭐' : '☆'}
                        </button>
                        <button
                            onClick={handleCreateSubpage}
                            className="ghost-button"
                            title="Create subpage"
                        >
                            📄
                        </button>
                        <button
                            onClick={handleDuplicate}
                            className="ghost-button"
                            title="Duplicate page"
                        >
                            📋
                        </button>
                                            </div>
                </div>

                {/* Page metadata */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-muted, #666)' }}>
                    <span>Created {new Date(currentPage.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Last edited {formattedLastSaved}</span>
                    {currentPage.parentId && (
                        <>
                            <span>•</span>
                            <span>Subpage</span>
                        </>
                    )}
                </div>
            </div>

            {/* Editor */}
            <article className="panel-card editor-card">
                <RichTextEditor
                    initialContent={currentPage.content}
                    onReady={(getHtml: () => string) => {
                        getEditorHtmlRef.current = getHtml;
                        
                        // Set up auto-save
                        const interval = setInterval(() => {
                            const currentHtml = getHtml();
                            savePageContent(currentHtml);
                        }, 2000);

                        return () => clearInterval(interval);
                    }}
                />

                <div className="editor-footer">
                    <span className="muted">Auto-saved</span>
                    <span className="muted">
                        Editing as {user?.fullName || 'guest'}
                    </span>
                </div>
            </article>
        </section>
    );
}
