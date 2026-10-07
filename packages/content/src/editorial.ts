import {
  ARTICLE_TRANSITIONS,
  AuthorizationError,
  WorkflowError,
  roleHasCapability,
  roleIsCampusScoped,
  type Capability,
  type WorkflowStatus,
} from '@campus360/domain';
import {
  prisma,
  PublicationStatus,
  WorkflowStatus as DbWorkflow,
  BreakingDevelopmentState,
  VerificationStatus,
  EditorialRisk,
  MediaType,
  MediaRights,
  ProgrammeType,
  ProgrammeStatus,
  EpisodeProductionStatus,
  type ArticleType,
  type BreakingPriority,
  type Prisma,
} from '@campus360/db';
import { videoAdapter } from '@campus360/video';
import { slugify } from './slug';
import { isEmptyHtml, sanitizeEditorialHtml } from './sanitize';
import {
  assertCampusAccess,
  assertCapability,
  type Actor,
} from './actor';

export type { Actor } from './actor';
export { assertCampusAccess, assertCapability, loadActor } from './actor';

async function recordActivity(input: {
  actorId: string | null;
  action: string;
  articleId?: string;
  breakingId?: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.$transaction([
    prisma.editorialActivity.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        articleId: input.articleId,
        breakingId: input.breakingId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        note: input.note,
        metadata: input.metadata,
      },
    }),
    prisma.auditEvent.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.articleId ? 'Article' : input.breakingId ? 'BreakingUpdate' : null,
        entityId: input.articleId ?? input.breakingId ?? null,
        metadata: input.metadata,
      },
    }),
  ]);
}

async function snapshotArticle(articleId: string, actorId: string) {
  const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  const latest = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { version: 'desc' },
  });
  const version = (latest?.version ?? 0) + 1;
  await prisma.articleVersion.create({
    data: {
      articleId,
      version,
      title: article.title,
      standfirst: article.standfirst,
      body: article.body,
      workflowStatus: article.workflowStatus,
      createdById: actorId,
    },
  });
}

function articleScopeWhere(actor: Actor): Prisma.ArticleWhereInput {
  if (!roleIsCampusScoped(actor.role)) return {};
  return {
    OR: [
      { createdById: actor.id },
      { campuses: { some: { campusId: { in: actor.campusIds } } } },
    ],
  };
}

function breakingScopeWhere(actor: Actor): Prisma.BreakingUpdateWhereInput {
  if (!roleIsCampusScoped(actor.role)) return {};
  return {
    OR: [{ reporterId: actor.id }, { campusId: { in: actor.campusIds } }],
  };
}

export async function listEditorialArticles(actor: Actor) {
  return prisma.article.findMany({
    where: articleScopeWhere(actor),
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      campuses: { include: { campus: true } },
      university: true,
      createdBy: true,
    },
  });
}

export async function listEditorialBreaking(actor: Actor) {
  return prisma.breakingUpdate.findMany({
    where: breakingScopeWhere(actor),
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: { campus: true, reporter: true },
  });
}

export async function listEditorialProgrammes() {
  return prisma.programme.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { episodes: true } } },
  });
}

export async function listReviewQueue(actor: Actor) {
  assertCapability(actor, 'editorial.review');
  return prisma.article.findMany({
    where: {
      workflowStatus: { in: [DbWorkflow.IN_REVIEW, DbWorkflow.VERIFICATION, DbWorkflow.READY] },
    },
    orderBy: [{ editorialRisk: 'desc' }, { updatedAt: 'asc' }],
    take: 50,
    include: {
      campuses: { include: { campus: true } },
      createdBy: true,
    },
  });
}

