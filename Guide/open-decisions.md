# Campus 360 — Open Decisions

These are intentionally unresolved. Cursor must not silently pick final production choices without approval.

## Final brand palette
Design system colors are provisional.
Need final identity audit + accessibility validation.

## Final fonts
Provisional:
- Archivo Variable
- Source Serif 4

Need brand approval.

## Search provider
Production needs dedicated Search or equivalent.

Candidates may include:
- Meilisearch
- Typesense
- hosted provider
- another appropriate engine

Requirement:
- `SearchAdapter`;
- entity-aware behavior;
- health/index/retry.

## Video provider
Need:
- adaptive streaming;
- processing state;
- secure upload;
- reasonable African delivery;
- thumbnails if available;
- analytics;
- cost fit.

Implement `VideoAdapter`.

## Object storage
S3-compatible.

Potential:
- Cloudflare R2
- AWS S3
- another compatible provider

Local/dev can use MinIO/compatible setup.

## Analytics
Need:
- events;
- privacy-conscious setup;
- data path for Control summaries.

Do not overcollect PII.

## Notifications
Push is not P0.

Leave room for:
- web push;
- email;
- WhatsApp distribution workflow.

## Public accounts
Not P0.

Decide after observing utility/retention.

## Campus Guide launch scope
Strong P1.

Requires:
- initial Vendor inventory;
- verification process;
- package/pricing model.

## Merch
V1 can use external/WhatsApp ordering.

Full checkout only when demand warrants.

## Control analytics architecture
Control aggregates other systems.
Warehouse/BI can wait for scale.

## Deployment provider

**Interim decision:** ADR 0003 — Vercel (or Next-compatible host) for the three apps, Supabase for data/auth/storage, GitHub Actions schedule for `POST /api/jobs/tick`.

Revisit if cost, region, or long-running worker needs change. Do not assume serverless-only if a dedicated worker becomes necessary later.

## URL conventions
Finalize before production:
- singular/plural;
- redirect rules;
- future locale/country strategy.

## Legal/privacy review
Before production:
- confirm Uganda privacy obligations;
- editorial/legal standards;
- consent/retention;
- commercial disclosure.

Placeholder policies are not final legal advice.
