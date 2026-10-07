import {
  AuthorizationError,
  roleHasCapability,
  type Capability,
} from '@campus360/domain';
import {
  prisma,
  SponsorStatus,
  CampaignStatus,
  DeliverableStatus,
  DeliverableType,
  LeadStatus,
  PlacementStatus,
  type Prisma,
} from '@campus360/db';
import { slugify } from './slug';
import type { Actor } from './editorial';

function assertCapability(actor: Actor, capability: Capability) {
  if (!roleHasCapability(actor.role, capability)) {
    throw new AuthorizationError(`Missing capability: ${capability}`);
  }
}

async function audit(
  actor: Actor,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Prisma.InputJsonValue,
) {
  await prisma.auditEvent.create({
    data: {
      actorId: actor.id,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}

async function uniqueCampaignSlug(base: string) {
  let candidate = base || 'campaign';
  let i = 2;
  while (await prisma.campaign.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

// ─── Sponsors ──────────────────────────────────────────────

export async function listSponsors(actor: Actor) {
  assertCapability(actor, 'campaign.manage');
  return prisma.sponsor.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      organisation: true,
      owner: { select: { id: true, fullName: true, email: true } },
      campaigns: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function createSponsor(
  actor: Actor,
  input: {
    organisationName: string;
    organisationWebsite?: string;
    commercialContact?: string;
    notes?: string;
    status?: SponsorStatus;
  },
) {
  assertCapability(actor, 'campaign.manage');
  const orgSlug = slugify(input.organisationName);
  const organisation = await prisma.organisation.upsert({
    where: { slug: orgSlug },
    update: { name: input.organisationName.trim() },
    create: {
      name: input.organisationName.trim(),
      slug: orgSlug,
      type: 'sponsor',
      website: input.organisationWebsite?.trim() || null,
    },
  });

  const sponsor = await prisma.sponsor.create({
    data: {
      organisationId: organisation.id,
      status: input.status ?? SponsorStatus.PROSPECT,
      commercialContact: input.commercialContact?.trim() || null,
      notes: input.notes?.trim() || null,
      ownerId: actor.id,
      lastContactAt: new Date(),
    },
  });

  await audit(actor, 'sponsor.create', 'Sponsor', sponsor.id, {
    organisationId: organisation.id,
  });

  return sponsor;
}

export async function updateSponsorStatus(actor: Actor, sponsorId: string, status: SponsorStatus) {
  assertCapability(actor, 'campaign.manage');
  const sponsor = await prisma.sponsor.update({
    where: { id: sponsorId },
    data: { status, lastContactAt: new Date() },
  });
  await audit(actor, 'sponsor.status_change', 'Sponsor', sponsor.id, { status });
  return sponsor;
}

// ─── Campaigns ─────────────────────────────────────────────

export async function listCampaigns(actor: Actor) {
  assertCapability(actor, 'campaign.manage');
  return prisma.campaign.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      sponsor: { include: { organisation: true } },
      owner: { select: { id: true, fullName: true, email: true } },
      deliverables: { select: { id: true, status: true, dueAt: true } },
      campuses: { include: { campus: { select: { name: true, slug: true } } } },
    },
  });
}

export async function getCampaign(actor: Actor, campaignId: string) {
  assertCapability(actor, 'campaign.manage');
  return prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: {
      sponsor: { include: { organisation: true } },
      owner: { select: { id: true, fullName: true, email: true } },
      campuses: { include: { campus: true } },
      universities: { include: { university: true } },
      deliverables: { orderBy: { dueAt: 'asc' } },
      placements: { orderBy: { startAt: 'asc' } },
    },
  });
}

export async function createCampaign(
  actor: Actor,
  input: {
    name: string;
    sponsorId: string;
    objectives?: string;
    contractValue?: string;
    targetAudience?: string;
    startAt?: Date | null;
    endAt?: Date | null;
    notes?: string;
    campusId?: string;
    status?: CampaignStatus;
  },
) {
  assertCapability(actor, 'campaign.manage');
  const slug = await uniqueCampaignSlug(slugify(input.name));

  const campaign = await prisma.campaign.create({
    data: {
      name: input.name.trim(),
      slug,
      sponsorId: input.sponsorId,
      ownerId: actor.id,
      objectives: input.objectives?.trim() || null,
      contractValue: input.contractValue?.trim() || null,
      targetAudience: input.targetAudience?.trim() || null,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      notes: input.notes?.trim() || null,
      status: input.status ?? CampaignStatus.PROPOSAL,
      campuses: input.campusId ? { create: [{ campusId: input.campusId }] } : undefined,
    },
  });

  await audit(actor, 'campaign.create', 'Campaign', campaign.id, {
    sponsorId: input.sponsorId,
    hasContractValue: Boolean(input.contractValue),
  });

  return campaign;
}

export async function updateCampaignStatus(
  actor: Actor,
  campaignId: string,
  status: CampaignStatus,
) {
  assertCapability(actor, 'campaign.manage');
  const before = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
  });
  await audit(actor, 'campaign.status_change', 'Campaign', campaign.id, {
    from: before.status,
    to: status,
  });
  return campaign;
}

