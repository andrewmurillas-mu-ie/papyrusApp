import { NavLink, NavLinkRenderProps, Outlet } from "react-router-dom";
import useAuth from "../context/AuthContext.tsx";
import useTheme from "../context/ThemeContext.tsx";
import { ReactElement } from "react";

const navItems: [string, string][] = [
  ["Dashboard", "/dashboard"],
  ["Workspace", "/workspace"],
  ["Editor", "/editor"],
  ["Templates", "/templates"],
  ["Settings", "/settings"],
];

export default function AppLayout(): ReactElement {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <div>
            <div className="brand-mark">P</div>
            <div className="brand-copy">
              <h1>Papyrus</h1>
              <p>Focused workspace</p>
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span>{theme === "coffee-dark" ? "☕" : "🌤️"}</span>
            <span>{theme === "coffee-dark" ? "Dark" : "Light"}</span>
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map(
            ([label, path]: [string, string]): ReactElement => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }: NavLinkRenderProps): string =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar-circle">{user?.name?.[0] || "P"}</div>
            <div>
              <p>{user?.name || "Papyrus User"}</p>
              <span>{user?.email || "No email"}</span>
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
