import {
  AuthorizationError,
  roleHasCapability,
  roleIsCampusScoped,
} from '@campus360/domain';
import {
  prisma,
  PublicationStatus,
  VerificationStatus,
  OpportunityListingStatus,
  OpportunityType,
  WorkMode,
  EventLifecycleStatus,
  EventType,
  VendorListingStatus,
  CollectionStatus,
  MediaType,
  MediaRights,
  type Prisma,
} from '@campus360/db';
import { slugify } from './slug';
import { isEmptyHtml, sanitizeEditorialHtml } from './sanitize';
import {
  assertCampusAccess,
  assertCapability,
  type Actor,
} from './actor';

async function uniqueSlug(
  model: 'opportunity' | 'event' | 'vendor' | 'collection',
  base: string,
) {
  let candidate = base || model;
  let i = 2;
  while (true) {
    const existing =
      model === 'opportunity'
        ? await prisma.opportunity.findUnique({ where: { slug: candidate } })
        : model === 'event'
          ? await prisma.event.findUnique({ where: { slug: candidate } })
          : model === 'vendor'
            ? await prisma.vendor.findUnique({ where: { slug: candidate } })
            : await prisma.collection.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${base}-${i}`;
    i += 1;
  }
}

// ─── Opportunities ─────────────────────────────────────────

export async function createOpportunityDraft(
  actor: Actor,
  input: {
    title: string;
    description: string;
    opportunityType?: OpportunityType;
    eligibility?: string;
    location?: string;
    workMode?: WorkMode;
    compensation?: string;
    applicationUrl?: string;
    contactPublic?: string;
    sourceLabel?: string;
    deadline?: Date | null;
    organisationName?: string;
    campusId?: string;
    universityId?: string;
  },
) {
  assertCapability(actor, 'editorial.create');
  assertCampusAccess(actor, input.campusId);

  let organisationId: string | undefined;
  if (input.organisationName?.trim()) {
    const orgSlug = slugify(input.organisationName);
    const org = await prisma.organisation.upsert({
      where: { slug: orgSlug },
      update: { name: input.organisationName.trim() },
      create: {
        name: input.organisationName.trim(),
        slug: orgSlug,
        type: 'employer',
      },
    });
    organisationId = org.id;
  }

  const slug = await uniqueSlug('opportunity', slugify(input.title));
  const deadline = input.deadline ?? null;
  const description = sanitizeEditorialHtml(input.description);
  if (isEmptyHtml(description)) throw new AuthorizationError('Description is required');

  return prisma.opportunity.create({
    data: {
      title: input.title.trim(),
      slug,
      description,
      opportunityType: input.opportunityType ?? OpportunityType.OTHER,
      eligibility: input.eligibility?.trim() || null,
      location: input.location?.trim() || null,
      workMode: input.workMode ?? WorkMode.UNKNOWN,
      compensation: input.compensation?.trim() || null,
      applicationUrl: input.applicationUrl?.trim() || null,
      contactPublic: input.contactPublic?.trim() || null,
      sourceLabel: input.sourceLabel?.trim() || null,
      deadline,
      expiresAt: deadline,
      organisationId,
      universityId: input.universityId || null,
      createdById: actor.id,
      listingStatus: OpportunityListingStatus.DRAFT,
      publicationStatus: PublicationStatus.UNPUBLISHED,
      campuses: input.campusId ? { create: [{ campusId: input.campusId }] } : undefined,
    },
  });
}

export async function publishOpportunity(actor: Actor, opportunityId: string) {
  assertCapability(actor, 'editorial.publish');
  const withCampuses = await prisma.opportunity.findUniqueOrThrow({
    where: { id: opportunityId },
    include: { campuses: true },
  });
  for (const link of withCampuses.campuses) {
    assertCampusAccess(actor, link.campusId);
  }

  const now = new Date();
  const expired = withCampuses.deadline ? withCampuses.deadline.getTime() < now.getTime() : false;

  return prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      publicationStatus: PublicationStatus.PUBLISHED,
      listingStatus: expired
        ? OpportunityListingStatus.EXPIRED
        : OpportunityListingStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      publishedAt: withCampuses.publishedAt ?? now,
      expiresAt: withCampuses.expiresAt ?? withCampuses.deadline,
    },
  });
}

export async function listEditorialOpportunities(actor: Actor) {
  assertCapability(actor, 'editorial.create');
  const where: Prisma.OpportunityWhereInput =
    roleIsCampusScoped(actor.role) && actor.campusIds.length > 0
      ? { campuses: { some: { campusId: { in: actor.campusIds } } } }
      : {};
  return prisma.opportunity.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      organisation: true,
      campuses: { include: { campus: true } },
    },
  });
}

// ─── Events ────────────────────────────────────────────────

export async function createEventDraft(
  actor: Actor,
  input: {
    name: string;
    description: string;
    startAt: Date;
    endAt?: Date | null;
    eventType?: EventType;
    venue?: string;
    ticketUrl?: string;
    priceLabel?: string;
    contactPublic?: string;
    campusId?: string;
    universityId?: string;
    organisationName?: string;
  },
) {
  assertCapability(actor, 'editorial.create');
  assertCampusAccess(actor, input.campusId);

  let organisationId: string | undefined;
  if (input.organisationName?.trim()) {
    const orgSlug = slugify(input.organisationName);
    const org = await prisma.organisation.upsert({
      where: { slug: orgSlug },
      update: { name: input.organisationName.trim() },
      create: {
        name: input.organisationName.trim(),
        slug: orgSlug,
        type: 'organizer',
      },
    });
    organisationId = org.id;
  }

  const slug = await uniqueSlug('event', slugify(input.name));
  const lifecycleStatus = computeEventLifecycle(input.startAt, input.endAt ?? null);
  const description = sanitizeEditorialHtml(input.description);
  if (isEmptyHtml(description)) throw new AuthorizationError('Description is required');

  return prisma.event.create({
    data: {
      name: input.name.trim(),
      slug,
      description,
      eventType: input.eventType ?? EventType.OTHER,
      startAt: input.startAt,
      endAt: input.endAt ?? null,
      venue: input.venue?.trim() || null,
      ticketUrl: input.ticketUrl?.trim() || null,
      priceLabel: input.priceLabel?.trim() || null,
      contactPublic: input.contactPublic?.trim() || null,
      campusId: input.campusId || null,
      universityId: input.universityId || null,
      organisationId,
      createdById: actor.id,
      lifecycleStatus,
      publicationStatus: PublicationStatus.UNPUBLISHED,
    },
  });
}

export async function publishEvent(actor: Actor, eventId: string) {
  assertCapability(actor, 'editorial.publish');
  const item = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  assertCampusAccess(actor, item.campusId);

  return prisma.event.update({
    where: { id: eventId },
    data: {
      publicationStatus: PublicationStatus.PUBLISHED,
      publishedAt: item.publishedAt ?? new Date(),
      lifecycleStatus: computeEventLifecycle(item.startAt, item.endAt),
    },
  });
}

export async function listEditorialEvents(actor: Actor) {
  assertCapability(actor, 'editorial.create');
  const where: Prisma.EventWhereInput =
    roleIsCampusScoped(actor.role) && actor.campusIds.length > 0
      ? { campusId: { in: actor.campusIds } }
      : {};
  return prisma.event.findMany({
    where,
    orderBy: { startAt: 'desc' },
    include: { campus: true, organisation: true },
  });
}

export function computeEventLifecycle(
  startAt: Date,
  endAt: Date | null,
  now = new Date(),
): EventLifecycleStatus {
  const end = endAt ?? new Date(startAt.getTime() + 3 * 60 * 60 * 1000);
  if (now < startAt) return EventLifecycleStatus.UPCOMING;
  if (now <= end) return EventLifecycleStatus.HAPPENING_NOW;
  return EventLifecycleStatus.COMPLETED;
}

// ─── Campus Guide (vendors) ────────────────────────────────

export async function createVendorDraft(
  actor: Actor,
  input: {
    businessName: string;
    description: string;
    categorySlug?: string;
    categoryName?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
    openingHours?: string;
    priceRange?: string;
    campusId?: string;
  },
) {
  const canCreate =
    roleHasCapability(actor.role, 'vendor.approve') ||
    roleHasCapability(actor.role, 'editorial.create');
  if (!canCreate) throw new AuthorizationError('Missing capability: vendor.approve');
  assertCampusAccess(actor, input.campusId);

  let categoryId: string | undefined;
  if (input.categorySlug || input.categoryName) {
    const slug = input.categorySlug ?? slugify(input.categoryName ?? 'other');
    const category = await prisma.vendorCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name: input.categoryName ?? slug,
        slug,
      },
    });
    categoryId = category.id;
  }

  const slug = await uniqueSlug('vendor', slugify(input.businessName));
  const description = sanitizeEditorialHtml(input.description);
  if (isEmptyHtml(description)) throw new AuthorizationError('Description is required');

  return prisma.vendor.create({
    data: {
      businessName: input.businessName.trim(),
      slug,
      description,
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      instagram: input.instagram?.trim() || null,
      website: input.website?.trim() || null,
      openingHours: input.openingHours?.trim() || null,
      priceRange: input.priceRange?.trim() || null,
      categoryId,
      createdById: actor.id,
      listingStatus: VendorListingStatus.DRAFT,
      campuses: input.campusId ? { create: [{ campusId: input.campusId }] } : undefined,
    },
  });
}

export async function approveVendor(actor: Actor, vendorId: string) {
  const canApprove =
    roleHasCapability(actor.role, 'vendor.approve') ||
    roleHasCapability(actor.role, 'editorial.publish');
  if (!canApprove) throw new AuthorizationError('Missing capability: vendor.approve');
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: vendorId },
    include: { campuses: true },
  });
  for (const link of vendor.campuses) {
    assertCampusAccess(actor, link.campusId);
  }

  return prisma.vendor.update({
    where: { id: vendorId },
    data: {
      listingStatus: VendorListingStatus.ACTIVE,
      verified: true,
      listingStart: vendor.listingStart ?? new Date(),
    },
  });
}

export async function listEditorialVendors(actor: Actor) {
  const canList =
    roleHasCapability(actor.role, 'vendor.approve') ||
    roleHasCapability(actor.role, 'editorial.create');
  if (!canList) throw new AuthorizationError('Missing capability');

  return prisma.vendor.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { category: true, campuses: { include: { campus: true } } },
  });
}

// ─── Collections / topic hubs ──────────────────────────────

export async function ensureTopicCollection(topicSlug: string) {
  const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });
  if (!topic) return null;

  return prisma.collection.upsert({
    where: { slug: `topic-${topic.slug}` },
    update: {},
    create: {
      title: topic.name,
      slug: `topic-${topic.slug}`,
      description: topic.description ?? `Stories and coverage on ${topic.name}.`,
      status: CollectionStatus.ACTIVE,
      topicId: topic.id,
      publishedAt: new Date(),
    },
  });
}

export async function getEditorialOpportunity(actor: Actor, opportunityId: string) {
  assertCapability(actor, 'editorial.create');
  const item = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      organisation: true,
      campuses: { include: { campus: true } },
      university: true,
    },
  });
  if (!item) throw new AuthorizationError('Opportunity not found');
  for (const link of item.campuses) assertCampusAccess(actor, link.campusId);
  return item;
}

export async function updateOpportunity(
  actor: Actor,
  opportunityId: string,
  input: {
    title: string;
    description: string;
    opportunityType?: OpportunityType;
    eligibility?: string;
    location?: string;
    workMode?: WorkMode;
    compensation?: string;
    applicationUrl?: string;
    contactPublic?: string;
    sourceLabel?: string;
    deadline?: Date | null;
    organisationName?: string;
    campusId?: string;
    universityId?: string;
  },
) {
  assertCapability(actor, 'editorial.create');
  const existing = await prisma.opportunity.findUniqueOrThrow({
    where: { id: opportunityId },
    include: { campuses: true },
  });
  for (const link of existing.campuses) assertCampusAccess(actor, link.campusId);
  assertCampusAccess(actor, input.campusId);

  const description = sanitizeEditorialHtml(input.description);
  if (isEmptyHtml(description)) throw new AuthorizationError('Description is required');

  let organisationId = existing.organisationId;
  if (input.organisationName?.trim()) {
    const orgSlug = slugify(input.organisationName);
    const org = await prisma.organisation.upsert({
      where: { slug: orgSlug },
      update: { name: input.organisationName.trim() },
      create: {
        name: input.organisationName.trim(),
        slug: orgSlug,
        type: 'employer',
      },
    });
    organisationId = org.id;
  }

  return prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      title: input.title.trim(),
      description,
      opportunityType: input.opportunityType ?? existing.opportunityType,
      eligibility: input.eligibility?.trim() || null,
      location: input.location?.trim() || null,
      workMode: input.workMode ?? existing.workMode,
      compensation: input.compensation?.trim() || null,
      applicationUrl: input.applicationUrl?.trim() || null,
      contactPublic: input.contactPublic?.trim() || null,
      sourceLabel: input.sourceLabel?.trim() || null,
      deadline: input.deadline ?? null,
      expiresAt: input.deadline ?? existing.expiresAt,
      organisationId,
      universityId: input.universityId || null,
      campuses: input.campusId
        ? { deleteMany: {}, create: [{ campusId: input.campusId }] }
        : undefined,
    },
  });
}

export async function deleteOrArchiveOpportunity(actor: Actor, opportunityId: string) {
  assertCapability(actor, 'editorial.create');
  const item = await prisma.opportunity.findUniqueOrThrow({
    where: { id: opportunityId },
    include: { campuses: true },
  });
  for (const link of item.campuses) assertCampusAccess(actor, link.campusId);

  if (item.publicationStatus === PublicationStatus.PUBLISHED) {
    assertCapability(actor, 'editorial.publish');
    return prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        publicationStatus: PublicationStatus.ARCHIVED,
        listingStatus: OpportunityListingStatus.ARCHIVED,
      },
    });
  }

  await prisma.opportunity.delete({ where: { id: opportunityId } });
  return { id: opportunityId, deleted: true as const };
}

export async function getEditorialEvent(actor: Actor, eventId: string) {
  assertCapability(actor, 'editorial.create');
  const item = await prisma.event.findUnique({
    where: { id: eventId },
    include: { campus: true, organisation: true, poster: true, university: true },
  });
  if (!item) throw new AuthorizationError('Event not found');
  assertCampusAccess(actor, item.campusId);
  return item;
}

export async function updateEvent(
  actor: Actor,
  eventId: string,
  input: {
    name: string;
    description: string;
    startAt: Date;
    endAt?: Date | null;
    eventType?: EventType;
    venue?: string;
    ticketUrl?: string;
    priceLabel?: string;
    contactPublic?: string;
    campusId?: string;
    universityId?: string;
    organisationName?: string;
    posterPublicUrl?: string;
  },
) {
  assertCapability(actor, 'editorial.create');
  const existing = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  assertCampusAccess(actor, existing.campusId);
  assertCampusAccess(actor, input.campusId);

  const description = sanitizeEditorialHtml(input.description);
  if (isEmptyHtml(description)) throw new AuthorizationError('Description is required');

  let organisationId = existing.organisationId;
  if (input.organisationName?.trim()) {
    const orgSlug = slugify(input.organisationName);
    const org = await prisma.organisation.upsert({
      where: { slug: orgSlug },
      update: { name: input.organisationName.trim() },
      create: {
        name: input.organisationName.trim(),
        slug: orgSlug,
        type: 'organizer',
      },
    });
    organisationId = org.id;
  }

  let posterId = existing.posterId;
  if (input.posterPublicUrl?.trim()) {
    const media = await prisma.mediaAsset.create({
      data: {
        type: MediaType.IMAGE,
        publicUrl: input.posterPublicUrl.trim(),
        altText: input.name,
        rights: MediaRights.THIRD_PARTY,
        campusId: input.campusId ?? existing.campusId,
        uploadedById: actor.id,
      },
    });
    posterId = media.id;
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      name: input.name.trim(),
      description,
      eventType: input.eventType ?? existing.eventType,
      startAt: input.startAt,
      endAt: input.endAt ?? null,
      venue: input.venue?.trim() || null,
      ticketUrl: input.ticketUrl?.trim() || null,
      priceLabel: input.priceLabel?.trim() || null,
      contactPublic: input.contactPublic?.trim() || null,
      campusId: input.campusId || null,
      universityId: input.universityId || null,
      organisationId,
      posterId,
      lifecycleStatus: computeEventLifecycle(input.startAt, input.endAt ?? null),
    },
  });
}

export async function deleteOrArchiveEvent(actor: Actor, eventId: string) {
  assertCapability(actor, 'editorial.create');
  const item = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  assertCampusAccess(actor, item.campusId);

  if (item.publicationStatus === PublicationStatus.PUBLISHED) {
    assertCapability(actor, 'editorial.publish');
    return prisma.event.update({
      where: { id: eventId },
      data: {
        publicationStatus: PublicationStatus.ARCHIVED,
        lifecycleStatus: EventLifecycleStatus.CANCELLED,
      },
    });
  }

  await prisma.event.delete({ where: { id: eventId } });
  return { id: eventId, deleted: true as const };
}

export async function getEditorialVendor(actor: Actor, vendorId: string) {
  const canList =
    roleHasCapability(actor.role, 'vendor.approve') ||
    roleHasCapability(actor.role, 'editorial.create');
  if (!canList) throw new AuthorizationError('Missing capability');
  const item = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      category: true,
      campuses: { include: { campus: true } },
      logo: true,
    },
  });
  if (!item) throw new AuthorizationError('Vendor not found');
  return item;
}

export async function updateVendor(
  actor: Actor,
  vendorId: string,
  input: {
    businessName: string;
    description: string;
    categoryName?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
    openingHours?: string;
    priceRange?: string;
    campusId?: string;
    logoPublicUrl?: string;
  },
) {
  const canEdit =
    roleHasCapability(actor.role, 'vendor.approve') ||
    roleHasCapability(actor.role, 'editorial.create');
  if (!canEdit) throw new AuthorizationError('Missing capability');
  assertCampusAccess(actor, input.campusId);

  const description = sanitizeEditorialHtml(input.description);
  if (isEmptyHtml(description)) throw new AuthorizationError('Description is required');

  let categoryId: string | undefined;
  if (input.categoryName?.trim()) {
    const slug = slugify(input.categoryName);
    const category = await prisma.vendorCategory.upsert({
      where: { slug },
      update: { name: input.categoryName.trim() },
      create: { name: input.categoryName.trim(), slug },
    });
    categoryId = category.id;
  }

  const existing = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  let logoId = existing.logoId;
  if (input.logoPublicUrl?.trim()) {
    const media = await prisma.mediaAsset.create({
      data: {
        type: MediaType.IMAGE,
        publicUrl: input.logoPublicUrl.trim(),
        altText: input.businessName,
        rights: MediaRights.THIRD_PARTY,
        campusId: input.campusId ?? null,
        uploadedById: actor.id,
      },
    });
    logoId = media.id;
  }

  return prisma.vendor.update({
    where: { id: vendorId },
    data: {
      businessName: input.businessName.trim(),
      description,
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      instagram: input.instagram?.trim() || null,
      website: input.website?.trim() || null,
      openingHours: input.openingHours?.trim() || null,
      priceRange: input.priceRange?.trim() || null,
      categoryId: categoryId ?? existing.categoryId,
      logoId,
      campuses: input.campusId
        ? { deleteMany: {}, create: [{ campusId: input.campusId }] }
        : undefined,
    },
  });
}

export async function deleteOrArchiveVendor(actor: Actor, vendorId: string) {
  const canEdit =
    roleHasCapability(actor.role, 'vendor.approve') ||
    roleHasCapability(actor.role, 'editorial.create');
  if (!canEdit) throw new AuthorizationError('Missing capability');
  const item = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });

  if (item.listingStatus === VendorListingStatus.ACTIVE) {
    return prisma.vendor.update({
      where: { id: vendorId },
      data: { listingStatus: VendorListingStatus.ARCHIVED, verified: false },
    });
  }

  await prisma.vendor.delete({ where: { id: vendorId } });
  return { id: vendorId, deleted: true as const };
}