export async function listBreakingInbox(actor: Actor) {
  assertCapability(actor, 'breaking.review');
  return prisma.breakingUpdate.findMany({
    where: {
      publicationStatus: PublicationStatus.UNPUBLISHED,
      developmentState: {
        in: [BreakingDevelopmentState.SUBMITTED, BreakingDevelopmentState.VERIFICATION],
      },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    include: { campus: true, reporter: true },
  });
}

export async function createArticleDraft(
  actor: Actor,
  input: {
    title: string;
    standfirst?: string;
    body: string;
    articleType?: ArticleType;
    campusId?: string;
    universityId?: string;
    editorialRisk?: EditorialRisk;
    heroPublicUrl?: string;
    heroAlt?: string;
  },
) {
  assertCapability(actor, 'editorial.create');
  assertCampusAccess(actor, input.campusId);

  const body = sanitizeEditorialHtml(input.body);
  if (isEmptyHtml(body)) throw new WorkflowError('Body is required');

  let heroMediaId: string | undefined;
  if (input.heroPublicUrl?.trim()) {
    const media = await prisma.mediaAsset.create({
      data: {
        type: MediaType.IMAGE,
        publicUrl: input.heroPublicUrl.trim(),
        altText: input.heroAlt?.trim() || input.title,
        rights: MediaRights.THIRD_PARTY,
        campusId: input.campusId ?? null,
        uploadedById: actor.id,
      },
    });
    heroMediaId = media.id;
  }

  const slug = await ensureUniqueArticleSlug(slugify(input.title));
  const article = await prisma.article.create({
    data: {
      title: input.title,
      slug,
      standfirst: input.standfirst,
      body,
      articleType: input.articleType ?? 'NEWS',
      workflowStatus: DbWorkflow.DRAFT,
      publicationStatus: PublicationStatus.UNPUBLISHED,
      universityId: input.universityId,
      createdById: actor.id,
      editorialRisk: input.editorialRisk ?? EditorialRisk.LOW,
      heroMediaId,
      campuses: input.campusId ? { create: [{ campusId: input.campusId }] } : undefined,
    },
  });

  await snapshotArticle(article.id, actor.id);
  await recordActivity({
    actorId: actor.id,
    action: 'article.create',
    articleId: article.id,
    toStatus: DbWorkflow.DRAFT,
  });

  return article;
}

function canEditArticle(
  actor: Actor,
  article: { createdById: string | null; campuses: Array<{ campusId: string }> },
) {
  if (roleHasCapability(actor.role, 'editorial.editAny')) return true;
  if (!roleHasCapability(actor.role, 'editorial.editOwn')) return false;
  if (article.createdById === actor.id) return true;
  if (roleIsCampusScoped(actor.role)) {
    const campusId = article.campuses[0]?.campusId;
    return Boolean(campusId && actor.campusIds.includes(campusId));
  }
  return false;
}

export async function getEditorialArticle(actor: Actor, articleId: string) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, ...articleScopeWhere(actor) },
    include: {
      campuses: { include: { campus: true } },
      university: true,
      heroMedia: true,
      createdBy: true,
      topics: { include: { topic: true } },
    },
  });
  if (!article) throw new AuthorizationError('Article not found or outside your scope');
  return article;
}

export async function updateArticleDraft(
  actor: Actor,
  articleId: string,
  input: {
    title: string;
    standfirst?: string;
    body: string;
    campusId?: string;
    universityId?: string;
    editorialRisk?: EditorialRisk;
    heroPublicUrl?: string;
    heroAlt?: string;
  },
) {
  const article = await prisma.article.findUniqueOrThrow({
    where: { id: articleId },
    include: { campuses: true },
  });

  if (!canEditArticle(actor, article)) {
    throw new AuthorizationError('Missing capability to edit this article');
  }
  assertCampusAccess(actor, input.campusId ?? article.campuses[0]?.campusId);

  let heroMediaId = article.heroMediaId;
  const heroUrl = input.heroPublicUrl?.trim();
  if (heroUrl) {
    const media = await prisma.mediaAsset.create({
      data: {
        type: MediaType.IMAGE,
        publicUrl: heroUrl,
        altText: input.heroAlt?.trim() || input.title,
        rights: MediaRights.THIRD_PARTY,
        campusId: input.campusId ?? article.campuses[0]?.campusId ?? null,
        uploadedById: actor.id,
      },
    });
    heroMediaId = media.id;
  }

  await snapshotArticle(articleId, actor.id);

  const body = sanitizeEditorialHtml(input.body);
  if (isEmptyHtml(body)) throw new WorkflowError('Body is required');

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      title: input.title,
      standfirst: input.standfirst || null,
      body,
      universityId: input.universityId || null,
      editorialRisk: input.editorialRisk ?? article.editorialRisk,
      heroMediaId,
      campuses: input.campusId
        ? {
            deleteMany: {},
            create: [{ campusId: input.campusId }],
          }
        : undefined,
    },
  });

  await recordActivity({
    actorId: actor.id,
    action: 'article.update',
    articleId,
    metadata: { title: input.title },
  });

  return updated;
}

