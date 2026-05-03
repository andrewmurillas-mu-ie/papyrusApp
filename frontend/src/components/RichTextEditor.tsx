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

const COLOR_PALETTE = ['#ffffff', '#fbbc04', '#34a853', '#4285f4', '#ea4335', '#c58b57'];

interface RichTextEditorProps {
  initialContent?: string;
  onReady?: (getHTML: () => string) => void;
}

export default function RichTextEditor({ initialContent, onReady }: RichTextEditorProps): React.ReactElement | null {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // @ts-ignore - history option exists but not in types
        // @ts-ignore 
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
      // @ts-ignore - resizable option exists but not in types
      TableKit.configure({}),
    ],
    content: initialContent || '',
    autofocus: 'end',
  });

  useEffect(() => {
    if (!editor || !onReady) return;
    onReady(() => editor.getHTML());
  }, [editor, onReady]);

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(initialContent || '');
  }, [initialContent, editor]);

  if (!editor) return null;

  const topState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      const state = {
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
      return state as any;
    },
  });

  const top = topState || {};

  const clickBlock =
    (buildChain: () => any) =>
    (event: MouseEvent) => {
      event.preventDefault();
      buildChain().run();
    };

  const applyInlineAndClose = (command: () => void) => {
    command();
    const { state, dispatch } = editor.view;
    const { to } = state.selection;
    // @ts-ignore - Selection constructor typing issue
    dispatch(
      (state.selection.constructor as any).near(state.doc.resolve(to)),
    );
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
          // @ts-ignore - tippyOptions exists but not in types
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
