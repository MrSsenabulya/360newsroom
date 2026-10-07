import { createServerSupabaseClient } from '@campus360/auth/server';
import { loadActor, type Actor } from '@campus360/content/actor';
import { roleCanAccessControl } from '@campus360/content/control';
import { prisma } from '@campus360/db';
import { roleHasCapability, type Capability, type InternalRole } from '@campus360/domain';
import { redirect } from 'next/navigation';

export async function requireControlUser() {
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
      role: 'PLATFORM_ADMIN',
    },
  });

  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { id: user.id } });
  if (!profile.isActive) {
    redirect('/login?deactivated=1');
  }

  const actor = await loadActor(user.id);
  if (!roleCanAccessControl(actor.role)) {
    redirect('/login?forbidden=1');
  }

  return { user, actor, profile };
}

export function can(actor: Actor, capability: Capability) {
  return roleHasCapability(actor.role, capability);
}

export type { Actor, InternalRole };
