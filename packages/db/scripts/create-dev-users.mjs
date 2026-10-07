import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '../src/generated/prisma/index.js';

function loadEnv(path) {
  const text = readFileSync(path, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const root = resolve(import.meta.dirname, '../../..');
const env = loadEnv(resolve(root, '.env'));

for (const [key, value] of Object.entries(env)) {
  if (!process.env[key]) process.env[key] = value;
}

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service || service.includes('PASTE_')) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const accounts = [
  {
    email: 'editor@campus360.test',
    password: 'Campus360!Editor',
    fullName: 'Managing Editor',
    role: 'EDITOR',
  },
  {
    email: 'correspondent@campus360.test',
    password: 'Campus360!Field',
    fullName: 'Campus Correspondent',
    role: 'CAMPUS_CORRESPONDENT',
  },
  {
    email: 'commercial@campus360.test',
    password: 'Campus360!Commerce',
    fullName: 'Commercial Manager',
    role: 'COMMERCIAL_MANAGER',
  },
  {
    email: 'platform@campus360.test',
    password: 'Campus360!Platform',
    fullName: 'Platform Admin',
    role: 'PLATFORM_ADMIN',
  },
];

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

async function ensureAuthUser(email, password, fullName) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (!error && created.user) {
    return created.user.id;
  }

  const already =
    error &&
    (String(error.message).toLowerCase().includes('already') ||
      String(error.message).toLowerCase().includes('registered'));

  if (!already) {
    throw new Error(`Create user failed for ${email}: ${error?.message}`);
  }

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw new Error(`User ${email} exists but was not found in list`);

  const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (updErr) throw updErr;
  return existing.id;
}

async function main() {
  const makerere = await prisma.campus.findUnique({ where: { slug: 'makerere' } });

  for (const account of accounts) {
    const userId = await ensureAuthUser(account.email, account.password, account.fullName);

    await prisma.userProfile.upsert({
      where: { id: userId },
      update: {
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        isActive: true,
      },
      create: {
        id: userId,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        isActive: true,
      },
    });

    if (account.role === 'CAMPUS_CORRESPONDENT' && makerere) {
      await prisma.campusScope.upsert({
        where: {
          userId_campusId: { userId, campusId: makerere.id },
        },
        update: {},
        create: { userId, campusId: makerere.id },
      });
    }

    console.log(`OK ${account.role} ${account.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
