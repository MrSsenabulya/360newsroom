'use server';

import { headers } from 'next/headers';
import { submitStoryTip } from '@campus360/content/tips';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitTipAction(formData: FormData) {
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    'unknown';

  const message = String(formData.get('message') ?? '').trim();
  const campusHint = String(formData.get('campusHint') ?? '').trim();
  const contactOptional = String(formData.get('contactOptional') ?? '').trim();

  await submitStoryTip({
    message,
    campusHint: campusHint || undefined,
    contactOptional: contactOptional || undefined,
    ip,
  });

  revalidatePath('/tip');
  redirect('/tip?sent=1');
}
