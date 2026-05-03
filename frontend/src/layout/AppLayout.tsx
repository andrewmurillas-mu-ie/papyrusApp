import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems: [string, string][] = [
  ['Dashboard', '/dashboard'],
  ['Workspace', '/workspace'],
  ['Editor', '/editor'],
  ['Templates', '/templates'],
  ['Settings', '/settings'],
];

export default function AppLayout(): React.ReactElement {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

        {/* nav in the middle */}
        <nav className="nav-list">
          {navItems.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* footer: user + logout */}
        <div className="sidebar-footer">
          <div
            className="user-pill"
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <div className="avatar-circle">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User avatar'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                (user?.name?.[0] || 'P')
              )}
            </div>
            <div>
              <p>{user?.name || 'Papyrus User'}</p>
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
