'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faNewspaper,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faBell,
  faFolderOpen,
  faPenToSquare,
  faEye,
  faUser,
  faCircleUser,
  faBuilding,
  faCalendar,
  faHandshake,
  faChartBar,
  faClipboard,
  faHardDrive,
  faComments,
  faStar,
  faBookmark,
  faFileLines,
  faSquarePlus,
  faCircleQuestion,
  faMap,
  faIdBadge,
} from '@fortawesome/free-regular-svg-icons';

/** Outlined (regular) Font Awesome icons only — no solid fills. */
export const fa = {
  newspaper: faNewspaper,
  clock: faClock,
  check: faCircleCheck,
  xmark: faCircleXmark,
  bell: faBell,
  folder: faFolderOpen,
  edit: faPenToSquare,
  eye: faEye,
  user: faUser,
  users: faCircleUser,
  building: faBuilding,
  calendar: faCalendar,
  handshake: faHandshake,
  chart: faChartBar,
  clipboard: faClipboard,
  drive: faHardDrive,
  comments: faComments,
  star: faStar,
  bookmark: faBookmark,
  file: faFileLines,
  plus: faSquarePlus,
  help: faCircleQuestion,
  map: faMap,
  badge: faIdBadge,
} as const;

export type FaName = keyof typeof fa;

type IconProps = {
  name: FaName;
  className?: string;
  title?: string;
};

export function Icon({ name, className, title }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={fa[name] as IconDefinition}
      className={className ? `c360-icon ${className}` : 'c360-icon'}
      title={title}
      aria-hidden={title ? undefined : true}
    />
  );
}

type DashStatProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: FaName;
  href?: string;
  tone?: 'default' | 'warn' | 'ok';
};

export function DashStat({ label, value, hint, icon, href, tone = 'default' }: DashStatProps) {
  const body = (
    <>
      <span className={`c360-dash-stat__icon c360-dash-stat__icon--${tone}`} aria-hidden="true">
        <Icon name={icon} />
      </span>
      <span className="c360-dash-stat__label">{label}</span>
      <strong className="c360-dash-stat__value">{value}</strong>
      {hint ? <span className="c360-dash-stat__hint">{hint}</span> : null}
    </>
  );

  if (href) {
    return (
      <a className="c360-dash-stat" href={href}>
        {body}
      </a>
    );
  }

  return <div className="c360-dash-stat">{body}</div>;
}

type DashActionProps = {
  href: string;
  label: string;
  icon: FaName;
  primary?: boolean;
};

export function DashAction({ href, label, icon, primary }: DashActionProps) {
  return (
    <a className={`c360-dash-action${primary ? ' c360-dash-action--primary' : ''}`} href={href}>
      <Icon name={icon} />
      <span>{label}</span>
    </a>
  );
}
