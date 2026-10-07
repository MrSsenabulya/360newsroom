'use client';

import { RichTextEditor } from './rich-text-editor';

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
};

async function uploadViaApi(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/media/upload', { method: 'POST', body });
  const data = (await res.json()) as { publicUrl?: string; error?: string };
  if (!res.ok || !data.publicUrl) {
    throw new Error(data.error ?? 'Upload failed');
  }
  return data.publicUrl;
}

/** Rich text field with Storage image upload wired to Newsroom API. */
export function EditorialRichText(props: Props) {
  return <RichTextEditor {...props} onUploadImage={uploadViaApi} />;
}
