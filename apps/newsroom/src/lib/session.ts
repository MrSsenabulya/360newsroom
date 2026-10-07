import { createServerSupabaseClient } from '@campus360/auth/server';
import { prisma } from '@campus360/db';
import { loadActor, type Actor } from '@campus360/content/actor';
import { roleHasCapability, type Capability, type InternalRole } from '@campus360/domain';
import { redirect } from 'next/navigation';

export async function requireNewsroomUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/login');
  }

  await prisma.userProfile.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      isActive: true,
    },
    create: {
      id: user.id,
      email: user.email,
      fullName:
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : user.email.split('@')[0] ?? null,
      role: 'JOURNALIST',
    },
  });

  const actor = await loadActor(user.id);
  return { user, actor };
}

export async function requireCapability(capability: Capability) {
  const session = await requireNewsroomUser();
  if (!roleHasCapability(session.actor.role, capability)) {
    throw new Error(`Missing capability: ${capability}`);
  }
  return session;
}

export function can(actor: Actor, capability: Capability) {
  return roleHasCapability(actor.role, capability);
}

export type { Actor, InternalRole };
