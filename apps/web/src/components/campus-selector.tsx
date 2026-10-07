'use client';

import { CAMPUS_COOKIE, CAMPUS_STORAGE_KEY, type CampusOption } from '../lib/campus';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  campuses: CampusOption[];
  initialSlug: string | null;
};

export function CampusSelector({ campuses, initialSlug }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug ?? '');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CAMPUS_STORAGE_KEY);
      if (stored && campuses.some((campus) => campus.slug === stored)) {
        setSlug(stored);
        document.cookie = `${CAMPUS_COOKIE}=${encodeURIComponent(stored)}; path=/; max-age=31536000; samesite=lax`;
      }
    } catch {
      // ignore
    }
  }, [campuses]);

  function persist(next: string) {
    setSlug(next);
    try {
      if (next) {
        window.localStorage.setItem(CAMPUS_STORAGE_KEY, next);
        document.cookie = `${CAMPUS_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
      } else {
        window.localStorage.removeItem(CAMPUS_STORAGE_KEY);
        document.cookie = `${CAMPUS_COOKIE}=; path=/; max-age=0; samesite=lax`;
      }
    } catch {
      // ignore
    }
    router.refresh();
  }

  return (
    <label className="c360-campus-pill">
      <span className="c360-meta" style={{ margin: 0 }}>
        My campus
      </span>
      <select
        aria-label="Select campus"
        value={slug}
        onChange={(event) => persist(event.target.value)}
      >
        <option value="">All campuses</option>
        {campuses.map((campus) => (
          <option key={campus.slug} value={campus.slug}>
            {campus.name}
          </option>
        ))}
      </select>
    </label>
  );
}
