#!/usr/bin/env node
/**
 * Lightweight staging smoke (Node 20+).
 * Usage:
 *   node scripts/staging-smoke.mjs
 *   WEB_URL=https://staging.example NEWSROOM_URL=... CONTROL_URL=... JOBS_CRON_SECRET=... node scripts/staging-smoke.mjs
 */

const web = (process.env.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
const newsroom = (process.env.NEWSROOM_URL || 'http://localhost:3001').replace(/\/$/, '');
const control = (process.env.CONTROL_URL || 'http://localhost:3002').replace(/\/$/, '');
const secret = process.env.JOBS_CRON_SECRET || '';

async function check(name, url, init) {
  const res = await fetch(url, init);
  const ok = res.ok || (name.includes('jobs unauthorized') && (res.status === 401 || res.status === 503));
  const body = await res.text();
  console.log(`${ok ? 'OK' : 'FAIL'} ${name} → ${res.status}`);
  if (!ok) {
    console.log(body.slice(0, 400));
    process.exitCode = 1;
  }
  return res;
}

async function main() {
  await check('web health', `${web}/api/health`);
  await check('newsroom health', `${newsroom}/api/health`);
  await check('control health', `${control}/api/health`);

  for (const path of ['/', '/latest', '/opportunities', '/events', '/guide', '/privacy', '/tip', '/sitemap.xml']) {
    await check(`web ${path}`, `${web}${path}`);
  }

  await check('jobs unauthorized', `${control}/api/jobs/tick`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });

  if (secret) {
    await check('jobs authorized', `${control}/api/jobs/tick`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secret}`,
        'content-type': 'application/json',
      },
      body: '{}',
    });
  } else {
    console.log('SKIP jobs authorized (JOBS_CRON_SECRET not set)');
  }

  if (process.exitCode) {
    console.error('Staging smoke failed');
    process.exit(process.exitCode);
  }
  console.log('Staging smoke passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
