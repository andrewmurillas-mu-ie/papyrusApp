import InfoBanner from "../components/InfoBanner";
import { ReactElement, useEffect, useState } from "react";
import Template from "../backend_objects/Template.ts";
import templateService from "../api/templateService.ts";

// const templates: { name: string; description: string }[] = [
//   {
//     name: "Meeting notes",
//     description: "Simple structure for agendas, notes, and action items.",
//   },
//   {
//     name: "Project brief",
//     description: "Capture scope, goals, milestones, and owners.",
//   },
//   {
//     name: "Study tracker",
//     description: "Track topics, deadlines, and revision blocks.",
//   },
// ];

export default function TemplatesPage(): ReactElement {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect((): void => {
    const load: () => void = async (): Promise<void> => {
      try {
        const data: Template[] = await templateService.getAll();
        setTemplates(Array.isArray(data) ? data : []);
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

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Templates</p>
          <h2>Starter templates</h2>
          <p className="muted">
            This page uses local placeholder templates until the backend exposes
            template data.
          </p>
        </div>
      </div>

      <InfoBanner title="Backend needed for dynamic templates" tone="warning">
        Add template routes and a template model when you want templates to be
        created, stored, and shared from the database.
      </InfoBanner>

      <div className="template-grid">
        {templates.map(
          (template: { name: string; description: string }): ReactElement => (
            <article key={template.name} className="panel-card template-card">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <button className="secondary-button">Use template</button>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