/** Drafts are hard-deleted; published/scheduled content is archived off the public site. */
export async function deleteOrArchiveArticle(actor: Actor, articleId: string) {
  const article = await prisma.article.findUniqueOrThrow({
    where: { id: articleId },
    include: { campuses: true },
  });

  if (!canEditArticle(actor, article) && !roleHasCapability(actor.role, 'editorial.publish')) {
    throw new AuthorizationError('Missing capability to remove this article');
  }

  const soft =
    article.workflowStatus === DbWorkflow.PUBLISHED ||
    article.workflowStatus === DbWorkflow.SCHEDULED ||
    article.publicationStatus === PublicationStatus.PUBLISHED ||
    article.publicationStatus === PublicationStatus.SCHEDULED;

  if (soft) {
    assertCapability(actor, 'editorial.publish');
    return transitionArticle(actor, articleId, 'ARCHIVED');
  }

  await recordActivity({
    actorId: actor.id,
    action: 'article.delete',
    articleId,
    fromStatus: article.workflowStatus,
  });
  await prisma.article.delete({ where: { id: articleId } });
  return { id: articleId, deleted: true as const };
}

export async function transitionArticle(
  actor: Actor,
  articleId: string,
  to: WorkflowStatus,
  options?: { note?: string; scheduledAt?: Date | null },
) {
  const article = await prisma.article.findUniqueOrThrow({
    where: { id: articleId },
    include: { campuses: true },
  });

  if (roleIsCampusScoped(actor.role)) {
    const campusId = article.campuses[0]?.campusId;
    const owns = article.createdById === actor.id;
    if (!owns) assertCampusAccess(actor, campusId);
  }

  const from = article.workflowStatus as WorkflowStatus;
  const required = ARTICLE_TRANSITIONS[from]?.[to];
  if (!required) {
    throw new WorkflowError(`Illegal transition ${from} → ${to}`);
  }
  assertCapability(actor, required);

  if (to === 'PUBLISHED' && article.editorialRisk === EditorialRisk.HIGH) {
    assertCapability(actor, 'editorial.escalate');
  }

  await snapshotArticle(articleId, actor.id);

  const now = new Date();
  const data: Prisma.ArticleUpdateInput = {
    workflowStatus: to as DbWorkflow,
    reviewNotes: options?.note ?? article.reviewNotes,
  };

  if (to === 'VERIFICATION' || to === 'READY') {
    data.verificationStatus = VerificationStatus.PENDING;
  }
  if (to === 'READY') {
    data.verificationStatus = VerificationStatus.VERIFIED;
    data.editor = { connect: { id: actor.id } };
  }
  if (to === 'SCHEDULED') {
    if (!options?.scheduledAt) {
      throw new WorkflowError('scheduledAt is required to schedule');
    }
    data.scheduledAt = options.scheduledAt;
    data.publicationStatus = PublicationStatus.SCHEDULED;
  }
  if (to === 'PUBLISHED') {
    data.publicationStatus = PublicationStatus.PUBLISHED;
    data.verificationStatus = VerificationStatus.VERIFIED;
    data.firstPublishedAt = article.firstPublishedAt ?? now;
    data.lastPublishedAt = now;
    data.editor = { connect: { id: actor.id } };
  }
  if (to === 'ARCHIVED') {
    data.publicationStatus = PublicationStatus.ARCHIVED;
  }
  if (to === 'CHANGES_REQUESTED' || to === 'IN_REVIEW' || to === 'DRAFT') {
    data.publicationStatus = PublicationStatus.UNPUBLISHED;
  }

  const updated = await prisma.article.update({ where: { id: articleId }, data });
  await recordActivity({
    actorId: actor.id,
    action: `article.transition.${to}`,
    articleId,
    fromStatus: from,
    toStatus: to,
    note: options?.note,
  });
  return updated;
}

