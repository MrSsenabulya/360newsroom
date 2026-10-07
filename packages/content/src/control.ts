import {
  AuthorizationError,
  roleHasCapability,
  type Capability,
  type InternalRole,
} from '@campus360/domain';
import {
  prisma,
  PublicationStatus,
  WorkflowStatus,
  OpportunityListingStatus,
  VendorListingStatus,
  CampaignStatus,
  DeliverableStatus,
  LeadStatus,
  SystemJobStatus,
  type Role,
} from '@campus360/db';
import { searchAdapter } from '@campus360/search';
import type { Actor } from './editorial';

function assertAny(actor: Actor, capabilities: Capability[]) {
  if (!capabilities.some((cap) => roleHasCapability(actor.role, cap))) {
    throw new AuthorizationError(`Missing one of: ${capabilities.join(', ')}`);
  }
}

export async function getControlOverview(actor: Actor) {
  assertAny(actor, [
    'control.overview',
    'campaign.manage',
    'vendor.approve',
    'platform.health.view',
    'users.manage',
    'audit.view',
  ]);

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    publishedArticles,
    inReview,
    scheduled,
    liveCampaigns,
    overdueDeliverables,
    openLeads,
    activeVendors,
    pendingVendors,
    activeOpportunities,
    failedJobs,
    recentAudit,
    recentOpsErrors,
  ] = await Promise.all([
    prisma.article.count({ where: { publicationStatus: PublicationStatus.PUBLISHED } }),
    prisma.article.count({ where: { workflowStatus: WorkflowStatus.IN_REVIEW } }),
    prisma.article.count({
      where: {
        workflowStatus: WorkflowStatus.SCHEDULED,
        scheduledAt: { lte: weekAhead },
      },
    }),
    prisma.campaign.count({
      where: { status: { in: [CampaignStatus.LIVE, CampaignStatus.SCHEDULED, CampaignStatus.SETUP] } },
    }),
    prisma.campaignDeliverable.count({
      where: {
        status: { in: [DeliverableStatus.PLANNED, DeliverableStatus.BRIEFED, DeliverableStatus.IN_PROGRESS] },
        dueAt: { lt: now },
      },
    }),
    prisma.commercialLead.count({
      where: { status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.FOLLOW_UP] } },
    }),
    prisma.vendor.count({ where: { listingStatus: VendorListingStatus.ACTIVE } }),
    prisma.vendor.count({
      where: { listingStatus: { in: [VendorListingStatus.DRAFT, VendorListingStatus.PENDING_REVIEW] } },
    }),
    prisma.opportunity.count({
      where: {
        publicationStatus: PublicationStatus.PUBLISHED,
        listingStatus: OpportunityListingStatus.ACTIVE,
      },
    }),
    prisma.systemJobRun.count({
      where: {
        status: SystemJobStatus.FAILED,
        startedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { actor: { select: { email: true, fullName: true } } },
    }),
    prisma.operationalEvent.count({
      where: {
        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        severity: { in: ['error', 'critical'] },
      },
    }),
  ]);

  return {
    publishedArticles,
    inReview,
    scheduledDueSoon: scheduled,
    liveCampaigns,
    overdueDeliverables,
    openLeads,
    activeVendors,
    pendingVendors,
    activeOpportunities,
    failedJobsWeek: failedJobs,
    recentAudit,
    recentOpsErrors,
  };
}

export async function getEditorialHealth(actor: Actor) {
  assertAny(actor, ['control.overview', 'editorial.review', 'editorial.publish']);

  const [byWorkflow, scheduledQueue, breakingOpen] = await Promise.all([
    prisma.article.groupBy({
      by: ['workflowStatus'],
      _count: { _all: true },
    }),
    prisma.article.findMany({
      where: {
        workflowStatus: WorkflowStatus.SCHEDULED,
        scheduledAt: { not: null },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
        workflowStatus: true,
      },
    }),
    prisma.breakingUpdate.count({
      where: {
        publicationStatus: PublicationStatus.PUBLISHED,
        developmentState: { in: ['DEVELOPING', 'VERIFICATION', 'SUBMITTED'] },
      },
    }),
  ]);

  return { byWorkflow, scheduledQueue, breakingOpen };
}

