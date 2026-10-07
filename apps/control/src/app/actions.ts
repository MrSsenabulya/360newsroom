'use server';

import {
  addDeliverable,
  createCampaign,
  createLead,
  createSponsor,
  suspendVendor,
  updateCampaignStatus,
  updateDeliverableStatus,
  updateLeadStatus,
  updateSponsorStatus,
} from '@campus360/content/commercial';
import { runUtilityJobsTick } from '@campus360/content/jobs';
import { setUserActive, setUserCampusScopes, updateUserRole } from '@campus360/content/control';
import { loadActor } from '@campus360/content/actor';
import {
  AuthorizationError,
  roleHasCapability,
} from '@campus360/domain';
import {
  CampaignStatus,
  DeliverableStatus,
  DeliverableType,
  LeadStatus,
  SponsorStatus,
  type Role,
} from '@campus360/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireControlUser } from '../lib/session';

function actionError(error: unknown): never {
  if (error instanceof AuthorizationError) throw error;
  throw error;
}

export async function createSponsorAction(formData: FormData) {
  try {
    const { user } = await requireControlUser();
    const actor = await loadActor(user.id);
    await createSponsor(actor, {
      organisationName: String(formData.get('organisationName') ?? '').trim(),
      organisationWebsite: String(formData.get('organisationWebsite') ?? '').trim() || undefined,
      commercialContact: String(formData.get('commercialContact') ?? '').trim() || undefined,
      notes: String(formData.get('notes') ?? '').trim() || undefined,
    });
    revalidatePath('/sponsors');
    redirect('/sponsors?created=1');
  } catch (error) {
    actionError(error);
  }
}

export async function updateSponsorStatusAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  await updateSponsorStatus(
    actor,
    String(formData.get('sponsorId') ?? ''),
    String(formData.get('status') ?? 'ACTIVE') as SponsorStatus,
  );
  revalidatePath('/sponsors');
  redirect('/sponsors?updated=1');
}

export async function createCampaignAction(formData: FormData) {
  try {
    const { user } = await requireControlUser();
    const actor = await loadActor(user.id);
    const campaign = await createCampaign(actor, {
      name: String(formData.get('name') ?? '').trim(),
      sponsorId: String(formData.get('sponsorId') ?? ''),
      objectives: String(formData.get('objectives') ?? '').trim() || undefined,
      contractValue: String(formData.get('contractValue') ?? '').trim() || undefined,
      targetAudience: String(formData.get('targetAudience') ?? '').trim() || undefined,
      campusId: String(formData.get('campusId') ?? '') || undefined,
      startAt: String(formData.get('startAt') ?? '')
        ? new Date(String(formData.get('startAt')))
        : null,
      endAt: String(formData.get('endAt') ?? '') ? new Date(String(formData.get('endAt'))) : null,
    });
    revalidatePath('/campaigns');
    redirect(`/campaigns/${campaign.id}`);
  } catch (error) {
    actionError(error);
  }
}

export async function updateCampaignStatusAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  const campaignId = String(formData.get('campaignId') ?? '');
  await updateCampaignStatus(
    actor,
    campaignId,
    String(formData.get('status') ?? 'LIVE') as CampaignStatus,
  );
  revalidatePath('/campaigns');
  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}?updated=1`);
}

export async function addDeliverableAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  const campaignId = String(formData.get('campaignId') ?? '');
  await addDeliverable(actor, {
    campaignId,
    title: String(formData.get('title') ?? '').trim(),
    deliverableType: String(formData.get('deliverableType') ?? 'OTHER') as DeliverableType,
    dueAt: String(formData.get('dueAt') ?? '') ? new Date(String(formData.get('dueAt'))) : null,
    notes: String(formData.get('notes') ?? '').trim() || undefined,
  });
  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}?deliverable=1`);
}

export async function updateDeliverableStatusAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  const campaignId = String(formData.get('campaignId') ?? '');
  await updateDeliverableStatus(
    actor,
    String(formData.get('deliverableId') ?? ''),
    String(formData.get('status') ?? 'IN_PROGRESS') as DeliverableStatus,
  );
  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}?deliverable=1`);
}

export async function createLeadAction(formData: FormData) {
  try {
    const { user } = await requireControlUser();
    const actor = await loadActor(user.id);
    await createLead(actor, {
      organisationName: String(formData.get('organisationName') ?? '').trim(),
      contactName: String(formData.get('contactName') ?? '').trim() || undefined,
      contactEmail: String(formData.get('contactEmail') ?? '').trim() || undefined,
      interest: String(formData.get('interest') ?? '').trim(),
      budgetRange: String(formData.get('budgetRange') ?? '').trim() || undefined,
      message: String(formData.get('message') ?? '').trim() || undefined,
      campusId: String(formData.get('campusId') ?? '') || undefined,
      notes: String(formData.get('notes') ?? '').trim() || undefined,
      source: 'control',
    });
    revalidatePath('/leads');
    redirect('/leads?created=1');
  } catch (error) {
    actionError(error);
  }
}

export async function updateLeadStatusAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  await updateLeadStatus(
    actor,
    String(formData.get('leadId') ?? ''),
    String(formData.get('status') ?? 'CONTACTED') as LeadStatus,
  );
  revalidatePath('/leads');
  redirect('/leads?updated=1');
}

export async function suspendVendorAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  await suspendVendor(actor, String(formData.get('vendorId') ?? ''));
  revalidatePath('/vendors');
  redirect('/vendors?suspended=1');
}

export async function updateUserRoleAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  await updateUserRole(
    actor,
    String(formData.get('userId') ?? ''),
    String(formData.get('role') ?? 'JOURNALIST') as Role,
  );
  revalidatePath('/people');
  redirect('/people?role=1');
}

export async function setUserActiveAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  await setUserActive(
    actor,
    String(formData.get('userId') ?? ''),
    String(formData.get('isActive') ?? 'true') === 'true',
  );
  revalidatePath('/people');
  redirect('/people?active=1');
}

export async function setCampusScopeAction(formData: FormData) {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  const userId = String(formData.get('userId') ?? '');
  const campusId = String(formData.get('campusId') ?? '');
  const campusIds = campusId ? [campusId] : [];
  await setUserCampusScopes(actor, userId, campusIds);
  revalidatePath('/people');
  redirect('/people?scope=1');
}

export async function runJobsTickAction() {
  const { user } = await requireControlUser();
  const actor = await loadActor(user.id);
  if (
    !roleHasCapability(actor.role, 'platform.jobs.retry') &&
    !roleHasCapability(actor.role, 'editorial.publish')
  ) {
    throw new AuthorizationError('Missing capability: platform.jobs.retry');
  }
  await runUtilityJobsTick(
    roleHasCapability(actor.role, 'editorial.publish') ? actor : null,
  );
  revalidatePath('/jobs');
  revalidatePath('/health');
  redirect('/jobs?ran=1');
}