/** Convenience: editors publish from READY (or force via escalate for HIGH risk). */
export async function publishArticle(actor: Actor, articleId: string) {
  const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  if (article.workflowStatus === DbWorkflow.READY || article.workflowStatus === DbWorkflow.SCHEDULED) {
    return transitionArticle(actor, articleId, 'PUBLISHED');
  }
  if (article.workflowStatus === DbWorkflow.DRAFT) {
    // Editors may fast-track: DRAFT → IN_REVIEW → VERIFICATION → READY → PUBLISHED
    if (!roleHasCapability(actor.role, 'editorial.publish')) {
      throw new AuthorizationError('Reporters cannot publish directly');
    }
    await transitionArticle(actor, articleId, 'IN_REVIEW');
    await transitionArticle(actor, articleId, 'VERIFICATION');
    await transitionArticle(actor, articleId, 'READY');
    return transitionArticle(actor, articleId, 'PUBLISHED');
  }
  throw new WorkflowError(`Cannot publish from ${article.workflowStatus}`);
}

export async function createBreakingDraft(
  actor: Actor,
  input: {
    headline: string;
    shortUpdate: string;
    campusId?: string;
    universityId?: string;
    sourceContext?: string;
    priority?: BreakingPriority;
    occurredAt?: Date;
  },
) {
  assertCapability(actor, 'breaking.submit');
  assertCampusAccess(actor, input.campusId);

  const slug = await ensureUniqueBreakingSlug(slugify(input.headline));
  const item = await prisma.breakingUpdate.create({
    data: {
      headline: input.headline,
      slug,
      shortUpdate: input.shortUpdate,
      campusId: input.campusId,
      universityId: input.universityId,
      reporterId: actor.id,
      sourceContext: input.sourceContext,
      priority: input.priority ?? 'NORMAL',
      developmentState: BreakingDevelopmentState.SUBMITTED,
      publicationStatus: PublicationStatus.UNPUBLISHED,
      verificationStatus: VerificationStatus.PENDING,
      timeline: {
        create: [
          {
            body: input.shortUpdate,
            occurredAt: input.occurredAt ?? new Date(),
          },
        ],
      },
    },
  });

  await recordActivity({
    actorId: actor.id,
    action: 'breaking.submit',
    breakingId: item.id,
    toStatus: BreakingDevelopmentState.SUBMITTED,
  });

  return item;
}

export async function publishBreaking(actor: Actor, breakingId: string) {
  assertCapability(actor, 'breaking.publish');
  const item = await prisma.breakingUpdate.findUniqueOrThrow({ where: { id: breakingId } });
  if (roleIsCampusScoped(actor.role)) {
    throw new AuthorizationError('Correspondents cannot publish breaking updates');
  }

  const now = new Date();
  const updated = await prisma.breakingUpdate.update({
    where: { id: breakingId },
    data: {
      developmentState: BreakingDevelopmentState.DEVELOPING,
      publicationStatus: PublicationStatus.PUBLISHED,
      verificationStatus: VerificationStatus.VERIFIED,
      bannerEnabled: true,
      firstPublishedAt: item.firstPublishedAt ?? now,
      lastPublishedAt: now,
    },
  });

  await recordActivity({
    actorId: actor.id,
    action: 'breaking.publish',
    breakingId,
    fromStatus: item.developmentState,
    toStatus: BreakingDevelopmentState.DEVELOPING,
  });

  return updated;
}

