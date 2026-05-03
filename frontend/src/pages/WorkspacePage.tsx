import React, { ReactElement, useEffect, useState } from "react";
import Page from "../backend_objects/Page.ts";
import pageService from "../api/pageService.ts";
import workspaceService from "../api/workspaceService.ts";
import Workspace from "../backend_objects/Workspace.ts";

export default function WorkspacePage(): ReactElement {
  const [pages, setPages] = useState<Page[]>([]);
  const [workspaces, setWorkspace] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect((): void => {
    const load: () => void = async (): Promise<void> => {
      try {
        const data: Workspace[] = await workspaceService.getAll();
        setWorkspace(Array.isArray(data) ? data : []);
      } catch {
        setError(
          "Could not load workspaces from the backend. Check the API server and MongoDB connection.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect((): void => {
    const load: () => void = async (): Promise<void> => {
      try {
        const data: Page[] = await pageService.getAll();
        setPages(Array.isArray(data) ? data : []);
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
          <p className="eyebrow">Workspace</p>
          <h2>Design Studio</h2>
          <p className="muted">
            A single solid workspace page for the current frontend stage. The
            structure is ready for workspace data, pages, members, and chat
            later.
          </p>
        </div>
      </div>

      <div className="workspace-grid">
        <aside className="panel-card">
          <div className="panel-header">
            <h3>Pages</h3>
          </div>
          <div className="list-stack">
            {pages.map(
              (item: Page, index: number): ReactElement => (
                <div key={`${item._id}-${index}`} className="list-row">
                  <div className="avatar-circle">{item.title?.[0] || "P"}</div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{new Date(item.lastUpdate).toLocaleDateString()}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </aside>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Workspace overview</h3>
          </div>
          <p className="muted">
            This area can later show workspace description, pinned pages,
            activity, and role-aware actions.
          </p>

          <div className="grid-two compact-grid">
            <div className="mini-card">
              <span>Members</span>
              <strong>3</strong>
            </div>
            <div className="mini-card">
              <span>Active pages</span>
              <strong>12</strong>
            </div>
          </div>

          <div className="chat-placeholder">
            <strong>Team chat placeholder</strong>
            <p>Needs a collaboration or comments backend later.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
