import { listPeople } from '@campus360/content/control';
import { InternalRoles } from '@campus360/domain';
import { prisma } from '@campus360/db';
import { ControlChrome } from '../../components/control-chrome';
import {
  setCampusScopeAction,
  setUserActiveAction,
  updateUserRoleAction,
} from '../actions';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function PeoplePage() {
  const { actor } = await requireControlUser();
  if (!can(actor, 'users.manage')) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">People & Access requires users.manage.</p>
      </ControlChrome>
    );
  }

  const [people, campuses] = await Promise.all([
    listPeople(actor),
    prisma.campus.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <ControlChrome actor={actor} activePath="/people">
      <p className="c360-kicker">People & Access</p>
      <h1 className="c360-title">Internal users</h1>
      <p className="c360-lede">
        Deactivation blocks login while preserving authorship. Role changes are audited.
      </p>

      <ul className="c360-list" style={{ marginTop: 24 }}>
        {people.map((person) => (
          <li key={person.id} className="c360-list__item">
            <strong>{person.fullName ?? person.email}</strong>
            <p className="c360-meta">
              {person.email} · {person.role} · {person.isActive ? 'active' : 'deactivated'}
              {person.campusScopes.length
                ? ` · scopes: ${person.campusScopes.map((s) => s.campus.slug).join(', ')}`
                : ''}
            </p>

            <form action={updateUserRoleAction} className="c360-actions">
              <input type="hidden" name="userId" value={person.id} />
              <select name="role" defaultValue={person.role}>
                {InternalRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button className="c360-button c360-button--ghost" type="submit">
                Set role
              </button>
            </form>

            <form action={setUserActiveAction} className="c360-actions">
              <input type="hidden" name="userId" value={person.id} />
              <input type="hidden" name="isActive" value={person.isActive ? 'false' : 'true'} />
              <button className="c360-button c360-button--ghost" type="submit">
                {person.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </form>

            <form action={setCampusScopeAction} className="c360-actions">
              <input type="hidden" name="userId" value={person.id} />
              <select name="campusId" defaultValue={person.campusScopes[0]?.campusId ?? ''}>
                <option value="">Clear campus scope</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
              <button className="c360-button c360-button--ghost" type="submit">
                Set scope
              </button>
            </form>
          </li>
        ))}
      </ul>
    </ControlChrome>
  );
}
