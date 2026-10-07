import { createHash } from 'node:crypto';
import { prisma } from '@campus360/db';
import { assertRateLimit } from './rate-limit';

export async function submitStoryTip(input: {
  message: string;
  campusHint?: string;
  contactOptional?: string;
  ip?: string | null;
}) {
  const message = input.message.trim();
  if (message.length < 20) {
    throw new Error('Tip must be at least 20 characters');
  }
  if (message.length > 4000) {
    throw new Error('Tip is too long');
  }

  const ipKey = input.ip ? createHash('sha256').update(input.ip).digest('hex').slice(0, 32) : 'anon';
  const limit = assertRateLimit(`tip:${ipKey}`, 3, 15 * 60_000);
  if (!limit.ok) {
    throw new Error(`Too many tips. Try again in ${limit.retryAfterSec}s`);
  }

  return prisma.storyTip.create({
    data: {
      message,
      campusHint: input.campusHint?.trim() || null,
      contactOptional: input.contactOptional?.trim() || null,
      sourceIpHash: ipKey === 'anon' ? null : ipKey,
    },
  });
}

export async function listStoryTipsForDesk() {
  return prisma.storyTip.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
