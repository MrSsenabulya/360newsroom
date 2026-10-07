'use client';

import { useEffect, useId, useState } from 'react';
import { CampusSelector } from './campus-selector';
import type { CampusOption } from '../lib/campus';

export type NavItem = { href: string; label: string };

type Props = {
  activePath: string;
  nav: readonly NavItem[];
  campuses: CampusOption[];
  preferredCampus: string | null;
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function EditorialMasthead({ activePath, nav, campuses, preferredCampus }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="c360-masthead">
        <div className="c360-masthead__top">
          <button
            type="button"
            className="c360-icon-btn"
            aria-expanded={open}
            aria-controls={open ? titleId : undefined}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
          <a className="c360-masthead__logo" href="/" aria-label="Campus 360 home">
            <img src="/brand/logo.svg" alt="" width={180} height={75} decoding="async" />
          </a>
          <a className="c360-icon-btn" href="/search" aria-label="Search">
            <SearchIcon />
          </a>
        </div>
        <nav className="c360-masthead__nav" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activePath === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {open ? (
        <>
          <button
            type="button"
            className="c360-drawer-backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="c360-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <div className="c360-drawer__head">
              <strong id={titleId}>Menu</strong>
              <button
                type="button"
                className="c360-icon-btn"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="c360-drawer__nav" aria-label="Site">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={activePath === item.href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="c360-drawer__meta">
              <CampusSelector campuses={campuses} initialSlug={preferredCampus} />
              <a href="/tip" onClick={() => setOpen(false)}>
                Submit a tip
              </a>
              <a href="/advertise" onClick={() => setOpen(false)}>
                Advertise
              </a>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
