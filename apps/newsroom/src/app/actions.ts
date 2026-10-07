'use server';

import {
  addSource,
  appendBreakingTimeline,
  archiveEpisode,
  createArticleDraft,
  createBreakingDraft,
  createEpisode,
  createProgramme,
  deleteOrArchiveArticle,
  deleteOrArchiveBreaking,
  deleteOrArchiveProgramme,
  publishArticle,
  publishBreaking,
  publishDueScheduled,
  transitionArticle,
  updateArticleDraft,
  updateBreaking,
  updateEpisode,
  updateProgramme,
} from '@campus360/content/editorial';
import { loadActor } from '@campus360/content/actor';
import {
  approveVendor,
  createEventDraft,
  createOpportunityDraft,
  createVendorDraft,
  deleteOrArchiveEvent,
  deleteOrArchiveOpportunity,
  deleteOrArchiveVendor,
  publishEvent,
  publishOpportunity,
  updateEvent,
  updateOpportunity,
  updateVendor,
} from '@campus360/content/utility';
import { runUtilityJobsTick } from '@campus360/content/jobs';
import { AuthorizationError, WorkflowError, roleHasCapability } from '@campus360/domain';
import {
  EditorialRisk,
  EventType,
  OpportunityType,
  ProgrammeStatus,
  ProgrammeType,
} from '@campus360/db';
import { reportOperationalError } from '@campus360/content/ops';
import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { requireNewsroomUser } from '../lib/session';

function actionError(error: unknown): never {
  unstable_rethrow(error);
  if (!(error instanceof AuthorizationError) && !(error instanceof WorkflowError)) {
    const message = error instanceof Error ? error.message : 'Unexpected newsroom action failure';
    void reportOperationalError({
      surface: 'newsroom',
      severity: 'error',
      message: 'Newsroom server action failed',
      detail: message,
    });
  }
  throw error;
}

function flashErrorMessage(error: unknown): string {
  if (error instanceof AuthorizationError || error instanceof WorkflowError) {
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message.slice(0, 200);
  return 'Something went wrong. Try again.';
}

export async function createArticleAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const title = String(formData.get('title') ?? '').trim();
    const standfirst = String(formData.get('standfirst') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;
    const risk = String(formData.get('editorialRisk') ?? 'LOW') as EditorialRisk;
    const heroPublicUrl = String(formData.get('heroPublicUrl') ?? '').trim();
    const heroAlt = String(formData.get('heroAlt') ?? '').trim();

    if (!title || !body) throw new Error('Title and body are required');

    const article = await createArticleDraft(actor, {
      title,
      standfirst: standfirst || undefined,
      body,
      campusId,
      universityId,
      editorialRisk: risk,
      heroPublicUrl: heroPublicUrl || undefined,
      heroAlt: heroAlt || undefined,
    });

    revalidatePath('/articles');
    revalidatePath('/review');
    redirect(`/articles/${article.id}?created=1`);
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof AuthorizationError) && !(error instanceof WorkflowError)) {
      void reportOperationalError({
        surface: 'newsroom',
        severity: 'error',
        message: 'Create article failed',
        detail: flashErrorMessage(error),
      });
    }
    redirect(`/articles/new?error=${encodeURIComponent(flashErrorMessage(error))}`);
  }
}

export async function updateArticleAction(formData: FormData) {
  const articleId = String(formData.get('articleId') ?? '');
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const title = String(formData.get('title') ?? '').trim();
    const standfirst = String(formData.get('standfirst') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;
    const risk = String(formData.get('editorialRisk') ?? 'LOW') as EditorialRisk;
    const heroPublicUrl = String(formData.get('heroPublicUrl') ?? '').trim();
    const heroAlt = String(formData.get('heroAlt') ?? '').trim();

    if (!articleId || !title || !body) throw new Error('Article, title and body are required');

    await updateArticleDraft(actor, articleId, {
      title,
      standfirst: standfirst || undefined,
      body,
      campusId,
      universityId,
      editorialRisk: risk,
      heroPublicUrl: heroPublicUrl || undefined,
      heroAlt: heroAlt || undefined,
    });

    revalidatePath('/articles');
    revalidatePath(`/articles/${articleId}`);
    revalidatePath('/review');
    revalidatePath('/');
    revalidatePath('/latest');
    redirect(`/articles/${articleId}?saved=1`);
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof AuthorizationError) && !(error instanceof WorkflowError)) {
      void reportOperationalError({
        surface: 'newsroom',
        severity: 'error',
        message: 'Update article failed',
        detail: flashErrorMessage(error),
      });
    }
    if (articleId) {
      redirect(`/articles/${articleId}?error=${encodeURIComponent(flashErrorMessage(error))}`);
    }
    actionError(error);
  }
}

