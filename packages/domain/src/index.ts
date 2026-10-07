/** Shared domain enums and capability names. */

export const InternalRoles = [
  'SUPER_ADMIN',
  'EDITOR_IN_CHIEF',
  'MANAGING_EDITOR',
  'EDITOR',
  'JOURNALIST',
  'CAMPUS_CORRESPONDENT',
  'PROGRAMME_PRODUCER',
  'COMMERCIAL_MANAGER',
  'VENDOR_MANAGER',
  'PLATFORM_ADMIN',
] as const;

export type InternalRole = (typeof InternalRoles)[number];

export const Capabilities = [
  'editorial.create',
  'editorial.editOwn',
  'editorial.editAny',
  'editorial.submit',
  'editorial.review',
  'editorial.requestChanges',
  'editorial.verify',
  'editorial.publish',
  'editorial.schedule',
  'editorial.escalate',
  'breaking.submit',
  'breaking.editOwn',
  'breaking.review',
  'breaking.publish',
  'programme.manage',
  'campaign.manage',
  'vendor.approve',
  'platform.health.view',
  'platform.jobs.retry',
  'users.manage',
  'audit.view',
  'control.overview',
] as const;

export type Capability = (typeof Capabilities)[number];

export const ProductSurfaces = ['web', 'newsroom', 'control'] as const;
export type ProductSurface = (typeof ProductSurfaces)[number];

export const ArticleTypes = [
  'NEWS',
  'FEATURE',
  'OPINION',
  'INTERVIEW',
  'EXPLAINER',
  'REVIEW',
  'ANNOUNCEMENT',
] as const;

export type ArticleType = (typeof ArticleTypes)[number];

export const WorkflowStatuses = [
  'DRAFT',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'VERIFICATION',
  'READY',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export type WorkflowStatus = (typeof WorkflowStatuses)[number];

export const BreakingDevelopmentStates = [
  'SUBMITTED',
  'VERIFICATION',
  'DEVELOPING',
  'RESOLVED',
  'CONVERTED',
  'ARCHIVED',
] as const;

export type BreakingDevelopmentState = (typeof BreakingDevelopmentStates)[number];

const EDITORIAL_CORE = [
  'editorial.create',
  'editorial.editOwn',
  'editorial.submit',
  'breaking.submit',
  'breaking.editOwn',
] as const satisfies readonly Capability[];

const EDITOR_CAPS = [
  ...EDITORIAL_CORE,
  'editorial.editAny',
  'editorial.review',
  'editorial.requestChanges',
  'editorial.verify',
  'editorial.publish',
  'editorial.schedule',
  'breaking.review',
  'breaking.publish',
] as const satisfies readonly Capability[];

export const ROLE_CAPABILITIES: Record<InternalRole, readonly Capability[]> = {
  SUPER_ADMIN: Capabilities,
  EDITOR_IN_CHIEF: [
    ...EDITOR_CAPS,
    'editorial.escalate',
    'programme.manage',
    'audit.view',
    'control.overview',
    'platform.health.view',
  ],
  MANAGING_EDITOR: [...EDITOR_CAPS, 'programme.manage', 'control.overview'],
  EDITOR: EDITOR_CAPS,
  JOURNALIST: EDITORIAL_CORE,
  CAMPUS_CORRESPONDENT: EDITORIAL_CORE,
  PROGRAMME_PRODUCER: ['programme.manage', 'editorial.create', 'editorial.editOwn', 'editorial.submit'],
  COMMERCIAL_MANAGER: ['campaign.manage', 'control.overview', 'platform.health.view', 'audit.view'],
  VENDOR_MANAGER: ['vendor.approve', 'control.overview', 'platform.health.view'],
  PLATFORM_ADMIN: [
    'platform.health.view',
    'platform.jobs.retry',
    'users.manage',
    'audit.view',
    'control.overview',
  ],
};

export function roleHasCapability(role: InternalRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function roleIsCampusScoped(role: InternalRole): boolean {
  return role === 'CAMPUS_CORRESPONDENT' || role === 'JOURNALIST';
}

/** Legal article workflow edges and required capability. */
export const ARTICLE_TRANSITIONS: Record<
  WorkflowStatus,
  Partial<Record<WorkflowStatus, Capability>>
> = {
  DRAFT: { IN_REVIEW: 'editorial.submit' },
  IN_REVIEW: {
    CHANGES_REQUESTED: 'editorial.requestChanges',
    VERIFICATION: 'editorial.review',
  },
  CHANGES_REQUESTED: { IN_REVIEW: 'editorial.submit', DRAFT: 'editorial.editOwn' },
  VERIFICATION: { READY: 'editorial.verify', CHANGES_REQUESTED: 'editorial.requestChanges' },
  READY: {
    PUBLISHED: 'editorial.publish',
    SCHEDULED: 'editorial.schedule',
  },
  SCHEDULED: { PUBLISHED: 'editorial.publish', READY: 'editorial.schedule' },
  PUBLISHED: { ARCHIVED: 'editorial.publish' },
  ARCHIVED: {},
};

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}
