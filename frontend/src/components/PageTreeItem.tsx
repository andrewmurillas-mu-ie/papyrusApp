import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTreeItem } from '../types/page';
import { usePages } from '../context/PagesContext';

interface PageTreeItemProps {
  page: PageTreeItem;
  level?: number;
}

export default function PageTreeItemComponent({ page, level = 0 }: PageTreeItemProps) {
  const navigate = useNavigate();
  const { 
    currentPage, 
    togglePageExpanded, 
    createPage, 
    deletePage, 
    duplicatePage, 
    toggleFavorite,
    renamePage 
  } = usePages();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(page.title);
  const [showMenu, setShowMenu] = useState(false);

  const hasChildren = page.children.length > 0;
  const isActive = currentPage?.id === page.id;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      togglePageExpanded(page.id);
    }
  };

  const handlePageClick = () => {
    navigate(`/editor/${page.id}`);
    setShowMenu(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(page.title);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    const newTitle = editTitle.trim() || 'Untitled';
    renamePage(page.id, newTitle);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(page.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleCreateSubpage = () => {
    createPage({ 
      title: 'Untitled', 
      parentId: page.id,
      content: ''
    });
    setShowMenu(false);
  };

  const handleDuplicate = () => {
    duplicatePage(page.id);
    setShowMenu(false);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(page.id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${page.title}" and all its subpages?`)) {
      deletePage(page.id);
      setShowMenu(false);
    }
  };

  return (
    <div className="page-tree-item">
      <div
        className={`page-row ${isActive ? 'active' : ''}`}
        style={{ 
          paddingLeft: `${level * 16 + 12}px`,
          paddingRight: '12px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '32px'
        }}
        onClick={handlePageClick}
        onContextMenu={handleContextMenu}
      >
        {/* Expand/Collapse button */}
        <button
          className={`expand-button ${hasChildren ? 'has-children' : ''} ${page.isExpanded ? 'expanded' : ''}`}
          onClick={handleToggleExpand}
          style={{
            visibility: hasChildren ? 'visible' : 'hidden',
            width: '16px',
            height: '16px',
            border: 'none',
            background: 'transparent',
            cursor: hasChildren ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '4px',
          }}
        >
          {hasChildren && (
            <span style={{ fontSize: '10px', opacity: 0.6 }}>
              {page.isExpanded ? '▼' : '▶'}
            </span>
          )}
        </button>

        {/* Page icon */}
        <span className="page-icon" style={{ marginRight: '6px', fontSize: '14px' }}>
          {page.icon || '📄'}
        </span>

        {/* Page title */}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="page-title-input"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '14px',
              background: 'var(--surface)',
              color: 'var(--text)',
              flex: 1,
              minWidth: 0,
            }}
            autoFocus
          />
        ) : (
          <span 
            className="page-title" 
            style={{ 
              flex: 1, 
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0
            }}
          >
            {page.title}
          </span>
        )}

        {/* Actions button */}
        <button
          className="page-actions-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            opacity: 0.6,
            fontSize: '12px',
            flexShrink: 0,
            marginLeft: '4px',
          }}
        >
          ⋯
        </button>

        {/* Context menu */}
        {showMenu && (
          <div
            className="page-context-menu"
            style={{
              position: 'absolute',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              boxShadow: 'var(--shadow)',
              zIndex: 1000,
              minWidth: '180px',
              padding: '4px 0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCreateSubpage}
              className="context-menu-item"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '8px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              📄 New subpage
            </button>
            <button
              onClick={handleStartEdit}
              className="context-menu-item"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '8px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ✏️ Rename
            </button>
            <button
              onClick={handleDuplicate}
              className="context-menu-item"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '8px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              📋 Duplicate
            </button>
            <button
              onClick={handleToggleFavorite}
              className="context-menu-item"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '8px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {page.isFavorite ? '⭐ Unfavorite' : '☆ Favorite'}
            </button>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
            <button
              onClick={handleDelete}
              className="context-menu-item"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '8px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--danger)',
              }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && page.isExpanded && (
        <div className="page-children">
          {page.children.map((child) => (
            <PageTreeItemComponent
              key={child.id}
              page={child}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Close context menu when clicking outside */}
      {showMenu && (
        <div
          className="menu-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
