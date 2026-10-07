import { AppShell } from '@campus360/ui';
import { Icon, type FaName } from '@campus360/ui/icons';
import type { Actor } from '@campus360/content/actor';
import { SignOutButton } from './sign-out-button';
import { can } from '../lib/session';

type Props = {
  actor: Actor;
  children: React.ReactNode;
  activePath?: string;
  footer?: React.ReactNode;
};

type NavLink = { href: string; label: string; icon: FaName; show: boolean };

export function ControlChrome({ actor, children, activePath = '/', footer }: Props) {
  const links = [
    { href: '/', label: 'Overview', icon: 'chart' as FaName, show: true },
    { href: '/sponsors', label: 'Sponsors', icon: 'building' as FaName, show: can(actor, 'campaign.manage') },
    { href: '/campaigns', label: 'Campaigns', icon: 'star' as FaName, show: can(actor, 'campaign.manage') },
    { href: '/leads', label: 'Leads', icon: 'handshake' as FaName, show: can(actor, 'campaign.manage') },
    {
      href: '/vendors',
      label: 'Vendors',
      icon: 'map' as FaName,
      show: can(actor, 'vendor.approve') || can(actor, 'campaign.manage'),
    },
    { href: '/editorial', label: 'Editorial', icon: 'newspaper' as FaName, show: can(actor, 'control.overview') },
    { href: '/people', label: 'People', icon: 'users' as FaName, show: can(actor, 'users.manage') },
    { href: '/health', label: 'Health', icon: 'drive' as FaName, show: can(actor, 'platform.health.view') },
    {
      href: '/jobs',
      label: 'Jobs',
      icon: 'clock' as FaName,
      show: can(actor, 'platform.jobs.retry') || can(actor, 'platform.health.view'),
    },
    { href: '/audit', label: 'Audit', icon: 'file' as FaName, show: can(actor, 'audit.view') },
  ].filter((item) => item.show);

  return (
    <AppShell
      surface="control"
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
            360 Control — users, rights, site health and operator error detail. Journalism is edited
            in Newsroom, not here.
          </>
        )
      }
    >
      {children}
    </AppShell>
  );
}