export async function getPlatformHealth(actor: Actor) {
  assertCapability(actor, 'platform.health.view');

  let database: 'ok' | 'down' = 'ok';
  let databaseDetail: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = 'down';
    databaseDetail = error instanceof Error ? error.message : 'unreachable';
    const { reportOperationalError } = await import('./ops');
    await reportOperationalError({
      surface: 'control',
      severity: 'critical',
      message: 'Postgres health probe failed',
      detail: databaseDetail,
      requestPath: '/health',
    });
  }

  let search: 'ok' | 'down' = 'ok';
  let searchProvider: string | undefined;
  let searchDetail: string | undefined;
  try {
    const health = await searchAdapter.health();
    searchProvider = health.provider;
    if (!health.ok) {
      search = 'down';
      searchDetail = health.detail;
      const { reportOperationalError } = await import('./ops');
      await reportOperationalError({
        surface: 'control',
        severity: 'error',
        message: 'Search health probe failed',
        detail: searchDetail,
        requestPath: '/health',
      });
    }
  } catch (error) {
    search = 'down';
    searchDetail = error instanceof Error ? error.message : 'unreachable';
    const { reportOperationalError } = await import('./ops');
    await reportOperationalError({
      surface: 'control',
      severity: 'error',
      message: 'Search health probe unreachable',
      detail: searchDetail,
      requestPath: '/health',
    });
  }

  const recentJobs = await prisma.systemJobRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 15,
  });

  const recentErrors = await prisma.operationalEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 25,
    include: { actor: { select: { email: true, fullName: true } } },
  });

  const recentErrorCount = await prisma.operationalEvent.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      severity: { in: ['error', 'critical'] },
    },
  });

  return {
    database,
    databaseDetail,
    search,
    searchProvider,
    searchDetail,
    recentJobs,
    recentErrors,
    recentErrorCount,
  };
}

function assertCapability(actor: Actor, capability: Capability) {
  if (!roleHasCapability(actor.role, capability)) {
    throw new AuthorizationError(`Missing capability: ${capability}`);
  }
}

export async function listAuditEvents(actor: Actor, limit = 50) {
  assertCapability(actor, 'audit.view');
  return prisma.auditEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { actor: { select: { email: true, fullName: true, role: true } } },
  });
}

export async function listPeople(actor: Actor) {
  assertCapability(actor, 'users.manage');
  return prisma.userProfile.findMany({
    orderBy: { email: 'asc' },
    include: {
      campusScopes: { include: { campus: { select: { name: true, slug: true } } } },
    },
  });
}

export async function updateUserRole(actor: Actor, userId: string, role: Role) {
  assertCapability(actor, 'users.manage');
  if (userId === actor.id && role !== (actor.role as Role)) {
    throw new AuthorizationError('Cannot change your own role in this flow');
  }
  const user = await prisma.userProfile.update({
    where: { id: userId },
    data: { role },
  });
  await prisma.auditEvent.create({
    data: {
      actorId: actor.id,
      action: 'user.role_change',
      entityType: 'UserProfile',
      entityId: userId,
      metadata: { role },
    },
  });
  return user;
}

export async function setUserActive(actor: Actor, userId: string, isActive: boolean) {
  assertCapability(actor, 'users.manage');
  if (userId === actor.id && !isActive) {
    throw new AuthorizationError('Cannot deactivate your own account here');
  }
  const user = await prisma.userProfile.update({
    where: { id: userId },
    data: { isActive },
  });
  await prisma.auditEvent.create({
    data: {
      actorId: actor.id,
      action: isActive ? 'user.reactivate' : 'user.deactivate',
      entityType: 'UserProfile',
      entityId: userId,
      metadata: { isActive },
    },
  });
  return user;
}

export async function setUserCampusScopes(actor: Actor, userId: string, campusIds: string[]) {
  assertCapability(actor, 'users.manage');
  await prisma.$transaction(async (tx) => {
    await tx.campusScope.deleteMany({ where: { userId } });
    if (campusIds.length > 0) {
      await tx.campusScope.createMany({
        data: campusIds.map((campusId) => ({ userId, campusId })),
      });
    }
  });
  await prisma.auditEvent.create({
    data: {
      actorId: actor.id,
      action: 'user.campus_scope_change',
      entityType: 'UserProfile',
      entityId: userId,
      metadata: { campusIds },
    },
  });
}

export function roleCanAccessControl(role: InternalRole) {
  return (
    roleHasCapability(role, 'control.overview') ||
    roleHasCapability(role, 'campaign.manage') ||
    roleHasCapability(role, 'vendor.approve') ||
    roleHasCapability(role, 'users.manage') ||
    roleHasCapability(role, 'platform.health.view') ||
    roleHasCapability(role, 'audit.view')
  );
}
