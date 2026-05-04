import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePages } from '../context/PagesContext';

interface TemplateContentItem {
    type: string;
    attrs?: { level: number };
    content?: Array<{ type: string; text: string }>;
}

interface TemplateContent {
    type: string;
    content?: TemplateContentItem[];
}

interface Template {
    slug: string;
    name: string;
    description: string;
    content: TemplateContent;
}

const templates: Template[] = [
    {
        slug: 'blank-page',
        name: 'Blank page',
        description: 'A clean slate for your ideas.',
        content: {
            type: 'root',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Start writing here...' }] },
            ],
        },
    },
    {
        slug: 'todo-list',
        name: 'Todo List',
        description: 'Simple task list for daily planning.',
        content: {
            type: 'root',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Todo List' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Today' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '☐ Task 1' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '☐ Task 2' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '☐ Task 3' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'This Week' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '☐ Important task' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '☐ Another task' }] },
            ],
        },
    },
    {
        slug: 'meeting-notes',
        name: 'Meeting notes',
        description: 'Simple structure for agendas, notes, and action items.',
        content: {
            type: 'root',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Notes' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Action Items' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '' }] },
            ],
        },
    },
    {
        slug: 'project-brief',
        name: 'Project brief',
        description: 'Capture scope, goals, milestones, and owners.',
        content: {
            type: 'root',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Brief' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Project description and objectives go here.' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Goals' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Goal 1' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Goal 2' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Milestones' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Milestone 1 - Date' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Milestone 2 - Date' }] },
            ],
        },
    },
    {
        slug: 'study-tracker',
        name: 'Study tracker',
        description: 'Track topics, deadlines, and revision blocks.',
        content: {
            type: 'root',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Study Tracker' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Topics' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Topic 1 - Status' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Topic 2 - Status' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Deadlines' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Assignment 1 - Due Date' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Assignment 2 - Due Date' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Revision Schedule' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Review Topic 1 - Date' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Review Topic 2 - Date' }] },
            ],
        },
    },
    {
        slug: 'journal',
        name: 'Journal',
        description: 'Daily journal for thoughts and reflections.',
        content: {
            type: 'root',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Journal Entry' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Date: ' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Today\'s Thoughts' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Write your thoughts and reflections here...' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Gratitude' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• What are you grateful for today?' }] },
            ],
        },
    },
    {
        slug: 'brainstorm',
        name: 'Brainstorm',
        description: 'Free-form space for creative ideas.',
        content: {
            type: 'root',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Brainstorm Session' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Main Idea:' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Key Points' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Point 1' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Point 2' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Point 3' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Next Steps' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Action 1' }] },
                { type: 'paragraph', content: [{ type: 'text', text: '• Action 2' }] },
            ],
        },
    },
];

export default function TemplatesPage(): React.ReactElement {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { createPage, currentWorkspace } = usePages();
    const [loading, setLoading] = useState<string | null>(null);

    const handleUseTemplate = async (template: Template) => {
        setLoading(template.slug);
        
        // Convert template content to HTML string
        const contentToHtml = (content: TemplateContent): string => {
            if (!content || !content.content) return '<p>Start writing here...</p>';
            
            return content.content.map((item: TemplateContentItem) => {
                if (item.type === 'heading') {
                    const level = item.attrs?.level || 1;
                    const text = item.content?.map(c => c.text).join('') || '';
                    return `<h${level}>${text}</h${level}>`;
                } else if (item.type === 'paragraph') {
                    const text = item.content?.map(c => c.text).join('') || '';
                    return `<p>${text}</p>`;
                }
                return '';
            }).join('\n');
        };

        try {
            console.log('Creating page from template:', template.name);
            const htmlContent = contentToHtml(template.content);
            console.log('Generated HTML content:', htmlContent);
            
            if (!currentWorkspace) {
                console.error('No workspace selected');
                return;
            }
            
            const newPage = await createPage({
                title: template.name,
                content: htmlContent,
                workspaceId: currentWorkspace.id
            });
            
            console.log('Page created successfully:', newPage);
            navigate(`/editor/${newPage.id}`);
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
