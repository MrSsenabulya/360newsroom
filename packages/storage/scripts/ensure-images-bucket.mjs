/**
 * Ensure the Campus 360 images Storage bucket exists (images only).
 *
 * Usage (from repo root):
 *   node packages/storage/scripts/ensure-images-bucket.mjs
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in root .env (or process env).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, 'apps/newsroom/.env.local'));

export const IMAGES_BUCKET = 'images';
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const existing = buckets?.find((b) => b.name === IMAGES_BUCKET);
  if (existing) {
    const { error: updateError } = await supabase.storage.updateBucket(IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: IMAGE_MAX_BYTES,
      allowedMimeTypes: IMAGE_MIME_TYPES,
    });
    if (updateError) throw updateError;
    console.log(`OK updated bucket "${IMAGES_BUCKET}" (public, images only, ≤5MB)`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: IMAGE_MAX_BYTES,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  });
  if (createError) throw createError;
  console.log(`OK created bucket "${IMAGES_BUCKET}" (public, images only, ≤5MB)`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
