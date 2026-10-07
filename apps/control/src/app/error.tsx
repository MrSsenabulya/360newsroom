'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ padding: '48px 24px', maxWidth: 640, margin: '0 auto' }}>
      <p className="c360-kicker">360 Control</p>
      <h1 className="c360-title">Something went wrong</h1>
      <p className="c360-lede">
        Try again. Operator error detail (when recorded) is on Health — do not show raw codes to
        public users.
      </p>
      <div className="c360-actions">
        <button className="c360-button" type="button" onClick={() => reset()}>
          Try again
        </button>
        <a className="c360-button c360-button--ghost" href="/health">
          Open Health
        </a>
      </div>
    </main>
  );
}
