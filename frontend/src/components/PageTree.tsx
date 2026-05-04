import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePages } from '../context/PagesContext';
import { useWorkspace } from '../context/WorkspaceContext';
import PageTreeItem from './PageTreeItem';

export default function PageTree() {
  const navigate = useNavigate();
  const { getPageTree, getFavoritePages, createPage, loading, currentWorkspace } = usePages();
  const { currentWorkspace: workspace } = useWorkspace();

  // Check if user can create pages
  const userId = localStorage.getItem('userId');
  const canCreatePage = workspace?.members?.find((member: any) => 
    member.user === userId
  )?.role !== 'viewer';
  
  console.log('Permission check:', {
    userId,
    workspace,
    members: workspace?.members,
    canCreatePage
  });

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
    console.log('🟢 New Page button clicked');
    console.log('📋 currentWorkspace:', currentWorkspace);
    console.log('📋 workspace:', workspace);
    console.log('📋 canCreatePage:', canCreatePage);
    console.log('📋 userId:', localStorage.getItem('userId'));
    
    try {
      // Support creating personal pages without workspace
      let workspaceId = null;
      if (currentWorkspace) {
        // If workspace is selected, check permissions
        if (!canCreatePage) {
          console.error('❌ User does not have permission to create pages in this workspace');
          alert('You do not have permission to create pages in this workspace');
          return;
        }
        workspaceId = currentWorkspace.id;
        console.log('🏢 Creating workspace page with ID:', workspaceId);
      } else {
        console.log('👤 Creating personal page (no workspace)');
      }
      
      console.log('📝 Calling createPage with:', {
        title: 'Untitled',
        content: '',
        workspaceId: workspaceId
      });
      
      // Create personal page if no workspace, or workspace page if workspace selected
      const newPage = await createPage({ 
        title: 'Untitled', 
        content: '',
        workspaceId: workspaceId as string | null // null for personal pages
      });
      
      console.log('✅ Page created successfully:', {
        id: newPage.id,
        title: newPage.title,
        content: newPage.content,
        workspaceId: newPage.workspaceId,
        isPersonal: !workspaceId
      });
      
      console.log('🧭 Navigating to:', `/editor/${newPage.id}`);
      
      // Navigate to the newly created page
      navigate(`/editor/${newPage.id}`);
      
      console.log('🚀 Navigation completed');
    } catch (error) {
      console.error('❌ Failed to create page:', error);
      alert('Failed to create page: ' + (error as Error).message);
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
            disabled={!canCreatePage}
            className="new-page-button"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              backgroundColor: canCreatePage ? 'var(--primary)' : '#ccc',
              color: 'white',
              cursor: canCreatePage ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: canCreatePage ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canCreatePage) {
                e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (canCreatePage) {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)';
              }
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
