// Stratos — fictional B2B product analytics SaaS used as the primary demo org.
// Numbers are kept consistent across docs, conversations, and replies:
//   Free      100k events/month · 30-day retention · 1 dashboard
//   Pro       10M events/month  · 12-mo retention   · unlimited dashboards · $99/team/month
//   Enterprise custom volume     · 24-mo retention   · SAML SSO · custom price
// Refund policy: 14-day full refund · 30-day prorated on annual plans.

// Fixed UUIDs for idempotent seeding
export const MOCK_ORG_1 = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Stratos',
  slug: 'stratos',
  plan: 'pro',
}

export const MOCK_ORG_2 = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Beta SaaS',
  slug: 'beta',
  plan: 'free',
}

export const MOCK_ORGS = [MOCK_ORG_1, MOCK_ORG_2]

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS — 10 entries · consistent numbers · source_type ∈ {pdf,markdown,manual}
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    org_id: MOCK_ORG_1.id,
    title: 'Getting started with event tracking',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Getting started with event tracking

Events are the atomic unit of data in Stratos. Every meaningful action in your product — a sign-up, a feature toggle, a purchase — becomes an event that we ingest, store, and make available for analysis within seconds.

## Sending your first event

Install the SDK and call \`track()\` with an event name and an optional properties object:

\`\`\`js
import { stratos } from '@stratos/sdk'

stratos.init({ apiKey: process.env.STRATOS_KEY })

stratos.track('signup_completed', {
  plan: 'pro',
  source: 'landing_page',
  team_size: 8,
})
\`\`\`

Property values can be strings, numbers, booleans, or ISO 8601 date strings. Nested objects are flattened on ingestion (\`{ foo: { bar: 1 } }\` becomes \`foo.bar = 1\`).

## Naming conventions

We recommend \`snake_case\` for event names and properties, and verbs in past tense (\`signup_completed\`, \`invoice_paid\`, \`feature_enabled\`). Stick to one convention — once you have a few million events, renaming is painful.

## Identifying users

Call \`identify()\` once per session, ideally right after login:

\`\`\`js
stratos.identify('user_42', {
  email: 'jane@example.com',
  plan: 'pro',
  signup_date: '2026-01-15',
})
\`\`\`

User properties persist across events and can be used as cohort filters.

## Plan limits

| Plan       | Events / month | Retention |
|------------|----------------|-----------|
| Free       | 100k           | 30 days   |
| Pro        | 10M            | 12 months |
| Enterprise | custom         | 24 months |

When you approach 80% of your monthly quota we send an email to all workspace admins. Hitting 100% causes new events to be dropped (not buffered) — upgrade or wait for the monthly reset on the 1st.

## Verifying ingestion

Open the **Live stream** view in the dashboard within a few seconds of sending — events typically appear in under 2 seconds end-to-end. If nothing shows up after 30 seconds, check the **API logs** view for rejected payloads (most commonly malformed JSON or missing \`distinct_id\`).
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    org_id: MOCK_ORG_1.id,
    title: 'Setting up your first dashboard',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Setting up your first dashboard

A dashboard in Stratos is a collection of saved queries — line charts, bar charts, funnels, retention curves — that share filters and a time range.

## Creating a dashboard

From the sidebar, click **Dashboards → New dashboard**. Give it a name (e.g. *Growth*, *Activation*, *Revenue*) and pick a default time range. The free plan supports 1 dashboard; Pro and Enterprise are unlimited.

## Adding charts

Inside the dashboard, click **+ Add chart**. You'll see a query builder with five chart types:

- **Trends** — count events over time
- **Funnels** — multi-step conversion analysis
- **Retention** — cohort retention curves
- **Paths** — sequence of events users take
- **SQL** — raw read-only query for power users

Each chart starts with an event series. Click *Add filter* to narrow by property (e.g. \`country = "DE"\`) and *Break down by* to split the series (e.g. by \`plan\` or \`utm_source\`).

## Saving and sharing

Saved charts can be reused across dashboards. Click the share icon in the top right to copy a read-only link — recipients without a Stratos account see the dashboard but cannot edit. Internal sharing respects workspace permissions (see *User permissions and SSO setup*).

## Refresh and caching

Dashboards refresh on open and every 5 minutes while you have the tab focused. Background refresh is disabled on the Free plan; Pro and Enterprise refresh every 60 seconds.

## Embedding

For internal tools, click **Embed → Copy iframe**. The widget renders read-only and authenticates with a workspace-scoped JWT, so you don't need to expose API keys.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    org_id: MOCK_ORG_1.id,
    title: 'Data retention and storage limits',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Data retention and storage limits

Stratos keeps your raw event data hot and queryable for the retention window of your plan. After that, events are deleted permanently — there is no cold storage tier.

## Retention by plan

| Plan       | Raw event retention | Aggregated data |
|------------|---------------------|-----------------|
| Free       | 30 days             | 30 days         |
| Pro        | 12 months           | 12 months       |
| Enterprise | 24 months (default) | 24 months       |

Enterprise customers can extend retention beyond 24 months on request — contact your account manager. We do not currently support importing historical events older than your plan's window.

## Event volume

Volume is counted per ingested event, regardless of property count or payload size (within reason — payloads over 32KB are rejected with a 413).

- **Free**: 100k events/month
- **Pro**: 10M events/month (\`$99/team/month\`)
- **Enterprise**: custom, typically 100M-10B events/month

If you exceed your monthly cap, new events are dropped at the edge. Drops are visible in the **API logs** view with a \`429 rate_limited\` reason code.

## Property cardinality

Each event can have up to 100 properties. Each property name has a hard cap of 50k distinct values per workspace — beyond that, the property becomes filterable but not group-by-able to keep query latency stable.

## Deletion on request

Workspace admins can purge a specific user's events via **Settings → Privacy → Erase user data** or programmatically via \`DELETE /v1/users/{distinct_id}\`. Deletions complete asynchronously within 72 hours. This is the mechanism we use to fulfill GDPR Article 17 requests.

## Backups

We take continuous WAL backups of all ingestion stores with point-in-time recovery up to 7 days. Backups are encrypted, geographically replicated, and never accessible to anyone outside the SRE team.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    org_id: MOCK_ORG_1.id,
    title: 'Security, compliance, and SOC 2',
    source_type: 'pdf' as const,
    status: 'ready' as const,
    content: `# Security, compliance, and SOC 2

