'use client';

import { useCallback, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBold,
  faItalic,
  faHeading,
  faListUl,
  faListOl,
  faQuoteLeft,
  faLink,
  faImage,
  faUpload,
  faVideo,
  faRotateLeft,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { extractYouTubeId } from '@campus360/video';

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  onUploadImage?: (file: File) => Promise<string>;
};

type ToolBtnProps = {
  label: string;
  icon: IconDefinition;
  active?: boolean;
  onClick: () => void;
};

function ToolBtn({ label, icon, active, onClick }: ToolBtnProps) {
  return (
    <button
      type="button"
      className={active ? 'is-active' : undefined}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      <FontAwesomeIcon icon={icon} className="c360-icon" aria-hidden />
    </button>
  );
}

export function RichTextEditor({
  name,
  defaultValue = '',
  placeholder = 'Write…',
  label,
  onUploadImage,
}: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue || '',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (hiddenRef.current) hiddenRef.current.value = ed.getHTML();
    },
  });

  useEffect(() => {
    if (hiddenRef.current && editor) {
      hiddenRef.current.value = editor.getHTML();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertImageUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertYouTube = useCallback(() => {
    if (!editor) return;
    const raw = window.prompt('YouTube URL or video id');
    if (!raw) return;
    const id = extractYouTubeId(raw);
    if (!id) {
      window.alert('Enter a valid YouTube URL or video id');
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(
        `<p><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">YouTube video</a></p>`,
      )
      .run();
  }, [editor]);

  const onFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !editor || !onUploadImage) return;
      try {
        const url = await onUploadImage(file);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Upload failed');
      }
    },
    [editor, onUploadImage],
  );

  if (!editor) {
    return (
      <div className="c360-field">
        {label ? <label>{label}</label> : null}
        <p className="c360-meta">Loading editor…</p>
        <input type="hidden" name={name} defaultValue={defaultValue} />
      </div>
    );
  }

  return (
    <div className="c360-field c360-richtext">
      {label ? <label>{label}</label> : null}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue} />
      <div className="c360-richtext__toolbar" role="toolbar" aria-label="Formatting">
        <ToolBtn
          label="Bold"
          icon={faBold}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolBtn
          label="Italic"
          icon={faItalic}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolBtn
          label="Heading 2"
          icon={faHeading}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <button
          type="button"
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : undefined}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
          aria-label="Heading 3"
          aria-pressed={editor.isActive('heading', { level: 3 })}
        >
          <span className="c360-richtext__hbadge" aria-hidden>
            H3
          </span>
        </button>
        <ToolBtn
          label="Bullet list"
          icon={faListUl}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolBtn
          label="Numbered list"
          icon={faListOl}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolBtn
          label="Quote"
          icon={faQuoteLeft}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolBtn label="Link" icon={faLink} active={editor.isActive('link')} onClick={setLink} />
        <ToolBtn label="Image from URL" icon={faImage} onClick={insertImageUrl} />
        {onUploadImage ? (
          <>
            <ToolBtn label="Upload image" icon={faUpload} onClick={() => fileRef.current?.click()} />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(event) => {
                void onFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </>
        ) : null}
        <ToolBtn label="YouTube" icon={faVideo} onClick={insertYouTube} />
        <ToolBtn
          label="Undo"
          icon={faRotateLeft}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolBtn
          label="Redo"
          icon={faRotateRight}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <EditorContent editor={editor} className="c360-richtext__surface" />
    </div>
  );
}
