import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "../api/userService";
import useAuth from "../context/AuthContext.tsx";
import InfoBanner from "../components/InfoBanner";
import User from "../api/userService.ts";

export default function DashboardPage(): ReactElement {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect((): void => {
    const load: () => void = async (): Promise<void> => {
      try {
        const data: User[] = await userService.getAllUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setError(
          "Could not load users from the backend. Check the API server and MongoDB connection.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Hello, {user?.name || "there"}</h2>
          <p className="muted">
            This is the current frontend base for Papyrus. It uses the existing
            user API and leaves workspace features ready for later.
          </p>
        </div>

        <div className="quick-actions">
          <Link className="primary-button" to="/workspace">
            Open workspace
          </Link>
          <Link className="secondary-button" to="/templates">
            Browse templates
          </Link>
        </div>
      </div>

      <InfoBanner title="Backend integration status">
        Workspaces, pages, templates, versions, and AI actions are not in the
        backend yet. This dashboard shows a real user area and a placeholder
        workspace overview.
      </InfoBanner>

      <div className="grid-two">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Current user</h3>
          </div>
          <div className="detail-list">
            <div>
              <span>Name</span>
              <strong>{user?.name || "Papyrus User"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.email || "Not connected yet"}</strong>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Recent pages</h3>
          </div>
          <div className="empty-state">
            <p>No recent pages yet.</p>
            <span>
              Add page routes and a pages collection to replace this
              placeholder.
            </span>
          </div>
        </article>
      </div>

      <article className="panel-card">
        <div className="panel-header">
          <h3>Users from backend</h3>
          <span>{loading ? "Loading..." : `${users.length} loaded`}</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {!loading && !users.length && !error ? (
          <div className="empty-state">
            <p>No users in the database yet.</p>
            <span>
              Create one through the backend or use Settings later when update
              flows are finalized.
            </span>
          </div>
        ) : null}

        <div className="list-stack">
          {users.map(
            (item: User, index: number): ReactElement => (
              <div key={`${item.email}-${index}`} className="list-row">
                <div className="avatar-circle">{item.fullName?.[0] || "U"}</div>
                <div>
                  <strong>{item.fullName}</strong>
                  <p>{item.email}</p>
                </div>
              </div>
            ),
          )}
        </div>
      </article>
    </section>
  );
}
