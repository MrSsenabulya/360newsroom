import { prisma } from '@campus360/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  let database: 'ok' | 'down' = 'ok';
  let databaseDetail: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = 'down';
    databaseDetail = error instanceof Error ? error.message : 'Database unreachable';
  }

  return NextResponse.json(
    {
      service: 'newsroom',
      status: database === 'ok' ? 'ok' : 'degraded',
      checks: { database, databaseDetail },
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - started,
    },
    { status: database === 'ok' ? 200 : 503 },
  );
}
