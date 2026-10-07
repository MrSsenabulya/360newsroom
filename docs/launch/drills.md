# Launch drills

Record results in `drill-log.md`.

## 1. Scheduled publish drill

1. As Editor, schedule an Article 2–5 minutes ahead.
2. Confirm it appears in Control → Editorial scheduled monitor and Newsroom.
3. Run **Jobs** tick (Control or Newsroom) or wait for cron.
4. Confirm public URL is live and Audit shows publish.

**Pass:** publishes within 2 minutes of due time or failure is visible in Jobs with FAILED status.

## 2. Search failure drill

1. Temporarily break Search (e.g. stop DB briefly in staging, or force adapter error).
2. Load Home, Latest, Article — must still render.
3. `/search` shows unavailable message, not a blank 500 sitewide.
4. Control Health shows search degraded.

**Pass:** site usable without Search.

## 3. Commercial workflow rehearsal

1. Commercial Manager creates Sponsor → Campaign → Deliverable.
2. Advances campaign status; confirms contract value never appears on public web.
3. Public `/advertise` creates Lead; appears in Control → Leads.
4. Vendor Manager suspends a Guide listing; public Guide hides it.

**Pass:** full loop without engineering.

## 4. Opportunity expiration drill

1. Publish Opportunity with deadline in the past (or run expire job after deadline).
2. Confirm absent from active listing; direct URL shows Applications closed.

## 5. Access drill

1. Correspondent cannot publish Article.
2. Deactivate a test user; session blocked on next request.
3. Role change appears in Audit.
