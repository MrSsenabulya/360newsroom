import { prisma } from '@campus360/db';
import { searchAdapter } from '@campus360/search';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  let database: 'ok' | 'down' = 'ok';
  let databaseDetail: string | undefined;
  let search: 'ok' | 'down' = 'ok';
  let searchDetail: string | undefined;
  let searchProvider: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = 'down';
    databaseDetail = error instanceof Error ? error.message : 'Database unreachable';
  }

  try {
    const health = await searchAdapter.health();
    searchProvider = health.provider;
    if (!health.ok) {
      search = 'down';
      searchDetail = health.detail;
    }
  } catch (error) {
    search = 'down';
    searchDetail = error instanceof Error ? error.message : 'Search unreachable';
  }

  const ok = database === 'ok' && search === 'ok';

  const body = {
    service: 'web',
    status: ok ? 'ok' : 'degraded',
    checks: {
      database,
      databaseDetail,
      search,
      searchProvider,
      searchDetail,
    },
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - started,
  };

  return NextResponse.json(body, {
    status: database === 'ok' ? 200 : 503,
  });
}
