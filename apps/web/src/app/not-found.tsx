import { PublicChrome } from '../components/public-chrome';

export default function NotFound() {
  return (
    <PublicChrome>
      <p className="c360-kicker">404</p>
      <h1 className="c360-title">Page not found</h1>
      <p className="c360-lede">That link may be old, mistyped, or not published yet.</p>
      <div className="c360-actions">
        <a className="c360-button" href="/">
          Home
        </a>
        <a className="c360-button c360-button--ghost" href="/search">
          Search
        </a>
      </div>
    </PublicChrome>
  );
}