export async function appendBreakingTimeline(actor: Actor, breakingId: string, body: string) {
  const item = await prisma.breakingUpdate.findUniqueOrThrow({ where: { id: breakingId } });
  const canEditOwn =
    item.reporterId === actor.id && roleHasCapability(actor.role, 'breaking.editOwn');
  const canReview = roleHasCapability(actor.role, 'breaking.review');
  if (!canEditOwn && !canReview) {
    throw new AuthorizationError('Cannot update this breaking item');
  }
  if (item.campusId) assertCampusAccess(actor, item.campusId);

  const now = new Date();
  const [entry] = await prisma.$transaction([
    prisma.breakingTimelineEntry.create({
      data: { breakingId, body, occurredAt: now },
    }),
    prisma.breakingUpdate.update({
      where: { id: breakingId },
      data: {
        shortUpdate: body,
        lastPublishedAt: item.publicationStatus === PublicationStatus.PUBLISHED ? now : item.lastPublishedAt,
        developmentState:
          item.publicationStatus === PublicationStatus.PUBLISHED
            ? BreakingDevelopmentState.DEVELOPING
            : item.developmentState,
      },
    }),
  ]);

  await recordActivity({
    actorId: actor.id,
    action: 'breaking.timeline.append',
    breakingId,
    note: body.slice(0, 200),
  });

  return entry;
}

export async function getEditorialBreaking(actor: Actor, breakingId: string) {
  const item = await prisma.breakingUpdate.findFirst({
    where: { id: breakingId, ...breakingScopeWhere(actor) },
    include: {
      campus: true,
      university: true,
      reporter: true,
      timeline: { orderBy: { occurredAt: 'desc' } },
    },
  });
  if (!item) throw new AuthorizationError('Breaking update not found or outside your scope');
  return item;
}

export async function updateBreaking(
  actor: Actor,
  breakingId: string,
  input: {
    headline: string;
    shortUpdate: string;
    campusId?: string;
    universityId?: string;
    sourceContext?: string;
    priority?: BreakingPriority;
    bannerEnabled?: boolean;
  },
) {
  const item = await prisma.breakingUpdate.findUniqueOrThrow({ where: { id: breakingId } });
  const canEditOwn =
    item.reporterId === actor.id && roleHasCapability(actor.role, 'breaking.editOwn');
  const canReview = roleHasCapability(actor.role, 'breaking.review');
  if (!canEditOwn && !canReview) {
    throw new AuthorizationError('Cannot edit this breaking item');
  }
  assertCampusAccess(actor, input.campusId ?? item.campusId);

  const updated = await prisma.breakingUpdate.update({
    where: { id: breakingId },
    data: {
      headline: input.headline.trim(),
      shortUpdate: input.shortUpdate.trim(),
      campusId: input.campusId || null,
      universityId: input.universityId || null,
      sourceContext: input.sourceContext?.trim() || null,
      priority: input.priority ?? item.priority,
      bannerEnabled: input.bannerEnabled ?? item.bannerEnabled,
    },
  });

  await recordActivity({
    actorId: actor.id,
    action: 'breaking.update',
    breakingId,
  });
  return updated;
}

export async function deleteOrArchiveBreaking(actor: Actor, breakingId: string) {
  const item = await prisma.breakingUpdate.findUniqueOrThrow({ where: { id: breakingId } });
  const canEditOwn =
    item.reporterId === actor.id && roleHasCapability(actor.role, 'breaking.editOwn');
  const canPublish = roleHasCapability(actor.role, 'breaking.publish');
  const canReview = roleHasCapability(actor.role, 'breaking.review');
  if (!canEditOwn && !canPublish && !canReview) {
    throw new AuthorizationError('Cannot remove this breaking item');
  }

  if (item.publicationStatus === PublicationStatus.PUBLISHED) {
    assertCapability(actor, 'breaking.publish');
    const updated = await prisma.breakingUpdate.update({
      where: { id: breakingId },
      data: {
        publicationStatus: PublicationStatus.ARCHIVED,
        bannerEnabled: false,
        developmentState: BreakingDevelopmentState.RESOLVED,
      },
    });
    await recordActivity({
      actorId: actor.id,
      action: 'breaking.archive',
      breakingId,
    });
    return updated;
  }

  await recordActivity({
    actorId: actor.id,
    action: 'breaking.delete',
    breakingId,
  });
  await prisma.breakingUpdate.delete({ where: { id: breakingId } });
  return { id: breakingId, deleted: true as const };
}