This document summarizes the security and compliance posture of Stratos. A formal SOC 2 Type II report is available under NDA — request via security@stratos.example.

## Certifications

- **SOC 2 Type II** — annual audit by an independent CPA firm, covering the Security, Availability, and Confidentiality Trust Service Criteria
- **GDPR compliant** — we act as a data processor under Article 28; DPA available on request
- **CCPA compliant** — California consumer rights are honored for end users of Stratos customers
- **ISO 27001** — certification in progress, expected Q4 2026

## Data in transit

All API endpoints terminate TLS 1.3 with modern cipher suites (no SSL, no TLS 1.0/1.1). HSTS is enforced with a 12-month max-age. We publish CAA records restricting issuance to Let's Encrypt.

## Data at rest

Event data is stored in column-oriented warehouses encrypted with AES-256-GCM. Encryption keys are managed by a KMS with hardware-backed key wrapping and rotated every 90 days. Backups are encrypted with separate keys.

## Access control

Stratos engineers have no access to customer event data in normal operation. Production access is gated behind:
- Mandatory FIDO2 hardware keys
- Just-in-time access requests with peer approval
- Full session recording for all production shell access
- Audit logs retained 18 months

## Subprocessors

A current list of subprocessors (cloud, payment, email, error tracking) is published at stratos.example/subprocessors and updated 30 days before any addition. Existing customers can object during that notice window.