export async function updateCampaignContract(
  actor: Actor,
  campaignId: string,
  input: { contractValue?: string; startAt?: Date | null; endAt?: Date | null },
) {
  assertCapability(actor, 'campaign.manage');
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      contractValue: input.contractValue?.trim() || null,
      startAt: input.startAt === undefined ? undefined : input.startAt,
      endAt: input.endAt === undefined ? undefined : input.endAt,
    },
  });
  await audit(actor, 'campaign.value_or_dates_change', 'Campaign', campaign.id, {
    hasContractValue: Boolean(campaign.contractValue),
    startAt: campaign.startAt?.toISOString() ?? null,
    endAt: campaign.endAt?.toISOString() ?? null,
  });
  return campaign;
}

export async function addDeliverable(
  actor: Actor,
  input: {
    campaignId: string;
    title: string;
    deliverableType?: DeliverableType;
    dueAt?: Date | null;
    notes?: string;
  },
) {
  assertCapability(actor, 'campaign.manage');
  const item = await prisma.campaignDeliverable.create({
    data: {
      campaignId: input.campaignId,
      title: input.title.trim(),
      deliverableType: input.deliverableType ?? DeliverableType.OTHER,
      dueAt: input.dueAt ?? null,
      notes: input.notes?.trim() || null,
      ownerId: actor.id,
      status: DeliverableStatus.PLANNED,
    },
  });
  await audit(actor, 'deliverable.create', 'CampaignDeliverable', item.id, {
    campaignId: input.campaignId,
  });
  return item;
}

export async function updateDeliverableStatus(
  actor: Actor,
  deliverableId: string,
  status: DeliverableStatus,
) {
  assertCapability(actor, 'campaign.manage');
  const item = await prisma.campaignDeliverable.update({
    where: { id: deliverableId },
    data: { status },
  });
  await audit(actor, 'deliverable.status_change', 'CampaignDeliverable', item.id, { status });
  return item;
}

export async function addPlacement(
  actor: Actor,
  input: {
    campaignId: string;
    label: string;
    type?: DeliverableType;
    startAt?: Date | null;
    endAt?: Date | null;
  },
) {
  assertCapability(actor, 'campaign.manage');
  return prisma.placement.create({
    data: {
      campaignId: input.campaignId,
      label: input.label.trim(),
      type: input.type ?? DeliverableType.OTHER,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      status: PlacementStatus.RESERVED,
    },
  });
}

// ─── Leads ─────────────────────────────────────────────────

export async function listLeads(actor: Actor) {
  assertCapability(actor, 'campaign.manage');
  return prisma.commercialLead.findMany({
    orderBy: [{ status: 'asc' }, { nextFollowUpAt: 'asc' }, { createdAt: 'desc' }],
    include: {
      organisation: true,
      owner: { select: { id: true, fullName: true, email: true } },
      campuses: { include: { campus: { select: { name: true, slug: true } } } },
    },
  });
}

export async function createLead(
  actor: Actor | null,
  input: {
    organisationName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    interest: string;
    budgetRange?: string;
    message?: string;
    source?: string;
    campusId?: string;
    notes?: string;
  },
) {
  if (actor) assertCapability(actor, 'campaign.manage');

  const lead = await prisma.commercialLead.create({
    data: {
      organisationName: input.organisationName.trim(),
      contactName: input.contactName?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      contactPhone: input.contactPhone?.trim() || null,
      interest: input.interest.trim(),
      budgetRange: input.budgetRange?.trim() || null,
      message: input.message?.trim() || null,
      source: input.source ?? (actor ? 'control' : 'public'),
      notes: actor ? input.notes?.trim() || null : null,
      ownerId: actor?.id ?? null,
      status: LeadStatus.NEW,
      campuses: input.campusId ? { create: [{ campusId: input.campusId }] } : undefined,
    },
  });

  if (actor) {
    await audit(actor, 'lead.create', 'CommercialLead', lead.id, {
      source: lead.source,
    });
  }

  return lead;
}

/** Public enquiry — no private notes accepted. */
export async function submitPublicCommercialEnquiry(input: {
  organisationName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  interest: string;
  budgetRange?: string;
  message?: string;
  campusId?: string;
}) {
  if (!input.organisationName.trim() || !input.interest.trim()) {
    throw new Error('Organisation and interest are required');
  }
  return createLead(null, { ...input, source: 'public' });
}

export async function updateLeadStatus(actor: Actor, leadId: string, status: LeadStatus) {
  assertCapability(actor, 'campaign.manage');
  const lead = await prisma.commercialLead.update({
    where: { id: leadId },
    data: { status, ownerId: actor.id },
  });
  await audit(actor, 'lead.status_change', 'CommercialLead', lead.id, { status });
  return lead;
}

export async function listVendorOps(actor: Actor) {
  if (
    !roleHasCapability(actor.role, 'vendor.approve') &&
    !roleHasCapability(actor.role, 'campaign.manage') &&
    !roleHasCapability(actor.role, 'control.overview')
  ) {
    throw new AuthorizationError('Missing capability for vendor ops');
  }
  return prisma.vendor.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      category: true,
      campuses: { include: { campus: { select: { name: true, slug: true } } } },
    },
  });
}

export async function suspendVendor(actor: Actor, vendorId: string) {
  assertCapability(actor, 'vendor.approve');
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { listingStatus: 'SUSPENDED' },
  });
  await audit(actor, 'vendor.suspend', 'Vendor', vendor.id, {});
  return vendor;
}
