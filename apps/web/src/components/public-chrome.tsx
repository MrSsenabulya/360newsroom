import { AppShell, SectionHead } from '@campus360/ui';
import { listActiveBreakingBanner, listActiveCampuses } from '@campus360/content/public';
import { cookies } from 'next/headers';
import { EditorialMasthead } from './editorial-masthead';
import { CAMPUS_COOKIE, parseCampusCookie } from '../lib/campus';
import { formatRelative } from '../lib/format';

const PRIMARY_NAV = [
  { href: '/latest', label: 'Latest' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/events', label: 'Events' },
  { href: '/guide', label: 'Guide' },
  { href: '/campus', label: 'Campus' },
  { href: '/watch', label: 'Watch' },
  { href: '/topics', label: 'Topics' },
] as const;

type Props = {
  children: React.ReactNode;
  activePath?: string;
  showBanner?: boolean;
  mainClassName?: string;
  routeProgress?: React.ReactNode;
};

export async function PublicChrome({
  children,
  activePath = '/',
  showBanner = true,
  mainClassName = 'c360-main c360-main--editorial',
  routeProgress,
}: Props) {
  const cookieStore = await cookies();
  const preferredCampus = parseCampusCookie(cookieStore.get(CAMPUS_COOKIE)?.value);

  let campuses: Awaited<ReturnType<typeof listActiveCampuses>> = [];
  let banner: Awaited<ReturnType<typeof listActiveBreakingBanner>> = [];

  try {
    [campuses, banner] = await Promise.all([
      listActiveCampuses(),
      showBanner ? listActiveBreakingBanner(1) : Promise.resolve([]),
    ]);
  } catch {
    // Shell must still render if content DB is briefly unavailable.
  }

  const campusOptions = campuses.map((campus) => ({
    slug: campus.slug,
    name: campus.name,
    universityName: campus.university.name,
  }));

  const breaking = banner[0];

  return (
    <AppShell
      surface="web"
      brandHref="/"
      mainClassName={mainClassName}
      banner={
        breaking ? (
          <div className="c360-banner">
            <span className="c360-pill">Breaking</span>
            <a className="c360-banner-link" href={`/breaking/${breaking.slug}`}>
              {breaking.headline}
            </a>
            <span className="c360-meta" style={{ color: '#c4c7cd' }}>
              {formatRelative(breaking.firstPublishedAt)}
            </span>
          </div>
        ) : null
      }
      routeProgress={routeProgress}
      header={
        <EditorialMasthead
          activePath={activePath}
          nav={PRIMARY_NAV}
          campuses={campusOptions}
          preferredCampus={preferredCampus}
        />
      }
      footerClassName="c360-footer--inverse"
      footer={
        <div className="c360-footer__inner">
          <div className="c360-footer__brand">
            <a href="/" aria-label="Campus 360 home">
              <img src="/brand/logo.svg" alt="" width={160} height={66} decoding="async" />
            </a>
            <p style={{ margin: 0, maxWidth: '28rem' }}>
              If it matters on campus, Campus 360 should know about it.
            </p>
          </div>
          <div className="c360-footer__columns">
            <div className="c360-footer__col">
              <h3>Explore</h3>
              <ul>
                <li>
                  <a href="/latest">Latest</a>
                </li>
                <li>
                  <a href="/watch">Watch</a>
                </li>
                <li>
                  <a href="/opportunities">Opportunities</a>
                </li>
                <li>
                  <a href="/events">Events</a>
                </li>
              </ul>
            </div>
            <div className="c360-footer__col">
              <h3>Campus</h3>
              <ul>
                <li>
                  <a href="/campus">Campuses</a>
                </li>
                <li>
                  <a href="/guide">Guide</a>
                </li>
                <li>
                  <a href="/topics">Topics</a>
                </li>
                <li>
                  <a href="/search">Search</a>
                </li>
              </ul>
            </div>
            <div className="c360-footer__col">
              <h3>Participate</h3>
              <ul>
                <li>
                  <a href="/tip">Submit a tip</a>
                </li>
                <li>
                  <a href="/advertise">Advertise</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="c360-footer__col">
              <h3>Trust</h3>
              <ul>
                <li>
                  <a href="/editorial-standards">Editorial standards</a>
                </li>
                <li>
                  <a href="/corrections">Corrections</a>
                </li>
                <li>
                  <a href="/advertising-policy">Advertising policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="c360-footer__legal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
          <p className="c360-footer__copy">© Campus 360. Youth-first campus media.</p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}

export async function getPreferredCampusSlug() {
  const cookieStore = await cookies();
  return parseCampusCookie(cookieStore.get(CAMPUS_COOKIE)?.value);
}

export { SectionHead };
