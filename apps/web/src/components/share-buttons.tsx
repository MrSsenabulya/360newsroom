'use client';

import { useState } from 'react';

type Props = {
  title: string;
  urlPath: string;
};

export function ShareButtons({ title, urlPath }: Props) {
  const [copied, setCopied] = useState(false);

  function absoluteUrl() {
    if (typeof window === 'undefined') return urlPath;
    return new URL(urlPath, window.location.origin).toString();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    const url = absoluteUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, url, text: title });
        return;
      } catch {
        // fall through
      }
    }
    await copyLink();
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${absoluteUrl()}`)}`;

  return (
    <div className="c360-share" aria-label="Share">
      <button type="button" className="c360-button c360-button--ghost" onClick={nativeShare}>
        Share
      </button>
      <a className="c360-button c360-button--ghost" href={whatsapp} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <button type="button" className="c360-button c360-button--ghost" onClick={copyLink}>
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
