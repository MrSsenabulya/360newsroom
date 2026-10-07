import {
  prisma,
  PublicationStatus,
  OpportunityListingStatus,
  EventLifecycleStatus,
  SystemJobStatus,
  VendorListingStatus,
  BreakingDevelopmentState,
  type Prisma,
} from '@campus360/db';
import { computeEventLifecycle } from './utility';
import { publishDueScheduled, publishDueScheduledSystem, type Actor } from './editorial';

export type JobResult = {
  jobName: string;
  status: 'succeeded' | 'failed' | 'skipped';
  affected: number;
  detail?: Record<string, unknown>;
  error?: string;
};

async function recordRun(
  jobName: string,
  run: () => Promise<{ affected: number; detail?: Record<string, unknown> }>,
): Promise<JobResult> {
  const row = await prisma.systemJobRun.create({
    data: { jobName, status: SystemJobStatus.RUNNING },
  });

  try {
    const result = await run();
    const detail = (result.detail ?? { affected: result.affected }) as Prisma.InputJsonValue;
    await prisma.systemJobRun.update({
      where: { id: row.id },
      data: {
        status: SystemJobStatus.SUCCEEDED,
        detail,
        finishedAt: new Date(),
      },
    });
    return {
      jobName,
      status: 'succeeded',
      affected: result.affected,
      detail: result.detail,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Job failed';
    await prisma.systemJobRun.update({
      where: { id: row.id },
      data: {
        status: SystemJobStatus.FAILED,
        error: message,
        finishedAt: new Date(),
      },
    });
    const { reportOperationalError } = await import('./ops');
    await reportOperationalError({
      surface: 'jobs',
      severity: 'error',
      message: `Job failed: ${jobName}`,
      detail: message,
    });
    return { jobName, status: 'failed', affected: 0, error: message };
  }
}

/** Remove expired Opportunities from active discovery; direct URLs stay. */
export async function expireOpportunitiesJob() {
  return recordRun('opportunity.expire', async () => {
    const now = new Date();
    const result = await prisma.opportunity.updateMany({
      where: {
        publicationStatus: PublicationStatus.PUBLISHED,
        listingStatus: OpportunityListingStatus.ACTIVE,
        OR: [
          { deadline: { lt: now } },
          { expiresAt: { lt: now } },
        ],
      },
      data: { listingStatus: OpportunityListingStatus.EXPIRED },
    });
    return { affected: result.count };
  });
}

/** Advance Event lifecycle (Upcoming → Happening → Completed). Manual postpone/cancel preserved. */
export async function refreshEventStatusesJob() {
  return recordRun('event.refresh_status', async () => {
    const events = await prisma.event.findMany({
      where: {
        publicationStatus: PublicationStatus.PUBLISHED,
        lifecycleStatus: {
          in: [
            EventLifecycleStatus.UPCOMING,
            EventLifecycleStatus.HAPPENING_NOW,
            EventLifecycleStatus.COMPLETED,
          ],
        },
      },
      select: { id: true, startAt: true, endAt: true, lifecycleStatus: true },
    });

    let affected = 0;
    for (const event of events) {
      const next = computeEventLifecycle(event.startAt, event.endAt);
      if (next !== event.lifecycleStatus) {
        await prisma.event.update({
          where: { id: event.id },
          data: { lifecycleStatus: next },
        });
        affected += 1;
      }
    }
    return { affected, detail: { scanned: events.length, affected } };
  });
}

/** Turn off Breaking banners past expiresAt. */
export async function expireBreakingBannersJob() {
  return recordRun('breaking.expire_banners', async () => {
    const result = await prisma.breakingUpdate.updateMany({
      where: {
        bannerEnabled: true,
        expiresAt: { lt: new Date() },
      },
      data: { bannerEnabled: false },
    });
    return { affected: result.count };
  });
}

/** Expire Campus Guide listings past listingEnd. */
export async function expireVendorListingsJob() {
  return recordRun('vendor.expire_listings', async () => {
    const result = await prisma.vendor.updateMany({
      where: {
        listingStatus: VendorListingStatus.ACTIVE,
        listingEnd: { lt: new Date() },
      },
      data: { listingStatus: VendorListingStatus.EXPIRED },
    });
    return { affected: result.count };
  });
}

/** Publish scheduled Articles that are due (requires publish-capable actor). */
export async function publishScheduledArticlesJob(actor: Actor) {
  return recordRun('article.publish_scheduled', async () => {
    const published = await publishDueScheduled(actor);
    return { affected: published.length, detail: { ids: published.map((a) => a.id) } };
  });
}

/** Cron path: publish due schedules without a human session. */
export async function publishScheduledArticlesSystemJob() {
  return recordRun('article.publish_scheduled_system', async () => {
    const published = await publishDueScheduledSystem();
    return { affected: published.length, detail: { ids: published.map((a) => a.id) } };
  });
}

/** Resolve stale developing Breaking past expiresAt into resolved (banner off). */
export async function resolveStaleBreakingJob() {
  return recordRun('breaking.resolve_stale', async () => {
    const result = await prisma.breakingUpdate.updateMany({
      where: {
        publicationStatus: PublicationStatus.PUBLISHED,
        developmentState: BreakingDevelopmentState.DEVELOPING,
        expiresAt: { lt: new Date() },
      },
      data: {
        developmentState: BreakingDevelopmentState.RESOLVED,
        bannerEnabled: false,
        resolvedAt: new Date(),
      },
    });
    return { affected: result.count };
  });
}

export async function runUtilityJobsTick(actor?: Actor | null) {
  const results: JobResult[] = [];
  results.push(await expireOpportunitiesJob());
  results.push(await refreshEventStatusesJob());
  results.push(await expireBreakingBannersJob());
  results.push(await expireVendorListingsJob());
  results.push(await resolveStaleBreakingJob());
  if (actor) {
    results.push(await publishScheduledArticlesJob(actor));
  } else {
    results.push(await publishScheduledArticlesSystemJob());
  }
  return results;
}

export async function listRecentJobRuns(limit = 20) {
  return prisma.systemJobRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}
