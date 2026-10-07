import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Default Newsroom/public image bucket (images only). */
export const IMAGES_BUCKET = 'images';

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export type ObjectStorageAdapter = {
  upload(input: {
    bucket: string;
    path: string;
    body: Blob | ArrayBuffer | Buffer | File;
    contentType?: string;
    upsert?: boolean;
  }): Promise<{ path: string }>;
  getPublicUrl(bucket: string, path: string): string;
};

export function getImagesBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || IMAGES_BUCKET;
}

export function createSupabaseStorageAdapter(
  client?: SupabaseClient,
): ObjectStorageAdapter {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  const supabase =
    client ??
    createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  return {
    async upload({ bucket, path, body, contentType, upsert = false }) {
      if (!url || !key) {
        throw new Error(
          'Storage not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
        );
      }
      const { error } = await supabase.storage.from(bucket).upload(path, body, {
        contentType,
        upsert,
      });

      if (error) {
        throw error;
      }

      return { path };
    },
    getPublicUrl(bucket, path) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
  };
}
