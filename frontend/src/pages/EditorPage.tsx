import InfoBanner from "../components/InfoBanner";
import { ReactElement, useEffect, useState } from "react";
import Page from "../backend_objects/Page.ts";
import pageService from "../api/pageService.ts";

export default function EditorPage(): ReactElement {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <p className="eyebrow">Editor</p>
          <h2>Page editor</h2>
          <p className="muted">
            This is a simple starter editor with clear integration points for
            blocks, AI tools, version history, and export.
          </p>
        </div>

        <div className="quick-actions">
          <button className="secondary-button" disabled>
            AI summary
          </button>
          <button className="secondary-button" disabled>
            Version history
          </button>
          <button className="secondary-button" disabled>
            Export
          </button>
        </div>
      </div>

      <InfoBanner
        title="Backend needed for real editor save/load"
        tone="warning"
      >
        Add page routes, block persistence, role permissions, version endpoints,
        and export support to make this editor functional beyond placeholders.
      </InfoBanner>

      <article className="panel-card editor-card">
        <label>
          Page title
          <input defaultValue="Untitled page" />
        </label>

        <div
          className="editor-surface"
          contentEditable
          suppressContentEditableWarning
        >
          <h3>Heading block</h3>
          <p>
            Start writing here. This editable area is only a frontend
            placeholder for now.
          </p>
          <ul>
            <li>Checklist block placeholder</li>
            <li>Table block placeholder</li>
            <li>Text block placeholder</li>
          </ul>
        </div>

        <div className="editor-footer">
          <button className="primary-button">Save draft later</button>
          <span>Hook this button to a future page save endpoint.</span>
        </div>
      </article>
    </section>
  );
}
