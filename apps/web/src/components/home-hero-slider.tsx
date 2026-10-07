'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mediaUrl } from '../lib/media';

export type HomeHeroSlide = {
  id: string;
  href: string;
  title: string;
  standfirst?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  readMinutes: number;
};

const DWELL_MS = 6000;

type Props = {
  slides: HomeHeroSlide[];
};

export function HomeHeroSlider({ slides }: Props) {
  const items = slides.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const startedAt = useRef(Date.now());
  const raf = useRef<number | null>(null);

  const count = items.length;
  const active = items[index] ?? items[0];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
      setProgress(0);
      startedAt.current = Date.now();
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }

    startedAt.current = Date.now();
    setProgress(0);

    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      const ratio = Math.min(1, elapsed / DWELL_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        goTo(index + 1);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [count, paused, reduceMotion, index, goTo]);

  if (!active) return null;

  const circumference = 2 * Math.PI * 18;
  const dash = circumference * progress;

  return (
    <section
      className="c360-home-hero"
      aria-roledescription="carousel"
      aria-label="Top stories"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(index - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(index + 1);
        }
      }}
    >
      {items.map((slide, i) => (
        <div
          key={slide.id}
          className={`c360-home-hero__slide${i === index ? ' is-active' : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i !== index}
        >
          <img
            className="c360-home-hero__image"
            src={mediaUrl(slide.imageUrl, 'story')}
            alt={slide.imageAlt ?? ''}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        </div>
      ))}

      <div className="c360-home-hero__scrim" aria-hidden="true" />

      <div className="c360-home-hero__content">
        <h1 className="c360-home-hero__title">
          <a href={active.href}>{active.title}</a>
        </h1>
        {active.standfirst ? <p className="c360-home-hero__deck">{active.standfirst}</p> : null}
        <a className="c360-home-hero__duration" href={active.href}>
          {active.readMinutes} MIN READ
        </a>
      </div>

      <div className="c360-home-hero__chrome">
        {count > 1 ? (
          <div className="c360-home-hero__dots" role="tablist" aria-label="Slides">
            {items.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`c360-home-hero__dot${i === index ? ' is-active' : ''}`}
                aria-label={`Show story ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        ) : (
          <span />
        )}

        {count > 1 ? (
          <div className="c360-home-hero__controls">
            <button
              type="button"
              className="c360-home-hero__pause"
              aria-label={paused || reduceMotion ? 'Play slideshow' : 'Pause slideshow'}
              onClick={() => setPaused((value) => !value)}
            >
              <svg className="c360-home-hero__ring" viewBox="0 0 44 44" aria-hidden="true">
                <circle className="c360-home-hero__ring-track" cx="22" cy="22" r="18" />
                <circle
                  className="c360-home-hero__ring-value"
                  cx="22"
                  cy="22"
                  r="18"
                  strokeDasharray={`${dash} ${circumference}`}
                  transform="rotate(-90 22 22)"
                />
              </svg>
              <span className="c360-home-hero__pause-icon" aria-hidden="true">
                {paused || reduceMotion ? (
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <path fill="currentColor" d="M3 1.5v9l8-4.5L3 1.5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <rect x="2" y="1.5" width="2.5" height="9" fill="currentColor" />
                    <rect x="7.5" y="1.5" width="2.5" height="9" fill="currentColor" />
                  </svg>
                )}
              </span>
            </button>
            <button
              type="button"
              className="c360-home-hero__nav"
              aria-label="Previous story"
              onClick={() => goTo(index - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="c360-home-hero__nav"
              aria-label="Next story"
              onClick={() => goTo(index + 1)}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
