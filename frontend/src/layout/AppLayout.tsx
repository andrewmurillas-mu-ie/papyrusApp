import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePages } from '../context/PagesContext';
import PageTree from '../components/PageTree';


export default function AppLayout(): React.ReactElement {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { createPage, currentPage, toggleFavorite } = usePages();
  const navigate = useNavigate();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New page
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        const newPage = await createPage({ title: 'Untitled', content: '' });
        navigate(`/editor/${newPage.id}`);
      }
      
      // Ctrl/Cmd + Shift + F: Toggle favorite
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (currentPage) {
          await toggleFavorite(currentPage.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createPage, currentPage, toggleFavorite]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* header: logo + name + subtitle + theme toggle */}
        <div
          className="sidebar-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            flexShrink: 0,
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div className="brand-mark">
              📜
              </div>
            <div className="brand-copy">
              <h1 style={{ margin: 0 }}>Papyrus</h1>
              <p
                className="muted"
                style={{
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Focused workspace
              </p>
            </div>
          </div>


          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span>{theme === 'coffee-dark' ? '☕' : '🌤️'}</span>
              <span>{theme === 'coffee-dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-list" style={{ flexShrink: 0, marginBottom: '1rem' }}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            style={{
              display: 'block',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '6px',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'background-color 0.2s ease',
            }}
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/workspace"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            style={{
              display: 'block',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '6px',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'background-color 0.2s ease',
            }}
          >
            🏢 Workspace
          </NavLink>
          <NavLink
            to="/templates"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            style={{
              display: 'block',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '6px',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'background-color 0.2s ease',
            }}
          >
            📋 Templates
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            style={{
              display: 'block',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '6px',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'background-color 0.2s ease',
            }}
          >
            ⚙️ Settings
          </NavLink>
        </nav>

        {/* Divider between navigation and pages */}
        <div 
          style={{ 
            height: '1px', 
            backgroundColor: 'var(--border, #ccc)', 
            margin: '0.5rem 0',
            opacity: 0.3 
          }} 
        />

        {/* Page tree section - scrollable */}
        <div 
          className="page-tree-section" 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          <PageTree />
        </div>

        {/* footer: user + logout */}
        <div className="sidebar-footer" style={{ flexShrink: 0 }}>
          <div
            className="user-pill"
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <div className="avatar-circle">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || 'User avatar'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                (user?.fullName?.[0] || 'P')
              )}
            </div>
            <div>
              <p>{user?.fullName || 'Papyrus User'}</p>
            </div>
          </div>


          <button className="ghost-button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>


      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}