## Reporting a vulnerability

Coordinated disclosure: security@stratos.example with PGP key on the page. We pay bounties up to $5,000 for critical findings on customer-facing surfaces.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000005',
    org_id: MOCK_ORG_1.id,
    title: 'Integrations: Slack, Segment, Webhooks',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Integrations: Slack, Segment, Webhooks

Stratos plugs into the tools your team already uses. Three integration surfaces cover most needs: Slack alerts, Segment ingestion, and outbound webhooks.

## Slack

Connect Slack from **Settings → Integrations → Slack**. The OAuth flow installs our bot in your workspace; pick the channel where alerts should land.

Once connected, any saved chart can trigger an alert:
- Anomaly alerts — fire when the metric deviates from the 14-day rolling baseline by more than N standard deviations
- Threshold alerts — fire when the metric crosses a static value (e.g. signups < 50 in 24h)
- Schedule alerts — fire on a cron (daily 9am UTC, weekly Monday)

Alert messages include the chart preview and a one-click link back to the dashboard.

## Segment

If you already send events to Segment, no SDK change is needed. Add Stratos as a destination in Segment, paste your write key, and we'll receive a copy of every event Segment forwards.

You can map Segment \`identify\` calls to Stratos user properties and Segment \`group\` calls to organization properties without writing transformation code.

## Outbound webhooks

For automation, configure webhooks in **Settings → Webhooks**. Pick the events you want (signup, churn, threshold breach), point at your endpoint, and we'll POST a signed payload.

Every webhook payload is signed with HMAC-SHA256 using your webhook secret. Verify in your handler:

\`\`\`ts
import { createHmac, timingSafeEqual } from 'crypto'

const sig = req.headers['x-stratos-signature']
const expected = createHmac('sha256', SECRET).update(req.rawBody).digest('hex')
if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
  return res.status(401).end()
}
\`\`\`

Webhooks retry with exponential backoff (max 24 hours, 11 attempts) on any non-2xx response.

## What's not supported

We don't currently offer a Zapier app — most use cases are covered by webhooks. A native HubSpot integration is on the roadmap for late 2026.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000006',
    org_id: MOCK_ORG_1.id,
    title: 'Billing, plans, and refund policy',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Billing, plans, and refund policy

Stratos billing is per-workspace, per-team. A team is a billable unit; workspaces with multiple teams are charged per team.

## Plans

### Free — $0

- 100k events / month
- 30-day retention
- 1 dashboard
- Community support (forum, max 48h response)

### Pro — $99 / team / month

- 10M events / month
- 12-month retention
- Unlimited dashboards
- Slack and Segment integrations
- Email support (max 24h response, business days)

### Enterprise — custom

- Custom event volume (typically 100M-10B / month)
- 24-month retention (extendable on request)
- SAML SSO, SCIM provisioning
- Dedicated success manager
- 99.9% uptime SLA with credits
- DPA, BAA, custom contract terms

Contact sales@stratos.example to scope an Enterprise quote.

## Annual discount

Annual prepay saves 20% on Pro and is the default for Enterprise. Annual customers can switch to monthly at renewal with no penalty.

## Refund policy

We offer a **14-day full refund**, no questions asked, from the date of initial purchase. Email billing@stratos.example to initiate — typically processed within 3 business days.

After 14 days, monthly plans are not refundable but can be cancelled before the next renewal. **Annual plans are eligible for a prorated refund within the first 30 days** based on unused months. Beyond 30 days, annual prepayments are non-refundable but unused capacity rolls into the next billing cycle if you renew.

## Overages

If you exceed your event quota, new events are dropped at the edge — we never auto-bill overages. You'll see a warning in the dashboard and an email at 80% / 100% usage. To raise the cap mid-cycle, upgrade your plan or contact sales for a temporary lift.

## Failed payments

After two failed charge attempts (3 days apart), the workspace is downgraded to the Free plan automatically. Data is preserved according to Free plan retention (30 days) — settle the invoice within that window to restore full access without data loss.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000007',
    org_id: MOCK_ORG_1.id,
    title: 'User permissions and SSO setup',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# User permissions and SSO setup

Stratos workspaces have three role tiers and an optional SAML SSO layer on Enterprise.

## Roles

- **Owner** — billing, plan changes, workspace deletion. Exactly one per workspace, transferable.
- **Admin** — invite users, manage API keys, install integrations, change retention. No billing access.
- **Member** — create and edit dashboards, run queries. Cannot invite or change settings.
- **Viewer** (Enterprise only) — read-only access to shared dashboards.

Roles are workspace-scoped. A user can be Admin in one workspace and Viewer in another.

## Inviting users

From **Settings → Members**, click *Invite*. Enter an email, pick a role, and we'll send an invitation valid for 7 days. Reinvite at any time — the previous invitation is invalidated.

Invitees without a Stratos account create one through the invite link; existing users are added to the workspace immediately.

## SAML SSO (Enterprise only)

SSO is available on Enterprise plans. We support any SAML 2.0 IdP — Okta, Auth0, Azure AD, Google Workspace, JumpCloud.

Setup is a 10-minute exchange of metadata XML. From **Settings → Authentication → SAML**, upload your IdP metadata and copy our SP metadata into your IdP. JIT provisioning creates Stratos users on first sign-in with a default Member role; SCIM is available if you want role mapping from IdP groups.

**SSO is not available on Pro or Free plans.** Pro workspaces can enforce 2FA across all members (TOTP only, no SMS) under **Settings → Authentication**.

## Session and security

Sessions expire after 30 days of inactivity. Admins can force-expire all active sessions for the workspace from **Settings → Security → Revoke sessions** — useful after offboarding.

## Audit log

Available on Enterprise. Every admin action (invite, role change, API key created, integration installed) is logged with actor, timestamp, IP, and user agent. Logs are exportable as CSV or streamed to your SIEM via the audit webhook.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000008',
    org_id: MOCK_ORG_1.id,
    title: 'Migrating from Mixpanel or Amplitude',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Migrating from Mixpanel or Amplitude

Most teams migrate to Stratos for one of three reasons: cleaner SQL, simpler pricing, or self-hosting (Enterprise). The migration usually takes 1-2 weeks of part-time work.

## Step 1 — Dual-send for two weeks

The lowest-risk path is to send events to both Stratos and your current vendor for 1-2 weeks before switching dashboards. Most SDKs support fan-out:

\`\`\`js
mixpanel.track('signup_completed', props)
stratos.track('signup_completed', props)
\`\`\`

This lets you validate event counts, property names, and identity stitching against your existing source of truth.

## Step 2 — Historical backfill

We can ingest a historical export from Mixpanel or Amplitude — JSON Lines format, gzipped, dropped into an S3 bucket we provision for you. Typical import speed is 10M events/hour. Backfilled events count against your retention window, not your monthly quota.

## Step 3 — Property mapping

Mixpanel and Amplitude both use \`$\`-prefixed reserved properties (\`$os\`, \`$device_id\`). Stratos uses the same convention, so most properties map 1:1. The notable exceptions:

| Mixpanel / Amplitude | Stratos              |
|----------------------|----------------------|
| \`distinct_id\`        | \`distinct_id\`        |
| \`$identified_id\`     | \`user_id\`            |
| \`$user_id\`           | \`user_id\`            |
| \`event_uuid\`         | \`event_id\`           |
| \`time\` / \`timestamp\`  | \`timestamp\` (ISO 8601) |

## Step 4 — Recreate key reports

We don't auto-convert dashboards — query semantics differ enough that a manual port catches bugs early. Pick your top 10 reports and rebuild them; this surfaces any property-mapping gaps from step 3.

## Costs

For most teams under 100M events/month, Pro at $99/team is significantly cheaper than the equivalent Mixpanel Growth or Amplitude Plus tier. We don't charge for MTUs (monthly tracked users) — only event volume.

## Support during migration

Pro and Enterprise customers get free 30-minute Zoom sessions during the migration window. Book at stratos.example/migration-call.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000009',
    org_id: MOCK_ORG_1.id,
    title: 'API reference and rate limits',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# API reference and rate limits

The Stratos REST API mirrors what the SDKs do — use it directly when an SDK isn't available for your runtime, or for server-to-server workloads.

## Base URL

\`\`\`
https://api.stratos.example/v1
\`\`\`

## Authentication

All endpoints require a workspace API key in the \`Authorization\` header:

\`\`\`
Authorization: Bearer sk_live_<key>
\`\`\`

Keys are scoped to a single workspace and a permission set (\`ingest\`, \`read\`, or \`admin\`). Generate keys in **Settings → API Keys**.

## Ingestion

\`\`\`
POST /v1/events
\`\`\`

Body:

\`\`\`json
{
  "event": "signup_completed",
  "distinct_id": "user_42",
  "properties": { "plan": "pro" },
  "timestamp": "2026-05-14T10:00:00Z"
}
\`\`\`

Batch up to 500 events in a single call by sending an array. The endpoint is fully asynchronous — a 200 response means the payload was queued, not that it's been processed yet.

## Reading

\`\`\`
GET  /v1/events?event=signup_completed&from=2026-05-01&to=2026-05-14
POST /v1/queries  (SQL)
\`\`\`

Read endpoints return paginated JSON with a \`next_cursor\` field. The SQL endpoint accepts read-only SELECT statements against your workspace's event tables.

## Rate limits

| Endpoint group | Free       | Pro        | Enterprise |
|----------------|------------|------------|------------|
| Ingestion      | 1k req/min | 10k req/min| custom     |
| Read           | 60 req/min | 300 req/min| custom     |
| SQL            | n/a        | 30 req/min | custom     |

Limits are per workspace, not per key. When you hit a limit you get a \`429\` with \`Retry-After\` in seconds and the current \`X-RateLimit-Remaining\` header.

## Errors

Errors return JSON with \`code\`, \`message\`, and a \`request_id\` you can include in support tickets:

\`\`\`json
{ "code": "invalid_property_value", "message": "...", "request_id": "req_..." }
\`\`\`

## SDKs

Official SDKs: JavaScript/TypeScript, Python, Ruby, Go, Java, .NET, Swift, Kotlin. Source on GitHub at github.com/stratos.
`,
  },
  {
    id: '00000000-0000-0000-0001-000000000010',
    org_id: MOCK_ORG_1.id,
    title: 'Troubleshooting common ingestion errors',
    source_type: 'manual' as const,
    status: 'ready' as const,
    content: `# Troubleshooting common ingestion errors

Most ingestion issues fall into one of five buckets. Walk through them in order; each takes under 5 minutes to verify.

## 1. Events sent but not appearing in the dashboard

Open **API logs** and filter by your API key. If you see 2xx responses but no events in the Live stream:

- Confirm the time range on the dashboard isn't excluding recent events
- Confirm you're looking at the right workspace (top-left switcher)
- Wait up to 2 minutes — end-to-end ingestion latency is usually under 5s, but can spike during incidents

## 2. 401 Unauthorized

The most common cause: the key was rotated or revoked. Generate a new one in **Settings → API Keys** and update your environment.

Second most common: the key has \`read\` scope only and you're trying to call \`POST /events\`. Use a key with \`ingest\` scope or higher.

## 3. 400 invalid_property_value

A property contains a value we cannot index. Common cases:

- A property name with whitespace or special characters (only \`[a-zA-Z0-9_.-]\` is allowed)
- A value over 8KB
- A timestamp not in ISO 8601 format

The error response includes the offending property name. Fix the producing code and resend — we do not buffer rejected events.

## 4. 413 payload_too_large

Single events over 32KB or batch arrays over 5MB are rejected. Split the batch or trim the payload — large property values are often the culprit (a base64-encoded image accidentally serialized as a property).

## 5. 429 rate_limited

You've hit the per-workspace rate limit for your plan. The \`Retry-After\` header tells you how long to wait. Production SDKs handle this automatically with exponential backoff; if you're hand-rolling, respect the header.

If you're consistently rate-limited at 80% of the documented limit, contact support — the limiter uses sliding windows and a sudden burst can trip it slightly earlier.

## Still stuck

Email support@stratos.example with the \`request_id\` from a failed call and the workspace slug. Pro replies within 24 business hours; Enterprise within 1 hour during business hours.
`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS — 18 entries · distributed across last 7 days · cited replies
// Visitor queries follow the patterns expected on the public landing/docs
// pages of a B2B product analytics SaaS.
// ─────────────────────────────────────────────────────────────────────────────

// Helpers to make timestamps consistent and readable.
const ISO = (offsetMs: number) => new Date(Date.now() - offsetMs).toISOString()
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export const MOCK_CONVERSATIONS = [
  // ── Today (≈30%) ──────────────────────────────────────────────────────────
  {
    id: '00000000-0000-0000-0002-000000000001',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-2a91',
    started_at: ISO(2 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How do I track custom events?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Custom events are tracked via stratos.track("event_name", { properties }) in any of our SDKs. Properties accept strings, numbers, booleans, and ISO 8601 date strings; nested objects are flattened on ingestion. We recommend snake_case event names and past-tense verbs like signup_completed. [1]', tokens_used: 138, cost_cents: 2 },
      { role: 'user' as const, content: 'Is there a limit on how many properties per event?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Each event can carry up to 100 properties. Per-property cardinality is capped at 50k distinct values per workspace — past that, the property stays filterable but is no longer available as a group-by, to keep query latency stable. [3]', tokens_used: 102, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-7c43',
    started_at: ISO(4 * HOUR),
    messages: [
      { role: 'user' as const, content: "What's the difference between Pro and Enterprise?", tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Pro is $99/team/month with 10M events and 12-month retention. Enterprise adds custom event volume (typically 100M-10B/month), 24-month retention, SAML SSO, SCIM provisioning, a dedicated success manager, and a 99.9% uptime SLA with credits. Contact sales for an Enterprise quote. [6]', tokens_used: 156, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-94e1',
    started_at: ISO(6 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Do you have a Python SDK?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes. Official SDKs are available for JavaScript/TypeScript, Python, Ruby, Go, Java, .NET, Swift, and Kotlin. Source is on GitHub at github.com/stratos. [9]', tokens_used: 88, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000004',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-1f0d',
    started_at: ISO(8 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How do I set up Slack alerts?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Connect Slack from Settings → Integrations → Slack and pick a channel. Any saved chart can then trigger an alert: anomaly (vs the 14-day rolling baseline), threshold (static value), or schedule (cron). Messages include the chart preview and a direct link. [5]', tokens_used: 124, cost_cents: 2 },
      { role: 'user' as const, content: 'Can I set different alert channels per dashboard?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes — each alert chooses its own channel independently, so the same workspace can route revenue alerts to #revenue and infra alerts to #oncall. [5]', tokens_used: 84, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-6b29',
    started_at: ISO(12 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How long does ingestion take after sending?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'End-to-end ingestion latency is typically under 2 seconds. You can verify in the Live stream view — events appear within a few seconds of being sent. If nothing shows after 30 seconds, check API logs for rejected payloads. [1]', tokens_used: 111, cost_cents: 1 },
    ],
  },

  // ── Yesterday (≈30%) ──────────────────────────────────────────────────────
  {
    id: '00000000-0000-0000-0002-000000000006',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-ae84',
    started_at: ISO(DAY + 2 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Is SSO available on Pro plan?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'No — SAML SSO is Enterprise-only. Pro workspaces can enforce 2FA (TOTP) across all members under Settings → Authentication, which covers most security requirements short of full IdP integration. [7]', tokens_used: 101, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000007',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-3d52',
    started_at: ISO(DAY + 5 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Can I export raw event data?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes. Use the GET /v1/events endpoint with pagination, or the POST /v1/queries SQL endpoint for filtered exports. Both respect your plan retention window — Pro keeps 12 months of raw events, Enterprise keeps 24+. [9]', tokens_used: 118, cost_cents: 2 },
      { role: 'user' as const, content: 'Is there a rate limit on the read API?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Read endpoints allow 60 req/min on Free, 300 req/min on Pro, and custom limits on Enterprise. The SQL endpoint is rate-limited separately at 30 req/min on Pro. Limits return 429 with a Retry-After header. [9]', tokens_used: 124, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000008',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-c712',
    started_at: ISO(DAY + 9 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How does your refund policy work?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Full refund within 14 days of initial purchase, no questions asked — email billing@stratos.example. Past 14 days, monthly plans are not refundable. Annual plans are eligible for a prorated refund within the first 30 days based on unused months. [6]', tokens_used: 142, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000009',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-820f',
    started_at: ISO(DAY + 14 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Do you support GDPR data deletion requests?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes. Workspace admins can purge a specific user from Settings → Privacy → Erase user data, or via DELETE /v1/users/{distinct_id}. Deletion completes asynchronously within 72 hours and fulfills GDPR Article 17 requirements. [3][4]', tokens_used: 131, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000010',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-5e3a',
    started_at: ISO(DAY + 18 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Can I run cohort analysis on retention?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes. The Retention chart type builds cohort curves out of the box — pick a "performed event" (e.g. signup) and a "returned event" (e.g. session_started), then slice by any user property. Cohorts can be filtered to specific time windows. [2]', tokens_used: 128, cost_cents: 2 },
      { role: 'user' as const, content: 'Can I export the cohort table as CSV?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes — every chart has a "Download CSV" option in the overflow menu. The download contains the same rows shown in the cohort grid. [2]', tokens_used: 76, cost_cents: 1 },
    ],
  },

  // ── 2-5 days ago (≈40%) ───────────────────────────────────────────────────
  {
    id: '00000000-0000-0000-0002-000000000011',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-0b76',
    started_at: ISO(2 * DAY + 3 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How do I track custom events?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Custom events are tracked via stratos.track("event_name", { properties }) in any of our SDKs. We recommend snake_case event names and past-tense verbs. Property values can be strings, numbers, booleans, or ISO date strings. [1]', tokens_used: 124, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000012',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-fa18',
    started_at: ISO(2 * DAY + 11 * HOUR),
    messages: [
      { role: 'user' as const, content: "I'm migrating from Mixpanel — how hard is it?", tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Most teams take 1-2 weeks. The recommended path is to dual-send to both platforms for two weeks, then switch dashboards. We can ingest a historical backfill from Mixpanel exports (JSON Lines, gzipped) at about 10M events/hour. [8]', tokens_used: 138, cost_cents: 2 },
      { role: 'user' as const, content: 'Do property names map automatically?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: "Most do — Mixpanel and Stratos share the same $-prefixed reserved property convention. The notable differences are $identified_id → user_id, event_uuid → event_id, and time → timestamp (ISO 8601). [8]", tokens_used: 112, cost_cents: 1 },
      { role: 'user' as const, content: 'And dashboards?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: "We don't auto-convert dashboards — query semantics differ enough that a manual port catches bugs early. Pick your top 10 reports and rebuild them, which also surfaces any property-mapping gaps from the migration. [8]", tokens_used: 108, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000013',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-7e02',
    started_at: ISO(3 * DAY + 4 * HOUR),
    messages: [
      { role: 'user' as const, content: 'What happens if I exceed my monthly event quota?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'New events are dropped at the edge — we never auto-bill overages. You receive a warning email at 80% and 100% usage. To raise the cap mid-cycle, upgrade your plan or contact sales for a temporary lift. [6]', tokens_used: 114, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000014',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-19bc',
    started_at: ISO(3 * DAY + 16 * HOUR),
    messages: [
      { role: 'user' as const, content: "What's your SLA on Enterprise?", tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Enterprise plans include a 99.9% monthly uptime SLA with service credits for any breach. Free and Pro plans have no formal SLA, though we operate them against the same internal targets. [6]', tokens_used: 96, cost_cents: 1 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000015',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-d6a3',
    started_at: ISO(4 * DAY + 7 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Is there a free trial?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'The Free plan is permanently free — 100k events/month and 30-day retention — and serves as the trial for Pro features. There is no separate time-boxed trial. Pro can be cancelled within 14 days for a full refund if it does not fit. [6]', tokens_used: 122, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000016',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-83ef',
    started_at: ISO(5 * DAY + 9 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How do I track custom events?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Use stratos.track("event_name", { properties }) from any SDK. The SDK auto-batches and retries on transient failures. Identify the user once per session via stratos.identify(distinct_id, traits) and we stitch the events to that profile. [1]', tokens_used: 130, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000017',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-2d4b',
    started_at: ISO(6 * DAY + 2 * HOUR),
    messages: [
      { role: 'user' as const, content: 'Are you SOC 2 certified?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes — Stratos is SOC 2 Type II certified with an annual audit covering Security, Availability, and Confidentiality. We are also GDPR and CCPA compliant. The Type II report is available under NDA from security@stratos.example. [4]', tokens_used: 128, cost_cents: 2 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000018',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-bf91',
    started_at: ISO(6 * DAY + 15 * HOUR),
    messages: [
      { role: 'user' as const, content: 'How do I verify a webhook signature?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Every webhook payload is signed with HMAC-SHA256 using your webhook secret. Compute the expected signature over the raw body and compare against the x-stratos-signature header using a constant-time comparison (timingSafeEqual in Node). [5]', tokens_used: 134, cost_cents: 2 },
      { role: 'user' as const, content: 'What if my endpoint is temporarily down?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Webhooks retry with exponential backoff for up to 24 hours (11 attempts) on any non-2xx response. After the final retry, the delivery is logged as failed and visible in Settings → Webhooks → Delivery log. [5]', tokens_used: 116, cost_cents: 2 },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// API KEYS — 2 entries for Stratos · realistic names, hashed key materials.
// Plaintext is the value that gets hashed into key_hash during seeding; in the
// running app, only the hash is stored and a fresh sk-demo-<hex> is returned
// at create-time, so the plaintext below is never exposed to users.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_API_KEYS = [
  {
    id: '00000000-0000-0000-0003-000000000001',
    org_id: MOCK_ORG_1.id,
    name: 'Production website',
    plaintext: 'sk-stratos-prod-9f3a82b1c47e6d05',
    key_prefix: 'sk-stratos-prod-9f3a',
  },
  {
    id: '00000000-0000-0000-0003-000000000002',
    org_id: MOCK_ORG_1.id,
    name: 'Staging',
    plaintext: 'sk-stratos-staging-2c91e4a78bf03d6e',
    key_prefix: 'sk-stratos-staging-2c91',
  },
  {
    id: '00000000-0000-0000-0003-000000000003',
    org_id: MOCK_ORG_2.id,
    name: 'Internal portal',
    plaintext: 'sk-nimbus-internal-7d4e2a9f3c8b1054',
    key_prefix: 'sk-nimbus-internal-7d4e',
  },
]
