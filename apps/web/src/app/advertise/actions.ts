'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { submitPublicCommercialEnquiry } from '@campus360/content/commercial';
import { assertRateLimit } from '@campus360/content';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitAdvertiseAction(formData: FormData) {
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 32);
  const limit = assertRateLimit(`advertise:${ipHash}`, 5, 15 * 60_000);
  if (!limit.ok) {
    throw new Error(`Too many enquiries. Try again in ${limit.retryAfterSec}s`);
  }

  const organisationName = String(formData.get('organisationName') ?? '').trim();
  const interest = String(formData.get('interest') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();
  const contactPhone = String(formData.get('contactPhone') ?? '').trim();
  const budgetRange = String(formData.get('budgetRange') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  const campusId = String(formData.get('campusId') ?? '') || undefined;

  if (!organisationName || !interest) {
    throw new Error('Organisation and interest are required');
  }

  await submitPublicCommercialEnquiry({
    organisationName,
    interest,
    contactName: contactName || undefined,
    contactEmail: contactEmail || undefined,
    contactPhone: contactPhone || undefined,
    budgetRange: budgetRange || undefined,
    message: message || undefined,
    campusId,
  });

  revalidatePath('/advertise');
  redirect('/advertise?sent=1');
}
