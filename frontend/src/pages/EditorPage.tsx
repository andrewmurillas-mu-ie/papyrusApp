import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner';
import { useAuth } from '../context/AuthContext';
import { usePages } from '../context/PagesContext';
import { useWorkspace } from '../context/WorkspaceContext';
import RichTextEditor from '../components/RichTextEditor';
import pageService, { SavePagePayload } from '../api/pageService';
import pageVersionService from '../api/pageVersionService';
import {
  requestGrammarAssistance,
  savePageForSearch,
  type GrammarResponse,
  SavePageForSearchPayload,
} from '../api/aiService';
import { exportToMarkdown, exportToPDF, exportToDOCX } from '../utils/exportUtils';
import { simpleCollabService, CollabUser } from '../services/simpleCollabService';
import ShareModal from '../components/ShareModal';

export default function EditorPage(): React.ReactElement {
  const { user } = useAuth();
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const { 
    currentPage, 
    setCurrentPage, 
    updatePage, 
    createPage,
    loading: pagesLoading,
  } = usePages();
  const { currentWorkspace } = useWorkspace();

  // Page state
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Grammar Assistance State
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState('');
  const [grammarResult, setGrammarResult] = useState<GrammarResponse | null>(null);

  // Search Sync State
  const [searchSyncStatus, setSearchSyncStatus] = useState('');
  const [searchSyncError, setSearchSyncError] = useState('');
  const [manualSaveStatus, setManualSaveStatus] = useState('');

  // Collaboration State
  const [collabUsers, setCollabUsers] = useState<CollabUser[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);

  // Version History State
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionError, setVersionError] = useState('');

  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Share State
  const [showShareModal, setShowShareModal] = useState(false);

  // Template state
  const [searchParams] = useSearchParams();
  const template = searchParams.get('template') as any;

  // Template content generation - 3 basic templates
  const getTemplateContent = (templateType: string): string => {
    switch (templateType) {
      case 'meeting-notes':
        return (
          '<h2>Meeting Notes</h2>' +
          '<h3>Agenda</h3>' +
          '<p>• Topic 1</p>' +
          '<p>• Topic 2</p>' +
          '<h3>Notes</h3>' +
          '<p>Meeting notes go here...</p>' +
          '<h3>Action Items</h3>' +
          '<p>• Action 1</p>' +
          '<p>• Action 2</p>'
        );
      case 'to-do-list':
        return (
          '<h2>To-Do List</h2>' +
          '<h3>Today</h3>' +
          '<ul>' +
          '<li>Task 1</li>' +
          '<li>Task 2</li>' +
          '<li>Task 3</li>' +
          '</ul>' +
          '<h3>This Week</h3>' +
          '<ul>' +
          '<li>Important task</li>' +
          '<li>Another task</li>' +
          '</ul>'
        );
      case 'project-brief':
        return (
          '<h2>Project Brief</h2>' +
          '<h3>Overview</h3>' +
          '<p>Project description and objectives go here.</p>' +
          '<h3>Goals</h3>' +
          '<p>• Goal 1</p>' +
          '<p>• Goal 2</p>' +
          '<h3>Milestones</h3>' +
          '<p>• Milestone 1 - Date</p>' +
          '<p>• Milestone 2 - Date</p>'
        );
      default:
        return '<p>Start writing here...</p>';
    }
  };

  // Load page data or create new page
  useEffect(() => {
    console.log('🔍 EditorPage useEffect:', {
      pageId,
      currentPage: currentPage?.id,
      currentPageExists: !!currentPage,
      pageLoading
    });
    
    if (pageId && !currentPage && !pageLoading) {
      console.log('📖 Loading page with ID:', pageId);
      setPageLoading(true);
      pageService.getPageById(pageId)
        .then((page: any) => {
          console.log('✅ Page loaded successfully:', {
            id: page.id,
            title: page.title,
            content: page.content?.substring(0, 50) + '...'
          });
          setTitle(page.title);
          setBodyHtml(page.contentHtml || page.content || '');
          setCurrentPage(page.id);
          setLastSaved(new Date(page.updatedAt));
          setRetryCount(0);
        })
        .catch((error: any) => {
          console.error('❌ Failed to load page:', error);
          if (retryCount < maxRetries) {
            console.log(`🔄 Retrying page load (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              pageService.getPageById(pageId)
                .then((page: any) => {
                  setTitle(page.title);
                  setBodyHtml(page.contentHtml || page.content || '');
                  setCurrentPage(page.id);
                  setLastSaved(new Date(page.updatedAt));
                  setRetryCount(0);
                })
                .catch((retryError: any) => {
                  console.error('❌ Retry failed:', retryError);
                  setPageError('Failed to load page after multiple attempts. Please check your connection and try again.');
                });
            }, 1000 * (retryCount + 1)); // Exponential backoff
          } else {
            console.error('❌ Max retries reached, giving up');
            setPageError('Failed to load page after multiple attempts. Please check your connection and try again.');
          }
        })
        .finally(() => setPageLoading(false));
    } else if (!pageId && !currentPage && !pageLoading) {
      console.log('➕ Creating new page (no pageId)');
      // Create a new page when no pageId exists (new page creation)
      handleCreateNewPage();
    } else {
      console.log('🔄 No action needed - page already loaded or loading');
    }
  }, [pageId, currentPage?.id, pageLoading, retryCount]);

  // Create new page function (simplified)
  const handleCreateNewPage = async () => {
    if (currentPage || pageLoading) return; // Don't create if page already exists or is loading
    
    console.log('🆕 Creating new page...');
    setPageLoading(true);
    try {
      const newPage = await createPage({
        title: 'Untitled Page',
        content: '<p>Start writing here...</p>',
        contentHtml: '<p>Start writing here...</p>',
        contentText: 'Start writing here...'
      });
      console.log('✅ New page created successfully:', newPage);
      setCurrentPage(newPage.id);
      setLastSaved(new Date());
      // Navigate to the newly created page
      navigate(`/editor/${newPage.id}`, { replace: true });
    } catch (error: any) {
      console.error('❌ Failed to create new page:', error);
      setPageError('Failed to create new page');
    } finally {
      setPageLoading(false);
    }
  };

  // Apply template if specified
  useEffect(() => {
    if (template && !bodyHtml) {
      const templateContent = getTemplateContent(template);
      setBodyHtml(templateContent);
    }
  }, [template, bodyHtml]);

  // Collaboration disabled to fix WebSocket errors
  useEffect(() => {
    // No collaboration setup - WebSocket errors fixed
  }, []);

  // Handle content updates
  const handleContentChange = (content: string) => {
    setBodyHtml(content);
  };

  // Simplified auto-save functionality (2 second debounce)
  useEffect(() => {
    if (!currentPage) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, bodyHtml, currentPage]);

  // Simplified auto-save function
  const handleAutoSave = async () => {
    if (!currentPage || pageLoading) return;
    
    try {
      console.log('💾 Auto-saving page...');
      const savePayload: SavePagePayload = {
        title,
        contentHtml: bodyHtml,
        contentText: bodyHtml.replace(/<[^>]*>/g, ''),
      };
      await updatePage(currentPage.id, savePayload);
      setLastSaved(new Date());
      console.log('✅ Page auto-saved successfully');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  };

  // Simplified manual save function
  const handleManualSave = async () => {
    if (!currentPage) return;
    
    setManualSaveStatus('Saving...');
    
    try {
      const savePayload: SavePagePayload = {
        title,
        contentHtml: bodyHtml,
        contentText: bodyHtml.replace(/<[^>]*>/g, ''),
      };
      await updatePage(currentPage.id, savePayload);
      setLastSaved(new Date());
      setManualSaveStatus('✅ Saved successfully');
      setTimeout(() => setManualSaveStatus(''), 3000);
    } catch (error: any) {
      console.error('Manual save failed:', error);
      setManualSaveStatus('❌ Save failed');
      setTimeout(() => setManualSaveStatus(''), 3000);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Simple share function
  const handleShare = async () => {
    if (!currentPage) return;
    
    const shareLink = `${window.location.origin}/editor/${currentPage.id}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: show the link in an alert
      alert(`Share link: ${shareLink}`);
    }
  };

  // Version History Functions
  const handleLoadVersions = async () => {
    if (!currentPage) return;
    
    setLoadingVersions(true);
    setVersionError('');
    
    try {
      const pageVersions = await pageVersionService.getVersions(currentPage.id);
      setVersions(pageVersions);
      console.log(`📜 Loaded ${pageVersions.length} versions for page ${currentPage.id}`);
    } catch (error: any) {
      console.error('Failed to load versions:', error);
      setVersionError(error.response?.data?.error || 'Failed to load versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async (version: number) => {
    if (!currentPage) return;
    
    if (!confirm('Are you sure you want to restore this version? This will replace the current content.')) {
      return;
    }
    
    try {
      const restoredPage = await pageVersionService.restoreVersion(currentPage.id, version);
      console.log(`🔄 Restored page ${currentPage.id} to version ${version}`);
      
      // Update the current page data
      setTitle(restoredPage.title);
      setBodyHtml(restoredPage.contentHtml || '');
      setLastSaved(restoredPage.updatedAt);
      
      // Close version history modal
      setShowVersionHistory(false);
      
      alert('Version restored successfully!');
    } catch (error: any) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleViewVersion = async (version: number) => {
    if (!currentPage) return;
    
    try {
      const versionData = await pageVersionService.getVersion(currentPage.id, version);
      console.log(`📜 Viewing version ${version} of page ${currentPage.id}`);
      
      // You could show the version content in a modal or preview
      alert(`Version ${version} from ${new Date(versionData.createdAt).toLocaleString()}:\n\nTitle: ${versionData.title}\n\nContent preview: ${versionData.contentText?.substring(0, 200)}...`);
    } catch (error: any) {
      console.error('Failed to view version:', error);
      alert('Failed to view version: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  // Export Functions
  const handleExportMarkdown = () => {
    if (!currentPage) return;
    const getHtml = getEditorHtmlRef.current;
    if (!getHtml) return;
    
    const content = getHtml();
    exportToMarkdown(currentPage.title, content);
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    if (!currentPage) return;
    const getHtml = getEditorHtmlRef.current;
    if (!getHtml) return;
    
    const content = getHtml();
    await exportToPDF(currentPage.title, content);
    setShowExportMenu(false);
  };

  const handleExportDOCX = () => {
    if (!currentPage) return;
    const getHtml = getEditorHtmlRef.current;
    if (!getHtml) return;
    
    const content = getHtml();
    exportToDOCX(currentPage.title, content);
    setShowExportMenu(false);
  };

  // Grammar assistance
  const handleGrammarAssist = async () => {
    if (!currentPage) return;
    
    setGrammarLoading(true);
    setGrammarError('');
    setGrammarResult(null);
    
    try {
      const getHtml = getEditorHtmlRef.current;
      if (!getHtml) return;
      
      const content = getHtml();
      const result = await requestGrammarAssistance(content);
      setGrammarResult(result);
    } catch (error: any) {
      console.error('Grammar assistance failed:', error);
      setGrammarError(error.response?.data?.error || 'Grammar assistance failed');
    } finally {
      setGrammarLoading(false);
    }
  };

  // Ref for getting editor HTML
  const getEditorHtmlRef = useRef<(() => string) | null>(null);

  const formattedLastSaved = lastSaved
    ? new Date(lastSaved).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not saved yet';

  if (pageError) {
    return (
      <section className="page-stack">
        <div className="hero-card">
          <div>
            <p className="eyebrow">Error</p>
            <h2>Failed to load page</h2>
            <p className="muted">{pageError}</p>
          </div>
          <div className="quick-actions">
            <button className="secondary-button" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </section>
    );
  }

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
            className="secondary-button"
            onClick={() => setShowShareModal(true)}
            disabled={false}
          >
            🔗 Share
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleGrammarAssist}
            disabled={grammarLoading}
          >
            {grammarLoading ? 'Checking grammar...' : 'Grammar Assist'}
          </button>
          <button 
            className="secondary-button" 
            onClick={() => {
              setShowVersionHistory(true);
              handleLoadVersions();
            }}
            disabled={false}
          >
            Version history
          </button>
          <div style={{ position: 'relative' }}>
            <button 
              className="secondary-button" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={false}
            >
            Export ▼
            </button>
            {showExportMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow)',
                zIndex: 9999,
                minWidth: '140px',
                marginTop: '4px'
              }}>
                <button
                  className="export-menu-item"
                  onClick={handleExportMarkdown}
                >
                  📝 Markdown
                </button>
                <button
                  className="export-menu-item"
                  onClick={handleExportPDF}
                >
                  📄 PDF
                </button>
                <button
                  className="export-menu-item"
                  onClick={handleExportDOCX}
                >
                  📑 DOCX
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <InfoBanner title={currentPage ? 'Saved page editor' : 'New blank page'}>
        {currentPage
          ? 'This page is loaded from your workspace and autosaves back to the same page.'
          : 'Start typing to create a new page. Once saved, it can be opened again from the workspace.'}
      </InfoBanner>

      {pageError ? (
        <div className="form-error">{pageError}</div>
      ) : null}

      {!pageId && !template && (
        <div className="panel-card">
          <h3>Choose a template</h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              className="secondary-button"
              onClick={() => navigate('/editor?template=meeting-notes')}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                <div>Meeting Notes</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Structured meeting template</div>
              </div>
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate('/editor?template=to-do-list')}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                <div>To-Do List</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Checkbox list starter</div>
              </div>
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate('/editor?template=project-brief')}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                <div>Project Brief</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Project planning template</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <article className="panel-card editor-card">
        <div className="page-header">
          <input
            type="text"
            placeholder="Untitled page"
            value={title}
            onChange={handleTitleChange}
            disabled={pageLoading}
            className="page-title-input"
          />
          <button
            type="button"
            className="save-button"
            onClick={handleShare}
            disabled={!currentPage}
            style={{ marginRight: '8px' }}
          >
            🔗 Share
          </button>
          <button
            type="button"
            className="save-button"
            onClick={handleManualSave}
            disabled={!currentPage || pageLoading}
          >
            {pageLoading ? '⏳ Saving...' : '💾 Save'}
          </button>
          {manualSaveStatus && (
            <div className="save-status">
              {manualSaveStatus}
            </div>
          )}
        </div>

        <RichTextEditor
          initialContent={bodyHtml}
          onReady={(getHtml) => {
            getEditorHtmlRef.current = getHtml;
          }}
          onContentChange={handleContentChange}
          pageId={currentPage?.id}
          enableCollaboration={false}
        />

        {grammarError && (
          <div className="info-banner info-banner--warning">
            {grammarError}
          </div>
        )}

        {grammarResult && (
          <div className="panel-card">
            <h3>Grammar Suggestions</h3>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Corrected Text:</strong>
            </div>
            <div 
              style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--surface-2)', 
                borderRadius: '8px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {grammarResult.correctedText}
            </div>
            {grammarResult.suggestions && grammarResult.suggestions.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Suggestions:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {grammarResult.suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <strong>{suggestion.shortMessage || suggestion.message}</strong>
                      {suggestion.replacements && suggestion.replacements.length > 0 && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          Suggestions: {suggestion.replacements.join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </article>

      <div className="editor-footer">
        <div>
          {searchSyncStatus && (
            <span style={{ color: 'var(--success)' }}>{searchSyncStatus}</span>
          )}
          {searchSyncError && (
            <span style={{ color: 'var(--danger)' }}>{searchSyncError}</span>
          )}
        </div>
        <div>
          <span>Last saved: {formattedLastSaved}</span>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Version History</h2>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Page: {currentPage?.title}
            </p>
            
            {loadingVersions ? (
              <p>Loading versions...</p>
            ) : versionError ? (
              <p style={{ color: 'red' }}>{versionError}</p>
            ) : versions.length === 0 ? (
              <p>No versions found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {versions.map((version) => (
                  <div key={version.version} style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '12px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Version {version.version}</strong>
                        <br />
                        <small style={{ color: '#666' }}>
                          {new Date(version.createdAt).toLocaleString()}
                        </small>
                        {version.changeDescription && (
                          <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                            {version.changeDescription}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="secondary-button"
                          onClick={() => handleViewVersion(version.version)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          View
                        </button>
                        <button
                          className="primary-button"
                          onClick={() => handleRestoreVersion(version.version)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                className="secondary-button"
                onClick={() => setShowVersionHistory(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        pageId={currentPage?.id || ''}
        pageWorkspaceId={currentPage?.workspaceId || null}
        pageTitle={currentPage?.title || 'Untitled'}
      />
    </section>
  );
}
