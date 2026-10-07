import type { ReactNode } from 'react';

export type ShellProps = {
  brandHref?: string;
  surface: 'web' | 'newsroom' | 'control';
  nav?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  bottomNav?: ReactNode;
  banner?: ReactNode;
  /** Indeterminate route bar — render between banner and header. */
  routeProgress?: ReactNode;
  /** When set, replaces the default left-brand header (public editorial masthead). */
  header?: ReactNode;
  mainClassName?: string;
};

const SURFACE_LABEL: Record<ShellProps['surface'], string> = {
  web: 'Campus 360',
  newsroom: 'Campus 360 Newsroom',
  control: '360 Control',
};

const SURFACE_PRODUCT: Partial<Record<ShellProps['surface'], string>> = {
  newsroom: 'Newsroom',
  control: 'Control',
};

export function AppShell({
  brandHref = '/',
  surface,
  nav,
  actions,
  children,
  footer,
  footerClassName,
  bottomNav,
  banner,
  routeProgress,
  header,
  mainClassName,
}: ShellProps) {
  const product = SURFACE_PRODUCT[surface];

  return (
    <div className="c360-shell" data-surface={surface} data-chrome={header ? 'editorial' : 'default'}>
      <a className="c360-skip-link" href="#main-content">
        Skip to content
      </a>
      {banner}
      {routeProgress}
      {header ?? (
        <header className="c360-header">
          <a className="c360-brand" href={brandHref} aria-label={SURFACE_LABEL[surface]}>
            <img
              className="c360-brand__logo"
              src="/brand/logo.svg"
              alt=""
              width={146}
              height={60}
              decoding="async"
            />
            {product ? (
              <span className="c360-brand__product" aria-hidden="true">
                {product}
              </span>
            ) : null}
          </a>
          {nav ? <nav className="c360-nav c360-header__desktop" aria-label="Primary">{nav}</nav> : null}
          {actions ? <div>{actions}</div> : null}
        </header>
      )}
      <main id="main-content" className={mainClassName ?? 'c360-main'} tabIndex={-1}>
        {children}
      </main>
      {footer ? (
        <footer className={footerClassName ?? 'c360-footer'}>{footer}</footer>
      ) : null}
      {bottomNav}
    </div>
  );
}

export type StatusDotProps = {
  state: 'ok' | 'warn' | 'down';
  label: string;
};

export function StatusDot({ state, label }: StatusDotProps) {
  const className =
    state === 'ok'
      ? 'c360-status__dot'
      : state === 'warn'
        ? 'c360-status__dot c360-status__dot--warn'
        : 'c360-status__dot c360-status__dot--down';

  return (
    <span className="c360-status">
      <span className={className} aria-hidden="true" />
      {label}
    </span>
  );
}

export type SectionHeadProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  inverse?: boolean;
};

export function SectionHead({ title, href, linkLabel = 'See all', inverse }: SectionHeadProps) {
  return (
    <div className={`c360-section-head${inverse ? ' c360-section-head--inverse' : ''}`}>
      <h2 className="c360-section-head__title">{title}</h2>
      {href ? (
        <a className="c360-section-head__link" href={href}>
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}

export { BrandLoader, MediaFrame, RouteProgress } from './media';
export type { BrandLoaderProps, MediaFrameProps, RouteProgressProps } from './media';
