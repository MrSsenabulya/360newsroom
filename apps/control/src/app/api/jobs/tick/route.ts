import { timingSafeEqual } from 'node:crypto';
import { runUtilityJobsTick } from '@campus360/content/jobs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function secretsMatch(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Production cron entrypoint.
 * Auth: Authorization: Bearer <JOBS_CRON_SECRET>
 * Also accepts x-jobs-cron-secret header for hosts that strip Authorization.
 */
export async function POST(request: Request) {
  const expected = process.env.JOBS_CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'JOBS_CRON_SECRET is not configured' },
      { status: 503 },
    );
  }

  const auth = request.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : null;
  const headerSecret = request.headers.get('x-jobs-cron-secret');
  const provided = bearer || headerSecret;

  if (!secretsMatch(provided, expected)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const started = Date.now();
  const results = await runUtilityJobsTick(null);

  return NextResponse.json({
    ok: true,
    service: 'control',
    durationMs: Date.now() - started,
    results,
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      hint: 'POST with Authorization: Bearer JOBS_CRON_SECRET to run the utility tick',
    },
    { status: 200 },
  );
}
