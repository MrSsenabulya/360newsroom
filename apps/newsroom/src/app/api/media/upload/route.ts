import { NextResponse } from 'next/server';
import {
  createSupabaseStorageAdapter,
  getImagesBucket,
  IMAGE_MAX_BYTES,
  IMAGE_MIME_TYPES,
} from '@campus360/storage';
import { MediaType, MediaRights, prisma } from '@campus360/db';
import { requireNewsroomUser } from '../../../../lib/session';
import { loadActor } from '@campus360/content/actor';
import { roleHasCapability } from '@campus360/domain';

export const runtime = 'nodejs';

const ALLOWED = new Set<string>(IMAGE_MIME_TYPES);

export async function POST(request: Request) {
  try {
    const { user } = await requireNewsroomUser();
    const actor = await loadActor(user.id);
    const canUpload =
      roleHasCapability(actor.role, 'editorial.create') ||
      roleHasCapability(actor.role, 'editorial.editOwn') ||
      roleHasCapability(actor.role, 'editorial.editAny') ||
      roleHasCapability(actor.role, 'programme.manage') ||
      roleHasCapability(actor.role, 'vendor.approve');
    if (!canUpload) {
      return NextResponse.json({ error: 'Missing upload capability' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, GIF allowed' }, { status: 400 });
    }
    if (file.size > IMAGE_MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
    }

    const bucket = getImagesBucket();
    const ext =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : file.type === 'image/gif'
            ? 'gif'
            : 'jpg';
    const path = `newsroom/${actor.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storage = createSupabaseStorageAdapter();
    const buffer = Buffer.from(await file.arrayBuffer());
    await storage.upload({
      bucket,
      path,
      body: buffer,
      contentType: file.type,
      upsert: false,
    });
    const publicUrl = storage.getPublicUrl(bucket, path);

    const media = await prisma.mediaAsset.create({
      data: {
        type: MediaType.IMAGE,
        storagePath: `${bucket}/${path}`,
        publicUrl,
        altText: file.name,
        rights: MediaRights.OWNED,
        uploadedById: actor.id,
      },
    });

    return NextResponse.json({ id: media.id, publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
