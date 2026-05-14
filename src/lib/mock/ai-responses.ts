import type { StreamEvent } from '@/lib/ai/chat'

const STRATOS_REPLIES = [
  'Custom events are tracked via stratos.track("event_name", { properties }) in any SDK. Property values can be strings, numbers, booleans, or ISO 8601 date strings. Nested objects are flattened automatically on ingestion. [1]',
  'Free includes 100k events/month and 30-day retention. Pro starts at $99/team/month with 10M events and 12-month retention. Enterprise adds SAML SSO, SCIM, custom retention, and a dedicated success manager. [6]',
  'Yes — Stratos is SOC 2 Type II certified and GDPR compliant. Data is encrypted in transit (TLS 1.3) and at rest (AES-256-GCM). The Type II report is available under NDA. [4]',
  'Full refund within 14 days of initial purchase, no questions asked. Past 14 days, monthly plans are not refundable. Annual plans are eligible for a prorated refund within the first 30 days based on unused months. [6]',
  'Connect Slack from Settings → Integrations → Slack. Any saved chart can trigger anomaly, threshold, or scheduled alerts; messages include the chart preview and a one-click link back to the dashboard. [5]',
  'Workspace admins can purge a specific user via Settings → Privacy → Erase user data, or programmatically with DELETE /v1/users/{distinct_id}. Deletion completes asynchronously within 72 hours and satisfies GDPR Article 17. [3][4]',
  'SAML SSO is Enterprise-only — Okta, Auth0, Azure AD, Google Workspace, and JumpCloud are all supported. Pro workspaces can enforce 2FA (TOTP) across all members under Settings → Authentication. [7]',
  'Most teams migrate in 1-2 weeks. The recommended path is to dual-send to both platforms for two weeks, then switch dashboards. We can ingest a Mixpanel/Amplitude historical export at ~10M events/hour. [8]',
  'Read endpoints allow 60 req/min on Free, 300 req/min on Pro, and custom limits on Enterprise. The SQL endpoint is rate-limited separately at 30 req/min on Pro. 429 responses include a Retry-After header. [9]',
  'Ingestion latency is typically under 2 seconds end-to-end. Verify in the Live stream view — if events do not appear after 30 seconds, check API logs for rejected payloads (most often malformed JSON or missing distinct_id). [1][10]',
  'Webhook payloads are signed with HMAC-SHA256 using your webhook secret. Compute the expected signature over the raw body and compare against the x-stratos-signature header using a constant-time comparison. [5]',
  'When you exceed the monthly event quota, new events are dropped at the edge — we never auto-bill overages. Warning emails are sent at 80% and 100% usage. To raise the cap mid-cycle, upgrade or contact sales. [6]',
]

const NIMBUS_REPLIES = [
  "Receipts go in Pleo for both software stipends ($500/year) and the one-time hardware stipend. For anything outside those buckets, post in #ops with the receipt — finance batches reimbursements every other Friday. [5]",
  "Unlimited PTO with a 15-day minimum. Ops nudges you in November if you're under that threshold. Put planned time off in the team Google Calendar at least 2 weeks ahead; same-day sick leave is just a Slack message in #team. [3]",
  "You can work from any country for up to 90 days a year without telling anyone, as long as you can keep the 10:00–14:00 UTC overlap and your work doesn't suffer. Beyond 90 days, tell ops 30 days ahead so we can check tax implications. [3]",
  "Staging is provisioned via Okta SSO — once your account is set up, the staging app shows up in your Okta dashboard automatically (usually within an hour of onboarding). If you don't see it after Day 1, ping #ops. [5]",
  "OKR drafts are due the last week of the current quarter; final OKRs lock in on the first Monday of the new quarter at the all-hands. Weekly Friday all-hands have a 5-minute KR check-in with confidence scores. [4]",
  "We're remote-first with three time zones and a 10:00–14:00 UTC overlap. Monday standup at 09:30 UTC (20 min) and Friday all-hands at 16:00 UTC (45 min). Tuesday and Thursday have no recurring meetings — protected deep-work days. [1]",
  "Side projects are fine and encouraged with two guardrails: they can't compete with Nimbus directly, and they can't use Nimbus IP or infrastructure. Open-source contributions on your own time don't need approval. [2]",
  "We're 8 people: 3 engineers, 1 designer, 2 sales, 1 ops, 1 founder. New hires get a buddy on Day 1 and aim for a merged PR by end of week 1. [1]",
  "PRs should stay under ~400 lines of diff and need one approval to merge. Reviewers respond within one business day. We use 'nit:' prefix for non-blocking suggestions. CI runs lint + typecheck + unit tests on every PR. [2]",
  "All major tools sit behind Okta SSO — AWS, Vercel, Supabase, GitHub, Linear. Request access in #ops; non-prod is usually granted within a business day. Production secrets require two-person approval and live in the team 1Password vault. [5]",
]

function pickReply(query: string, replies: string[]): string {
  // simple hash so the same query returns the same reply in a session
  let h = 0
  for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) >>> 0
  return replies[h % replies.length]
}

export async function* mockChatResponse(
  query: string,
  orgName?: string,
): AsyncGenerator<StreamEvent> {
  const replies = orgName === 'Nimbus Labs' ? NIMBUS_REPLIES : STRATOS_REPLIES
  const fullText = pickReply(query, replies)
  const words = fullText.split(' ')

  const INPUT_TOKENS = 350
  const OUTPUT_TOKENS = words.length * 3

  for (const word of words) {
    await new Promise<void>((resolve) => setTimeout(resolve, 35))
    yield { type: 'token', text: word + ' ' }
  }

  yield {
    type: 'done',
    usage: { input_tokens: INPUT_TOKENS, output_tokens: OUTPUT_TOKENS },
    stopReason: 'stop',
  }
}
