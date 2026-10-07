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
    <main className="c360-shell" style={{ padding: '48px 24px', maxWidth: 640, margin: '0 auto' }}>
      <p className="c360-kicker">Campus 360</p>
      <h1 className="c360-title">Something went wrong</h1>
      <p className="c360-lede">Please try again. If it keeps happening, come back later.</p>
      <button className="c360-button" type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
