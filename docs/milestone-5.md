# Milestone 5 — Commercial & Control

## Implemented

### Schema
- **Sponsor** (private contacts/notes)
- **Campaign** (+ campuses/universities; private `contractValue`)
- **CampaignDeliverable** (commercial monitors, does not edit journalism)
- **Placement**
- **CommercialLead** (+ campus links)
- Capability: `control.overview` (role matrix updated)

### 360 Control (`apps/control`)
- Overview (status → anomaly → action)
- Sponsors, Campaigns (+ detail/deliverables), Leads
- Vendor operations (suspend)
- Editorial health + scheduled monitor (observe only)
- People & Access (role, deactivate, campus scope) — audited
- Health (DB + Search), Jobs tick, Audit log

### Public
- `/advertise` enquiry form → creates Lead (`source: public`) without accepting private internal notes

### Packages
- `@campus360/content/commercial`
- `@campus360/content/control`

### Security
- Contract values / commercial notes / lead budgets never in public serializers
- Control routes gated by capability
- Role change and deactivation write AuditEvent
- Commercial cannot publish journalism via these surfaces

### Dev accounts (optional recreate)
| Role | Email | Password |
|------|--------|----------|
| COMMERCIAL_MANAGER | `commercial@campus360.test` | `Campus360!Commerce` |
| PLATFORM_ADMIN | `platform@campus360.test` | `Campus360!Platform` |

```bash
node packages/db/scripts/create-dev-users.mjs
```

## Exit

Sponsor/vendor/campaign workflows operate from Control without code changes.

## Next

Milestone 6 — Launch hardening (perf, a11y, security drills, monitoring, cron).
