# Incident response (V1)

## Severity

| Sev | Example | Response |
|-----|---------|----------|
| SEV1 | Public site down / auth outage / private source leak | Immediate: status page note, freeze publishes, page Platform + EIC |
| SEV2 | Search down, jobs failing, scheduling stuck | Degrade gracefully; run Jobs tick; communicate to desk |
| SEV3 | Single broken page / one campus empty | Ticket + next business day |

## First 15 minutes

1. Check `/api/health` on web, newsroom, control.
2. Check Supabase status + Control → Health / Jobs / Audit.
3. If leak suspected: take affected routes offline, rotate keys, audit `AuditEvent` and logs.
4. Assign Incident Lead (Platform) and Comms (EIC/Product).

## Comms

- Internal: Slack/WhatsApp desk channel with timestamped updates.
- Public: short banner or status note — no speculation.

## Post-incident

Write blameless notes: trigger, impact, fix, follow-ups. Append to `drill-log.md`.
