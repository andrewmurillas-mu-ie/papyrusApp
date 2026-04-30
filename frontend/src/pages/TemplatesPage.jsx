import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const templates = [
  {
    slug: 'meeting-notes',
    name: 'Meeting notes',
    description: 'Simple structure for agendas, notes, and action items.',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Notes' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Action Items' }] },
        { type: 'paragraph' },
      ],
    },
  },
  {
    slug: 'project-brief',
    name: 'Project brief',
    description: 'Capture scope, goals, milestones, and owners.',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Brief' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Goals' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Milestones' }] },
        { type: 'paragraph' },
      ],
    },
  },
  {
    slug: 'study-tracker',
    name: 'Study tracker',
    description: 'Track topics, deadlines, and revision blocks.',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Study Tracker' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Topics' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Deadlines' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Revision Schedule' }] },
        { type: 'paragraph' },
      ],
    },
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleUseTemplate = async (template) => {
    setLoading(template.slug);
    try {
      const res = await fetch('http://localhost:3000/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: template.name,
          content: template.content,
        }),
      });
      const doc = await res.json();
      navigate(`/editor/${doc._id}`);
    } catch (err) {
      console.error('Failed to create from template:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Templates</p>
          <h2>Starter templates</h2>
          <p className="muted">
            Pre-built structures to get started faster.
          </p>
        </div>
      </div>

      <article className="panel-card">
        <div className="panel-header">
          <h3>Available templates</h3>
        </div>

        <div className="template-grid">
          {templates.map((template) => (
            <article key={template.slug} className="panel-card template-card">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <button
                className="secondary-button"
                onClick={() => handleUseTemplate(template)}
                disabled={loading === template.slug}
              >
                {loading === template.slug ? 'Creating...' : 'Use template'}
              </button>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}