export async function addSource(
  actor: Actor,
  input: {
    label: string;
    type?: string;
    privateIdentity?: string;
    privateNotes?: string;
    evidenceUrl?: string;
    articleId?: string;
    breakingId?: string;
  },
) {
  assertCapability(actor, 'editorial.create');
  return prisma.source.create({
    data: {
      label: input.label,
      type: (input.type as never) ?? 'OTHER',
      privateIdentity: input.privateIdentity,
      privateNotes: input.privateNotes,
      evidenceUrl: input.evidenceUrl,
      articleId: input.articleId,
      breakingId: input.breakingId,
      createdById: actor.id,
    },
  });
}

export async function listArticleSources(actor: Actor, articleId: string) {
  assertCapability(actor, 'editorial.review');
  return prisma.source.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function publishDueScheduled(actor: Actor) {
  assertCapability(actor, 'editorial.publish');
  const due = await prisma.article.findMany({
    where: {
      workflowStatus: DbWorkflow.SCHEDULED,
      scheduledAt: { lte: new Date() },
    },
  });
  const results = [];
  for (const article of due) {
    results.push(await transitionArticle(actor, article.id, 'PUBLISHED'));
  }
  return results;
}

/**
 * Cron/system path: publish due SCHEDULED articles without a human session.
 * Only SCHEDULED + past scheduledAt; high-risk items already cleared the escalate gate when scheduled.
 */
export async function publishDueScheduledSystem() {
  const due = await prisma.article.findMany({
    where: {
      workflowStatus: DbWorkflow.SCHEDULED,
      scheduledAt: { lte: new Date() },
    },
  });

  const results = [];
  for (const article of due) {
    const now = new Date();
    await snapshotArticleOptionalActor(article.id, null);
    const updated = await prisma.article.update({
      where: { id: article.id },
      data: {
        workflowStatus: DbWorkflow.PUBLISHED,
        publicationStatus: PublicationStatus.PUBLISHED,
        verificationStatus: VerificationStatus.VERIFIED,
        firstPublishedAt: article.firstPublishedAt ?? now,
        lastPublishedAt: now,
      },
    });
    await recordActivity({
      actorId: null,
      action: 'article.publish_scheduled_system',
      articleId: article.id,
      fromStatus: 'SCHEDULED',
      toStatus: 'PUBLISHED',
      note: 'system scheduled publish',
      metadata: { slug: article.slug },
    });
    results.push(updated);
  }
  return results;
}

async function snapshotArticleOptionalActor(articleId: string, actorId: string | null) {
  const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  const latest = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { version: 'desc' },
  });
  const version = (latest?.version ?? 0) + 1;
  await prisma.articleVersion.create({
    data: {
      articleId,
      version,
      title: article.title,
      standfirst: article.standfirst,
      body: article.body,
      workflowStatus: article.workflowStatus,
      createdById: actorId,
    },
  });
}

export async function listGeographyOptions(actor: Actor) {
  const campuses = await prisma.campus.findMany({
    where: {
      isActive: true,
      ...(roleIsCampusScoped(actor.role) && actor.campusIds.length > 0
        ? { id: { in: actor.campusIds } }
        : {}),
    },
    orderBy: { name: 'asc' },
    include: { university: true },
  });
  const universities = await prisma.university.findMany({ orderBy: { name: 'asc' } });
  return { campuses, universities };
}

