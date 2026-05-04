import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePages } from '../context/PagesContext';
import PageTreeItem from './PageTreeItem';

export default function PageTree() {
  const navigate = useNavigate();
  const { getPageTree, getFavoritePages, createPage, loading, currentWorkspace } = usePages();

  if (loading) {
    return (
      <div className="page-tree-loading" style={{ padding: '16px', textAlign: 'center' }}>
        <span style={{ opacity: 0.6, fontSize: '14px' }}>Loading pages...</span>
      </div>
    );
  }

  const favoritePages = getFavoritePages();
  const pageTree = getPageTree();

  const handleCreateRootPage = async () => {
    try {
      if (!currentWorkspace) {
        console.error('No workspace selected');
        return;
      }
      
      const newPage = await createPage({ 
        title: 'Untitled', 
        content: '',
        workspaceId: currentWorkspace.id
      });
      // Navigate to the newly created page
      navigate(`/editor/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  return (
    <div className="page-tree" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Fixed Section: New Page Button and Favorites */}
      <div style={{ flexShrink: 0 }}>
        {/* New Page Button */}
        <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
          <button
            onClick={handleCreateRootPage}
            className="new-page-button"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)';
            }}
          >
            <span>➕</span>
            <span>New Page</span>
          </button>
        </div>

        {/* Favorites Section */}
        {favoritePages.length > 0 && (
          <div className="favorites-section">
            <div
              className="section-header"
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ⭐ Favorites
            </div>
            {favoritePages.map((page) => (
              <PageTreeItem key={page.id} page={{ ...page, children: [], level: 0, isExpanded: false }} />
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '12px 0' }} />
          </div>
        )}
      </div>

      {/* Scrollable Section: Main Page Tree */}
      <div className="main-tree" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {pageTree.length === 0 ? (
          <div
            className="empty-state"
            style={{
              padding: '16px 12px',
              textAlign: 'center',
              color: 'var(--muted)',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
            <div style={{ fontSize: '14px', marginBottom: '12px' }}>No pages yet</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Create your first page to get started
            </div>
          </div>
        ) : (
          pageTree.map((page) => (
            <PageTreeItem key={page.id} page={page} />
          ))
        )}
      </div>
    </div>
  );
}