export async function deleteArticleAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const articleId = String(formData.get('articleId') ?? '');
    if (!articleId) throw new Error('Article id required');
    await deleteOrArchiveArticle(actor, articleId);
    revalidatePath('/articles');
    revalidatePath('/review');
    revalidatePath('/');
    revalidatePath('/latest');
    redirect('/articles?removed=1');
  } catch (error) {
    actionError(error);
  }
}

export async function submitArticleAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const articleId = String(formData.get('articleId') ?? '');
  await transitionArticle(actor, articleId, 'IN_REVIEW');
  revalidatePath('/articles');
  revalidatePath('/review');
  redirect('/articles?submitted=1');
}

export async function requestChangesAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const articleId = String(formData.get('articleId') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  await transitionArticle(actor, articleId, 'CHANGES_REQUESTED', { note });
  revalidatePath('/articles');
  revalidatePath('/review');
  redirect('/review?changes=1');
}

export async function advanceReviewAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const articleId = String(formData.get('articleId') ?? '');
  const to = String(formData.get('to') ?? '') as 'VERIFICATION' | 'READY';
  await transitionArticle(actor, articleId, to);
  revalidatePath('/articles');
  revalidatePath('/review');
  redirect('/review?advanced=1');
}

export async function scheduleArticleAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const articleId = String(formData.get('articleId') ?? '');
  const scheduledAtRaw = String(formData.get('scheduledAt') ?? '');
  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) throw new Error('Invalid schedule time');
  await transitionArticle(actor, articleId, 'SCHEDULED', { scheduledAt });
  revalidatePath('/articles');
  revalidatePath('/review');
  redirect('/review?scheduled=1');
}

