import { prisma } from '@campus360/db';

export type OperationalSurface = 'web' | 'newsroom' | 'control' | 'jobs';
export type OperationalSeverity = 'info' | 'warn' | 'error' | 'critical';

/** Persist operator-facing error detail. Never expose `detail` to end users. */
export async function reportOperationalError(input: {
  surface: OperationalSurface;
  severity?: OperationalSeverity;
  message: string;
  detail?: string | null;
  requestPath?: string | null;
  actorId?: string | null;
}) {
  try {
    return await prisma.operationalEvent.create({
      data: {
        surface: input.surface,
        severity: input.severity ?? 'error',
        message: input.message.slice(0, 500),
        detail: input.detail?.slice(0, 8000) ?? null,
        requestPath: input.requestPath ?? null,
        actorId: input.actorId ?? null,
      },
    });
  } catch {
    // Reporting must never break the primary request path.
    return null;
  }
}

export const FRIENDLY_ERROR_COPY =
  'Something went wrong. Please try again. If it keeps happening, contact the Campus 360 team.';
