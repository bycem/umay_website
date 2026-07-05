import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { IMAGE_URL_RE } from '../lib/validation';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [imageInputOpen, setImageInputOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link,
      Image,
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  function insertImage() {
    const trimmed = imageUrl.trim();
    if (!IMAGE_URL_RE.test(trimmed)) {
      setImageError("Geçerli bir görsel URL'si girin");
      return;
    }
    editor!.chain().focus().setImage({ src: trimmed }).run();
    setImageInputOpen(false);
    setImageUrl('');
    setImageError(null);
  }

  function handleImageKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      insertImage();
    }
  }

  function toggleImageInput() {
    setImageInputOpen((open) => !open);
    setImageUrl('');
    setImageError(null);
  }

  function setLink() {
    const url = window.prompt('Link URL');
    if (!url) return;
    if (!/^https?:/.test(url)) return;
    editor!.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div>
      <div className="rte-toolbar">
        <button
          type="button"
          title="Başlık 1"
          className={editor.isActive('heading', { level: 1 }) ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          title="Başlık 2"
          className={editor.isActive('heading', { level: 2 }) ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          title="Başlık 3"
          className={editor.isActive('heading', { level: 3 }) ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          title="Kalın"
          className={editor.isActive('bold') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          title="İtalik"
          className={editor.isActive('italic') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          title="Altı çizili"
          className={editor.isActive('underline') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          title="Üstü çizili"
          className={editor.isActive('strike') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </button>
        <button
          type="button"
          title="Alıntı"
          className={editor.isActive('blockquote') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          "
        </button>
        <button
          type="button"
          title="Kod"
          className={editor.isActive('code') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {'</>'}
        </button>
        <button
          type="button"
          title="Sıralı liste"
          className={editor.isActive('orderedList') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        <button
          type="button"
          title="Sırasız liste"
          className={editor.isActive('bulletList') ? 'rte-btn rte-btn--active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button type="button" title="Link ekle" className="rte-btn" onClick={setLink}>
          🔗
        </button>
        <button type="button" title="Resim ekle" className="rte-btn" onClick={toggleImageInput}>
          🖼
        </button>
      </div>

      {imageInputOpen && (
        <div className="rte-image-input-row">
          <input
            type="text"
            className="form-field"
            placeholder="https://example.com/gorsel.jpg"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageError(null);
            }}
            onKeyDown={handleImageKeyDown}
            autoFocus
          />
          <button type="button" className="btn btn-secondary" onClick={insertImage}>
            Ekle
          </button>
          {imageError && <div className="rte-image-error">{imageError}</div>}
        </div>
      )}

      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}