async function ensureUniqueArticleSlug(base: string) {
  let candidate = base || 'article';
  let i = 2;
  while (await prisma.article.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

async function ensureUniqueBreakingSlug(base: string) {
  let candidate = base || 'breaking';
  let i = 2;
  while (await prisma.breakingUpdate.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

async function ensureUniqueProgrammeSlug(base: string) {
  let candidate = base || 'programme';
  let i = 2;
  while (await prisma.programme.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

async function ensureUniqueEpisodeSlug(programmeId: string, base: string) {
  let candidate = base || 'episode';
  let i = 2;
  while (
    await prisma.episode.findUnique({
      where: { programmeId_slug: { programmeId, slug: candidate } },
    })
  ) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

async function createImageAsset(
  actor: Actor,
  input: { publicUrl: string; altText?: string; campusId?: string | null },
) {
  return prisma.mediaAsset.create({
    data: {
      type: MediaType.IMAGE,
      publicUrl: input.publicUrl,
      altText: input.altText || null,
      rights: MediaRights.THIRD_PARTY,
      campusId: input.campusId ?? null,
      uploadedById: actor.id,
    },
  });
}

function assertValidYouTubeUrl(videoUrl: string) {
  if (!videoAdapter.isReady(videoUrl)) {
    throw new WorkflowError('A valid YouTube URL or video id is required');
  }
  return videoAdapter.parse(videoUrl).watchUrl ?? videoUrl.trim();
}

export async function getEditorialProgramme(_actor: Actor, slug: string) {
  const programme = await prisma.programme.findUnique({
    where: { slug },
    include: {
      cover: true,
      episodes: {
        orderBy: [{ episodeNumber: 'asc' }, { updatedAt: 'desc' }],
        include: { thumbnail: true },
      },
    },
  });
  if (!programme) throw new AuthorizationError('Programme not found');
  return programme;
}

export async function createProgramme(
  actor: Actor,
  input: {
    name: string;
    description?: string;
    programmeType?: ProgrammeType;
    status?: ProgrammeStatus;
    coverPublicUrl?: string;
  },
) {
  assertCapability(actor, 'programme.manage');
  const slug = await ensureUniqueProgrammeSlug(slugify(input.name));
  let coverId: string | undefined;
  if (input.coverPublicUrl?.trim()) {
    const cover = await createImageAsset(actor, {
      publicUrl: input.coverPublicUrl.trim(),
      altText: input.name,
    });
    coverId = cover.id;
  }

  const programme = await prisma.programme.create({
    data: {
      name: input.name,
      slug,
      description: input.description ? sanitizeEditorialHtml(input.description) || null : null,
      programmeType: input.programmeType ?? ProgrammeType.TALK,
      status: input.status ?? ProgrammeStatus.DRAFT,
      coverId,
    },
  });

  await recordActivity({
    actorId: actor.id,
    action: 'programme.create',
    metadata: { programmeId: programme.id, slug },
  });
  return programme;
}

export async function updateProgramme(
  actor: Actor,
  programmeId: string,
  input: {
    name: string;
    description?: string;
    programmeType?: ProgrammeType;
    status?: ProgrammeStatus;
    coverPublicUrl?: string;
  },
) {
  assertCapability(actor, 'programme.manage');
  const existing = await prisma.programme.findUniqueOrThrow({ where: { id: programmeId } });

  let coverId = existing.coverId;
  if (input.coverPublicUrl?.trim()) {
    const cover = await createImageAsset(actor, {
      publicUrl: input.coverPublicUrl.trim(),
      altText: input.name,
    });
    coverId = cover.id;
  }

  const programme = await prisma.programme.update({
    where: { id: programmeId },
    data: {
      name: input.name,
      description: input.description ? sanitizeEditorialHtml(input.description) || null : null,
      programmeType: input.programmeType ?? existing.programmeType,
      status: input.status ?? existing.status,
      coverId,
    },
  });

  await recordActivity({
    actorId: actor.id,
    action: 'programme.update',
    metadata: { programmeId, slug: programme.slug },
  });
  return programme;
}

export async function deleteOrArchiveProgramme(actor: Actor, programmeId: string) {
  assertCapability(actor, 'programme.manage');
  const programme = await prisma.programme.findUniqueOrThrow({
    where: { id: programmeId },
    include: { _count: { select: { episodes: true } } },
  });

  if (programme.status === ProgrammeStatus.ACTIVE || programme._count.episodes > 0) {
    const updated = await prisma.programme.update({
      where: { id: programmeId },
      data: { status: ProgrammeStatus.ARCHIVED },
    });
    await prisma.episode.updateMany({
      where: { programmeId },
      data: {
        productionStatus: EpisodeProductionStatus.ARCHIVED,
        publicationStatus: PublicationStatus.ARCHIVED,
      },
    });
    await recordActivity({
      actorId: actor.id,
      action: 'programme.archive',
      metadata: { programmeId },
    });
    return updated;
  }

  await recordActivity({
    actorId: actor.id,
    action: 'programme.delete',
    metadata: { programmeId },
  });
  await prisma.programme.delete({ where: { id: programmeId } });
  return { id: programmeId, deleted: true as const };
}

export async function createEpisode(
  actor: Actor,
  input: {
    programmeId: string;
    title: string;
    description?: string;
    episodeNumber?: number;
    videoUrl: string;
    thumbnailPublicUrl?: string;
    publish?: boolean;
  },
) {
  assertCapability(actor, 'programme.manage');
  const programme = await prisma.programme.findUniqueOrThrow({ where: { id: input.programmeId } });
  const videoUrl = assertValidYouTubeUrl(input.videoUrl);
  const slug = await ensureUniqueEpisodeSlug(programme.id, slugify(input.title));

  let thumbnailId: string | undefined;
  if (input.thumbnailPublicUrl?.trim()) {
    const thumb = await createImageAsset(actor, {
      publicUrl: input.thumbnailPublicUrl.trim(),
      altText: input.title,
    });
    thumbnailId = thumb.id;
  }

  const publish = Boolean(input.publish);
  const episode = await prisma.episode.create({
    data: {
      programmeId: programme.id,
      title: input.title,
      slug,
      description: input.description ? sanitizeEditorialHtml(input.description) || null : null,
      episodeNumber: input.episodeNumber ?? null,
      videoUrl,
      thumbnailId,
      productionStatus: publish
        ? EpisodeProductionStatus.PUBLISHED
        : EpisodeProductionStatus.READY,
      publicationStatus: publish ? PublicationStatus.PUBLISHED : PublicationStatus.UNPUBLISHED,
      publishedAt: publish ? new Date() : null,
    },
  });

  if (programme.status === ProgrammeStatus.DRAFT && publish) {
    await prisma.programme.update({
      where: { id: programme.id },
      data: { status: ProgrammeStatus.ACTIVE },
    });
  }

  await recordActivity({
    actorId: actor.id,
    action: 'episode.create',
    metadata: { episodeId: episode.id, programmeId: programme.id, slug },
  });
  return episode;
}

export async function updateEpisode(
  actor: Actor,
  episodeId: string,
  input: {
    title: string;
    description?: string;
    episodeNumber?: number;
    videoUrl: string;
    thumbnailPublicUrl?: string;
    publish?: boolean;
  },
) {
  assertCapability(actor, 'programme.manage');
  const existing = await prisma.episode.findUniqueOrThrow({ where: { id: episodeId } });
  const videoUrl = assertValidYouTubeUrl(input.videoUrl);

  let thumbnailId = existing.thumbnailId;
  if (input.thumbnailPublicUrl?.trim()) {
    const thumb = await createImageAsset(actor, {
      publicUrl: input.thumbnailPublicUrl.trim(),
      altText: input.title,
    });
    thumbnailId = thumb.id;
  }

  const publish = input.publish;
  const data: Prisma.EpisodeUpdateInput = {
    title: input.title,
    description: input.description ? sanitizeEditorialHtml(input.description) || null : null,
    episodeNumber: input.episodeNumber ?? null,
    videoUrl,
    ...(thumbnailId
      ? { thumbnail: { connect: { id: thumbnailId } } }
      : {}),
  };

  if (publish === true) {
    data.productionStatus = EpisodeProductionStatus.PUBLISHED;
    data.publicationStatus = PublicationStatus.PUBLISHED;
    data.publishedAt = existing.publishedAt ?? new Date();
  } else if (publish === false) {
    data.publicationStatus = PublicationStatus.UNPUBLISHED;
    data.productionStatus = EpisodeProductionStatus.READY;
  }

  const episode = await prisma.episode.update({ where: { id: episodeId }, data });
  await recordActivity({
    actorId: actor.id,
    action: 'episode.update',
    metadata: { episodeId, programmeId: existing.programmeId },
  });
  return episode;
}

export async function archiveEpisode(actor: Actor, episodeId: string) {
  assertCapability(actor, 'programme.manage');
  const episode = await prisma.episode.update({
    where: { id: episodeId },
    data: {
      productionStatus: EpisodeProductionStatus.ARCHIVED,
      publicationStatus: PublicationStatus.ARCHIVED,
    },
  });
  await recordActivity({
    actorId: actor.id,
    action: 'episode.archive',
    metadata: { episodeId, programmeId: episode.programmeId },
  });
  return episode;
}
