'use client';

import { useState } from 'react';

export type BrandLoaderProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/** Logo pulse for media/legacy loaders — prefer RouteProgress for page navigation. */
export function BrandLoader({
  label = 'Loading Campus 360',
  size = 'md',
  className,
}: BrandLoaderProps) {
  return (
    <div
      className={`c360-brand-loader c360-brand-loader--${size}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="c360-brand-loader__orbit" aria-hidden="true">
        <img className="c360-brand-loader__logo" src="/brand/logo.svg" alt="" width={180} height={75} />
        <span className="c360-brand-loader__glow" />
      </div>
      <span className="c360-brand-loader__label">{label}</span>
    </div>
  );
}

export type RouteProgressProps = {
  label?: string;
  className?: string;
};

/** Thin indeterminate bar under Breaking banner / shell top during route loads. */
export function RouteProgress({ label = 'Loading', className }: RouteProgressProps) {
  return (
    <div
      className={`c360-route-progress${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="c360-route-progress__bar" aria-hidden="true" />
    </div>
  );
}

export type MediaFrameProps = {
  src: string;
  alt?: string;
  aspect?: '16x9' | '4x3' | '3x4' | '1x1';
  className?: string;
};

export function MediaFrame({ src, alt = '', aspect = '16x9', className }: MediaFrameProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`c360-media-frame c360-media-frame--${aspect}${loaded ? ' is-loaded' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      {!loaded ? (
        <div className="c360-media-frame__shimmer" aria-hidden="true">
          <img src="/brand/icon.png" alt="" className="c360-media-frame__mark" width={48} height={48} />
        </div>
      ) : null}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  );
}
