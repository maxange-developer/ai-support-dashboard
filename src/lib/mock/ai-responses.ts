import type { StreamEvent } from '@/lib/ai/chat'

const MOCK_REPLIES = [
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

function pickReply(query: string): string {
  // simple hash so the same query returns the same reply in a session
  let h = 0
  for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) >>> 0
  return MOCK_REPLIES[h % MOCK_REPLIES.length]
}

export async function* mockChatResponse(query: string): AsyncGenerator<StreamEvent> {
  const fullText = pickReply(query)
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
