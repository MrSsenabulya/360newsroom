import {
  AuthorizationError,
  roleHasCapability,
  roleIsCampusScoped,
  type Capability,
  type InternalRole,
} from '@campus360/domain';
import { prisma, type Role } from '@campus360/db';

export type Actor = {
  id: string;
  role: InternalRole;
  campusIds: string[];
};

function asRole(role: Role): InternalRole {
  return role as InternalRole;
}

/** Session actor — keep this module free of sanitize/HTML deps for Control RSC. */
export async function loadActor(userId: string): Promise<Actor> {
  const profile = await prisma.userProfile.findUniqueOrThrow({
    where: { id: userId },
    include: { campusScopes: true },
  });

  if (!profile.isActive) {
    throw new AuthorizationError('Account is deactivated');
  }

  return {
    id: profile.id,
    role: asRole(profile.role),
    campusIds: profile.campusScopes.map((scope) => scope.campusId),
  };
}

export function assertCapability(actor: Actor, capability: Capability) {
  if (!roleHasCapability(actor.role, capability)) {
    throw new AuthorizationError(`Missing capability: ${capability}`);
  }
}

export function assertCampusAccess(actor: Actor, campusId: string | null | undefined) {
  if (!roleIsCampusScoped(actor.role)) return;
  if (!campusId) {
    throw new AuthorizationError('Campus is required for your role');
  }
  if (actor.campusIds.length === 0) {
    throw new AuthorizationError('No campus scope assigned');
  }
  if (!actor.campusIds.includes(campusId)) {
    throw new AuthorizationError('Campus is outside your assigned scope');
  }
}
