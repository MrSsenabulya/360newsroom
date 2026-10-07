import type { Actor } from '@campus360/content/actor';
import { AppShell } from '@campus360/ui';
import { Icon, type FaName } from '@campus360/ui/icons';
import { SignOutButton } from './sign-out-button';
import { can } from '../lib/session';

type Props = {
  actor: Actor;
  children: React.ReactNode;
  activePath?: string;
  footer?: React.ReactNode;
};

type NavLink = { href: string; label: string; icon: FaName; show: boolean };

export function NewsroomChrome({ actor, children, activePath = '/', footer }: Props) {
  const links = [
    { href: '/', label: 'Desk', icon: 'clipboard' as FaName, show: true },
    { href: '/editorial', label: 'Editorial', icon: 'file' as FaName, show: true },
    { href: '/articles', label: 'Articles', icon: 'newspaper' as FaName, show: true },
    { href: '/breaking', label: 'Breaking', icon: 'bell' as FaName, show: true },
    { href: '/review', label: 'Review', icon: 'eye' as FaName, show: can(actor, 'editorial.review') },
    { href: '/opportunities', label: 'Opportunities', icon: 'handshake' as FaName, show: true },
    { href: '/events', label: 'Events', icon: 'calendar' as FaName, show: true },
    { href: '/guide', label: 'Guide', icon: 'map' as FaName, show: true },
    { href: '/programmes', label: 'Programmes', icon: 'bookmark' as FaName, show: true },
    {
      href: '/tips',
      label: 'Tips',
      icon: 'comments' as FaName,
      show: can(actor, 'editorial.review') || can(actor, 'breaking.review'),
    },
    {
      href: '/jobs',
      label: 'Jobs',
      icon: 'clock' as FaName,
      show: can(actor, 'editorial.publish') || can(actor, 'platform.jobs.retry'),
    },
  ].filter((item) => item.show);

  return (
    <AppShell
      surface="newsroom"
      brandHref="/"
      nav={
        <>
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activePath === item.href ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              {item.label}
            </a>
          ))}
        </>
      }
      actions={<SignOutButton />}
      footer={
        footer ?? (
          <>
            Newsroom CMS — create and edit all public site content. Access, health and error detail
            live in 360 Control. Public never sees private sources.
          </>
        )
      }
    >
      {children}
    </AppShell>
  );
}
