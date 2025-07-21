import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'محتوای مطلب را بنویسید...',
  readOnly = false,
  className = '',
  height = '400px'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'right',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Color,
      TextStyle,
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
        dir: 'rtl',
        'data-placeholder': placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('آدرس لینک را وارد کنید:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('آدرس تصویر را وارد کنید:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className={`rich-text-editor-container ${className}`} style={{ height }}>
      {/* Toolbar */}
      <div className="rich-text-editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'toolbar-button active' : 'toolbar-button'}
            title="بولد"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'toolbar-button active' : 'toolbar-button'}
            title="ایتالیک"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'toolbar-button active' : 'toolbar-button'}
            title="زیرخط"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'toolbar-button active' : 'toolbar-button'}
            title="خط خورده"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'toolbar-button active' : 'toolbar-button'}
            title="عنوان 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'toolbar-button active' : 'toolbar-button'}
            title="عنوان 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'toolbar-button active' : 'toolbar-button'}
            title="عنوان 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'toolbar-button active' : 'toolbar-button'}
            title="لیست نقطه‌ای"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'toolbar-button active' : 'toolbar-button'}
            title="لیست شماره‌ای"
          >
            1.
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'toolbar-button active' : 'toolbar-button'}
            title="تراز راست"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'toolbar-button active' : 'toolbar-button'}
            title="تراز وسط"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'toolbar-button active' : 'toolbar-button'}
            title="تراز چپ"
          >
            ←
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={addLink}
            className={editor.isActive('link') ? 'toolbar-button active' : 'toolbar-button'}
            title="لینک"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={addImage}
            className="toolbar-button"
            title="تصویر"
          >
            🖼️
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="toolbar-button"
            title="حذف لینک"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="rich-text-editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor; 