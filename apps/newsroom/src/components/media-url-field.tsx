'use client';

import { useRef, useState } from 'react';

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  altName?: string;
  altDefault?: string;
};

async function uploadViaApi(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/media/upload', { method: 'POST', body });
  const data = (await res.json()) as { publicUrl?: string; error?: string };
  if (!res.ok || !data.publicUrl) throw new Error(data.error ?? 'Upload failed');
  return data.publicUrl;
}

/** Image URL field with optional upload into Supabase Storage. */
export function MediaUrlField({ name, label, defaultValue = '', altName, altDefault = '' }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="c360-stack" style={{ gap: 12 }}>
      <div className="c360-field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="/placeholders/story.svg or https://…"
        />
      </div>
      <div className="c360-actions">
        <button
          className="c360-button c360-button--ghost"
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Uploading…' : 'Upload image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            setBusy(true);
            try {
              setUrl(await uploadViaApi(file));
            } catch (error) {
              window.alert(error instanceof Error ? error.message : 'Upload failed');
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      {altName ? (
        <div className="c360-field">
          <label htmlFor={altName}>Alt text</label>
          <input id={altName} name={altName} defaultValue={altDefault} />
        </div>
      ) : null}
    </div>
  );
}
