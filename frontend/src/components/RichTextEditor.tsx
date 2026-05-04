import { useEffect, MouseEvent } from 'react';
import {
  EditorContent,
  useEditor,
  useEditorState,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
// Collaboration features temporarily disabled due to version conflicts
// import Collaboration from '@tiptap/extension-collaboration';
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';

const COLOR_PALETTE = ['#ffffff', '#fbbc04', '#34a853', '#4285f4', '#ea4335', '#c58b57'];

interface RichTextEditorProps {
  initialContent?: string;
  onReady?: (getHTML: () => string) => void;
  onContentChange?: (content: string) => void;
  pageId?: string;
  enableCollaboration?: boolean;
}

export default function RichTextEditor({ initialContent, onReady, onContentChange, pageId, enableCollaboration = false }: RichTextEditorProps): React.ReactElement | null {
  
  // Collaboration features temporarily disabled due to version conflicts
  // useEffect(() => {
  //   if (enableCollaboration && pageId) {
  //     const doc = new Y.Doc();
  //     const provider = new WebsocketProvider(
  //       'ws://localhost:1234',
  //       `papyrus-document-${pageId}`,
  //       doc,
  //       {
  //         params: {
  //           token: 'papyrus-collab-token'
  //         }
  //       }
  //     );

  //     provider.on('status', (event: any) => {
  //       console.log('Collaboration status:', event.status);
  //     });

  //     provider.on('sync', (isSynced: boolean) => {
  //       console.log('Collaboration synced:', isSynced);
  //     });

  //     return () => {
  //       provider.destroy();
  //     }
  //   }
  // }, [enableCollaboration, pageId])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: false,
      }),
      Strike,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'editor-link',
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      TableKit.configure({}),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      // Collaboration features temporarily disabled due to version conflicts
      // ...(enableCollaboration && pageId ? [
      //   Collaboration.configure({
      //     document: new Y.Doc(),
      //   }),
      //   CollaborationCursor.configure({
      //     provider: new WebsocketProvider(
      //       'ws://localhost:1234',
      //       `papyrus-document-${pageId}`,
      //       new Y.Doc()
      //     ),
      //   }),
      // ] : []),
    ],
    content: initialContent,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
      handleKeyDown: () => {
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (onReady) {
        onReady(() => editor.getHTML());
      }
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (!editor || !initialContent) return;
    if (editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  const topState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        isParagraph: editor.isActive('paragraph'),
        isH1: editor.isActive('heading', { level: 1 }),
        isH2: editor.isActive('heading', { level: 2 }),
        isBullet: editor.isActive('bulletList'),
        isOrdered: editor.isActive('orderedList'),
        isBlockquote: editor.isActive('blockquote'),
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isStrike: editor.isActive('strike'),
      };
    },
  });

  const top = topState || {} as {
    isParagraph: boolean;
    isH1: boolean;
    isH2: boolean;
    isBullet: boolean;
    isOrdered: boolean;
    isBlockquote: boolean;
    isBold: boolean;
    isItalic: boolean;
    isStrike: boolean;
  };

  const clickBlock =
    (buildChain: () => any) =>
    (event: MouseEvent) => {
      event.preventDefault();
      buildChain().run();
    };

  const applyInlineAndClose = (command: () => void) => {
    command();
    // Just refocus editor, don't blur or click elsewhere
    setTimeout(() => {
      editor.commands.focus();
    }, 10);
  };

  const promptForLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const promptForImage = () => {
    const url = window.prompt('Image URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="rte-root">
      <div className="rte-toolbar rte-toolbar--top">
        <button
          type="button"
          className={top.isParagraph ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().setParagraph())}
        >
          P
        </button>

        <button
          type="button"
          className={top.isH1 ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().setHeading({ level: 1 }))}
        >
          H1
        </button>

        <button
          type="button"
          className={top.isH2 ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().setHeading({ level: 2 }))}
        >
          H2
        </button>

        <span className="rte-divider" />

        <button
          type="button"
          className={top.isBold ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleBold())}
        >
          B
        </button>

        <button
          type="button"
          className={top.isItalic ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleItalic())}
        >
          I
        </button>

        <button
          type="button"
          className={top.isStrike ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleStrike())}
        >
          S
        </button>

        <span className="rte-divider" />

        <button
          type="button"
          className={top.isBullet ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleBulletList())}
        >
          ••
        </button>

        <button
          type="button"
          className={top.isOrdered ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleOrderedList())}
        >
          1.
        </button>

        <button
          type="button"
          className={editor.isActive('taskList') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleTaskList())}
        >
          ☑
        </button>

        <button
          type="button"
          className={top.isBlockquote ? 'rte-btn is-active' : 'rte-btn'}
          onClick={clickBlock(() => editor.chain().focus().toggleBlockquote())}
        >
          ❝
        </button>

        <span className="rte-divider" />

        <button
          type="button"
          className={editor.isActive('link') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={(e) => {
            e.preventDefault();
            promptForLink();
          }}
        >
          🔗
        </button>

        <button
          type="button"
          className="rte-btn"
          onClick={(e) => {
            e.preventDefault();
            promptForImage();
          }}
        >
          🖼
        </button>

        <button
          type="button"
          className="rte-btn"
          onClick={(e) => {
            e.preventDefault();
            insertTable();
          }}
        >
          ▦
        </button>

        <button
          type="button"
          className="rte-btn rte-btn--ghost"
          title="Add row below"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().addRowAfter().run();
          }}
        >
          ↧ row
        </button>

        <button
          type="button"
          className="rte-btn rte-btn--ghost"
          title="Add column right"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().addColumnAfter().run();
          }}
        >
          ↦ col
        </button>

        <button
          type="button"
          className="rte-btn rte-btn--ghost"
          title="Delete row"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().deleteRow().run();
          }}
        >
          ✕ row
        </button>

        <button
          type="button"
          className="rte-btn rte-btn--ghost"
          title="Delete column"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().deleteColumn().run();
          }}
        >
          ✕ col
        </button>
      </div>

      <div className="editor-surface">
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => {
            const { from, to } = editor.state.selection;
            return from !== to;
          }}
        >
          <div className="rte-toolbar rte-toolbar--floating">
            <button
              type="button"
              className={editor.isActive('bold') ? 'rte-btn is-active' : 'rte-btn'}
              onMouseDown={(e) => {
                e.preventDefault();
                applyInlineAndClose(() =>
                  editor.chain().focus().toggleBold().run(),
                );
              }}
            >
              B
            </button>
            <button
              type="button"
              className={editor.isActive('italic') ? 'rte-btn is-active' : 'rte-btn'}
              onMouseDown={(e) => {
                e.preventDefault();
                applyInlineAndClose(() =>
                  editor.chain().focus().toggleItalic().run(),
                );
              }}
            >
              I
            </button>
            <button
              type="button"
              className={editor.isActive('strike') ? 'rte-btn is-active' : 'rte-btn'}
              onMouseDown={(e) => {
                e.preventDefault();
                applyInlineAndClose(() =>
                  editor.chain().focus().toggleStrike().run(),
                );
              }}
            >
              S
            </button>
            <button
              type="button"
              className={editor.isActive('highlight') ? 'rte-btn is-active' : 'rte-btn'}
              onMouseDown={(e) => {
                e.preventDefault();
                applyInlineAndClose(() =>
                  editor.chain().focus().toggleHighlight().run(),
                );
              }}
            >
              HL
            </button>
            <div className="rte-color-group">
              {COLOR_PALETTE.map((color) => {
                const isActiveColor =
                  editor.getAttributes('textStyle').color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={
                      isActiveColor
                        ? 'rte-color-swatch rte-color-swatch--active'
                        : 'rte-color-swatch'
                    }
                    style={{ backgroundColor: color }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyInlineAndClose(() =>
                        editor.chain().focus().setColor(color).run(),
                      );
                    }}
                  />
                );
              })}
              <button
                type="button"
                className="rte-btn"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyInlineAndClose(() =>
                    editor.chain().focus().unsetColor().run(),
                  );
                }}
              >
                ⨯
              </button>
            </div>
          </div>
        </BubbleMenu>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