export async function publishArticleAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const articleId = String(formData.get('articleId') ?? '');
    const article = await publishArticle(actor, articleId);
    revalidatePath('/articles');
    revalidatePath('/review');
    revalidatePath('/');
    revalidatePath('/latest');
    redirect(`/articles?published=${encodeURIComponent(article.slug)}`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/articles?error=${encodeURIComponent(flashErrorMessage(error))}`);
  }
}

export async function publishDueAction() {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  await publishDueScheduled(actor);
  revalidatePath('/articles');
  revalidatePath('/review');
  redirect('/review?due=1');
}

export async function createBreakingAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const headline = String(formData.get('headline') ?? '').trim();
  const shortUpdate = String(formData.get('shortUpdate') ?? '').trim();
  const sourceContext = String(formData.get('sourceContext') ?? '').trim();
  const campusId = String(formData.get('campusId') ?? '') || undefined;
  const universityId = String(formData.get('universityId') ?? '') || undefined;
  const whenRaw = String(formData.get('occurredAt') ?? '');
  const occurredAt = whenRaw ? new Date(whenRaw) : undefined;

  if (!headline || !shortUpdate) throw new Error('Headline and update are required');

  const item = await createBreakingDraft(actor, {
    headline,
    shortUpdate,
    sourceContext: sourceContext || undefined,
    campusId,
    universityId,
    occurredAt,
  });

  revalidatePath('/breaking');
  redirect(`/breaking?created=${item.slug}`);
}

export async function publishBreakingAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const breakingId = String(formData.get('breakingId') ?? '');
  const item = await publishBreaking(actor, breakingId);
  revalidatePath('/breaking');
  revalidatePath('/');
  revalidatePath('/latest');
  redirect(`/breaking?published=${item.slug}`);
}

export async function appendTimelineAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const breakingId = String(formData.get('breakingId') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  if (!body) throw new Error('Update body required');
  await appendBreakingTimeline(actor, breakingId, body);
  revalidatePath('/breaking');
  redirect('/breaking?updated=1');
}

export async function addSourceAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const label = String(formData.get('label') ?? '').trim();
  const privateNotes = String(formData.get('privateNotes') ?? '').trim();
  const privateIdentity = String(formData.get('privateIdentity') ?? '').trim();
  const articleId = String(formData.get('articleId') ?? '') || undefined;
  const breakingId = String(formData.get('breakingId') ?? '') || undefined;
  if (!label) throw new Error('Source label required');
  await addSource(actor, {
    label,
    privateNotes: privateNotes || undefined,
    privateIdentity: privateIdentity || undefined,
    articleId,
    breakingId,
  });
  revalidatePath('/review');
  revalidatePath('/articles');
  redirect('/review?source=1');
}

export async function createOpportunityAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const opportunityType = String(formData.get('opportunityType') ?? 'OTHER') as OpportunityType;
    const organisationName = String(formData.get('organisationName') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const deadlineRaw = String(formData.get('deadline') ?? '').trim();
    const applicationUrl = String(formData.get('applicationUrl') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;

    if (!title || !description) throw new Error('Title and description required');

    const item = await createOpportunityDraft(actor, {
      title,
      description,
      opportunityType,
      organisationName: organisationName || undefined,
      location: location || undefined,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      applicationUrl: applicationUrl || undefined,
      campusId,
      universityId,
    });

    revalidatePath('/opportunities');
    redirect(`/opportunities?created=${item.slug}`);
  } catch (error) {
    actionError(error);
  }
}

export async function publishOpportunityAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const opportunityId = String(formData.get('opportunityId') ?? '');
  const item = await publishOpportunity(actor, opportunityId);
  revalidatePath('/opportunities');
  revalidatePath('/');
  redirect(`/opportunities?published=${item.slug}`);
}

export async function createEventAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const startAtRaw = String(formData.get('startAt') ?? '').trim();
    const endAtRaw = String(formData.get('endAt') ?? '').trim();
    const eventType = String(formData.get('eventType') ?? 'OTHER') as EventType;
    const venue = String(formData.get('venue') ?? '').trim();
    const ticketUrl = String(formData.get('ticketUrl') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;
    const organisationName = String(formData.get('organisationName') ?? '').trim();

    if (!name || !description || !startAtRaw) throw new Error('Name, description and start required');

    const item = await createEventDraft(actor, {
      name,
      description,
      startAt: new Date(startAtRaw),
      endAt: endAtRaw ? new Date(endAtRaw) : null,
      eventType,
      venue: venue || undefined,
      ticketUrl: ticketUrl || undefined,
      campusId,
      universityId,
      organisationName: organisationName || undefined,
    });

    revalidatePath('/events');
    redirect(`/events?created=${item.slug}`);
  } catch (error) {
    actionError(error);
  }
}

export async function publishEventAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const eventId = String(formData.get('eventId') ?? '');
  const item = await publishEvent(actor, eventId);
  revalidatePath('/events');
  revalidatePath('/');
  redirect(`/events?published=${item.slug}`);
}

export async function createVendorAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const businessName = String(formData.get('businessName') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const categoryName = String(formData.get('categoryName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const whatsapp = String(formData.get('whatsapp') ?? '').trim();
    const address = String(formData.get('address') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;

    if (!businessName || !description) throw new Error('Name and description required');

    const item = await createVendorDraft(actor, {
      businessName,
      description,
      categoryName: categoryName || undefined,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      address: address || undefined,
      campusId,
    });

    revalidatePath('/guide');
    redirect(`/guide?created=${item.slug}`);
  } catch (error) {
    actionError(error);
  }
}

export async function approveVendorAction(formData: FormData) {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  const vendorId = String(formData.get('vendorId') ?? '');
  const item = await approveVendor(actor, vendorId);
  revalidatePath('/guide');
  revalidatePath('/');
  redirect(`/guide?approved=${item.slug}`);
}

export async function runJobsTickAction() {
  const { user } = await requireNewsroomUser();
  const actor = await loadActor(user.id);
  if (
    !roleHasCapability(actor.role, 'platform.jobs.retry') &&
    !roleHasCapability(actor.role, 'editorial.publish')
  ) {
    throw new AuthorizationError('Missing capability: platform.jobs.retry');
  }
  await runUtilityJobsTick(actor);
  revalidatePath('/jobs');
  redirect('/jobs?ran=1');
}

export async function createProgrammeAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const programmeType = String(formData.get('programmeType') ?? 'TALK') as ProgrammeType;
    const status = String(formData.get('status') ?? 'DRAFT') as ProgrammeStatus;
    const coverPublicUrl = String(formData.get('coverPublicUrl') ?? '').trim();

    if (!name) throw new Error('Programme name is required');

    const programme = await createProgramme(actor, {
      name,
      description: description || undefined,
      programmeType,
      status,
      coverPublicUrl: coverPublicUrl || undefined,
    });

    revalidatePath('/programmes');
    revalidatePath('/');
    redirect(`/programmes/${programme.slug}`);
  } catch (error) {
    actionError(error);
  }
}

export async function updateProgrammeAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const programmeId = String(formData.get('programmeId') ?? '');
    const slug = String(formData.get('slug') ?? '');
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const programmeType = String(formData.get('programmeType') ?? 'TALK') as ProgrammeType;
    const status = String(formData.get('status') ?? 'DRAFT') as ProgrammeStatus;
    const coverPublicUrl = String(formData.get('coverPublicUrl') ?? '').trim();

    if (!programmeId || !name) throw new Error('Programme and name are required');

    await updateProgramme(actor, programmeId, {
      name,
      description: description || undefined,
      programmeType,
      status,
      coverPublicUrl: coverPublicUrl || undefined,
    });

    revalidatePath('/programmes');
    revalidatePath(`/programmes/${slug}`);
    revalidatePath('/');
    redirect(`/programmes/${slug}?saved=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function createEpisodeAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const programmeId = String(formData.get('programmeId') ?? '');
    const programmeSlug = String(formData.get('programmeSlug') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const videoUrl = String(formData.get('videoUrl') ?? '').trim();
    const thumbnailPublicUrl = String(formData.get('thumbnailPublicUrl') ?? '').trim();
    const episodeNumberRaw = String(formData.get('episodeNumber') ?? '').trim();
    const publish = String(formData.get('publish') ?? '') === 'on';

    if (!programmeId || !title || !videoUrl) {
      throw new Error('Programme, title and YouTube URL are required');
    }

    await createEpisode(actor, {
      programmeId,
      title,
      description: description || undefined,
      videoUrl,
      thumbnailPublicUrl: thumbnailPublicUrl || undefined,
      episodeNumber: episodeNumberRaw ? Number(episodeNumberRaw) : undefined,
      publish,
    });

    revalidatePath('/programmes');
    revalidatePath(`/programmes/${programmeSlug}`);
    revalidatePath('/');
    redirect(`/programmes/${programmeSlug}?episode=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function updateEpisodeAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const episodeId = String(formData.get('episodeId') ?? '');
    const programmeSlug = String(formData.get('programmeSlug') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const videoUrl = String(formData.get('videoUrl') ?? '').trim();
    const thumbnailPublicUrl = String(formData.get('thumbnailPublicUrl') ?? '').trim();
    const episodeNumberRaw = String(formData.get('episodeNumber') ?? '').trim();
    const publish = String(formData.get('publish') ?? '') === 'on';

    if (!episodeId || !title || !videoUrl) {
      throw new Error('Episode, title and YouTube URL are required');
    }

    await updateEpisode(actor, episodeId, {
      title,
      description: description || undefined,
      videoUrl,
      thumbnailPublicUrl: thumbnailPublicUrl || undefined,
      episodeNumber: episodeNumberRaw ? Number(episodeNumberRaw) : undefined,
      publish,
    });

    revalidatePath('/programmes');
    revalidatePath(`/programmes/${programmeSlug}`);
    redirect(`/programmes/${programmeSlug}?saved=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function archiveEpisodeAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const episodeId = String(formData.get('episodeId') ?? '');
    const programmeSlug = String(formData.get('programmeSlug') ?? '');
    if (!episodeId) throw new Error('Episode id required');
    await archiveEpisode(actor, episodeId);
    revalidatePath('/programmes');
    revalidatePath(`/programmes/${programmeSlug}`);
    redirect(`/programmes/${programmeSlug}?archived=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function deleteProgrammeAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const programmeId = String(formData.get('programmeId') ?? '');
    if (!programmeId) throw new Error('Programme id required');
    await deleteOrArchiveProgramme(actor, programmeId);
    revalidatePath('/programmes');
    redirect('/programmes?removed=1');
  } catch (error) {
    actionError(error);
  }
}

export async function updateBreakingAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const breakingId = String(formData.get('breakingId') ?? '');
    const headline = String(formData.get('headline') ?? '').trim();
    const shortUpdate = String(formData.get('shortUpdate') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;
    const sourceContext = String(formData.get('sourceContext') ?? '').trim();
    const bannerEnabled = String(formData.get('bannerEnabled') ?? '') === 'on';
    if (!breakingId || !headline || !shortUpdate) throw new Error('Required fields missing');
    await updateBreaking(actor, breakingId, {
      headline,
      shortUpdate,
      campusId,
      universityId,
      sourceContext: sourceContext || undefined,
      bannerEnabled,
    });
    revalidatePath('/breaking');
    revalidatePath(`/breaking/${breakingId}`);
    redirect(`/breaking/${breakingId}?saved=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function deleteBreakingAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const breakingId = String(formData.get('breakingId') ?? '');
    if (!breakingId) throw new Error('Breaking id required');
    await deleteOrArchiveBreaking(actor, breakingId);
    revalidatePath('/breaking');
    redirect('/breaking?removed=1');
  } catch (error) {
    actionError(error);
  }
}

export async function updateOpportunityAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const opportunityId = String(formData.get('opportunityId') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '');
    const opportunityType = String(formData.get('opportunityType') ?? 'OTHER') as OpportunityType;
    const organisationName = String(formData.get('organisationName') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const applicationUrl = String(formData.get('applicationUrl') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;
    const deadlineRaw = String(formData.get('deadline') ?? '');
    if (!opportunityId || !title) throw new Error('Required fields missing');
    await updateOpportunity(actor, opportunityId, {
      title,
      description,
      opportunityType,
      organisationName: organisationName || undefined,
      location: location || undefined,
      applicationUrl: applicationUrl || undefined,
      campusId,
      universityId,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
    });
    revalidatePath('/opportunities');
    revalidatePath(`/opportunities/${opportunityId}`);
    redirect(`/opportunities/${opportunityId}?saved=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function deleteOpportunityAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const opportunityId = String(formData.get('opportunityId') ?? '');
    if (!opportunityId) throw new Error('Opportunity id required');
    await deleteOrArchiveOpportunity(actor, opportunityId);
    revalidatePath('/opportunities');
    redirect('/opportunities?removed=1');
  } catch (error) {
    actionError(error);
  }
}

export async function updateEventAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const eventId = String(formData.get('eventId') ?? '');
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '');
    const startAtRaw = String(formData.get('startAt') ?? '');
    const endAtRaw = String(formData.get('endAt') ?? '');
    const eventType = String(formData.get('eventType') ?? 'OTHER') as EventType;
    const venue = String(formData.get('venue') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const universityId = String(formData.get('universityId') ?? '') || undefined;
    const organisationName = String(formData.get('organisationName') ?? '').trim();
    const posterPublicUrl = String(formData.get('posterPublicUrl') ?? '').trim();
    if (!eventId || !name || !startAtRaw) throw new Error('Required fields missing');
    await updateEvent(actor, eventId, {
      name,
      description,
      startAt: new Date(startAtRaw),
      endAt: endAtRaw ? new Date(endAtRaw) : null,
      eventType,
      venue: venue || undefined,
      campusId,
      universityId,
      organisationName: organisationName || undefined,
      posterPublicUrl: posterPublicUrl || undefined,
    });
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);
    redirect(`/events/${eventId}?saved=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function deleteEventAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const eventId = String(formData.get('eventId') ?? '');
    if (!eventId) throw new Error('Event id required');
    await deleteOrArchiveEvent(actor, eventId);
    revalidatePath('/events');
    redirect('/events?removed=1');
  } catch (error) {
    actionError(error);
  }
}

export async function updateVendorAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const vendorId = String(formData.get('vendorId') ?? '');
    const businessName = String(formData.get('businessName') ?? '').trim();
    const description = String(formData.get('description') ?? '');
    const categoryName = String(formData.get('categoryName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const whatsapp = String(formData.get('whatsapp') ?? '').trim();
    const address = String(formData.get('address') ?? '').trim();
    const campusId = String(formData.get('campusId') ?? '') || undefined;
    const logoPublicUrl = String(formData.get('logoPublicUrl') ?? '').trim();
    if (!vendorId || !businessName) throw new Error('Required fields missing');
    await updateVendor(actor, vendorId, {
      businessName,
      description,
      categoryName: categoryName || undefined,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      address: address || undefined,
      campusId,
      logoPublicUrl: logoPublicUrl || undefined,
    });
    revalidatePath('/guide');
    revalidatePath(`/guide/${vendorId}`);
    redirect(`/guide/${vendorId}?saved=1`);
  } catch (error) {
    actionError(error);
  }
}

export async function deleteVendorAction(formData: FormData) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const vendorId = String(formData.get('vendorId') ?? '');
    if (!vendorId) throw new Error('Vendor id required');
    await deleteOrArchiveVendor(actor, vendorId);
    revalidatePath('/guide');
    redirect('/guide?removed=1');
  } catch (error) {
    actionError(error);
  }
}

