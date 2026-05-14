// Mock bypass helper — single source of truth for server-side
// code (Server Components, Server Actions, Route Handlers) to
// check whether the current request should bypass real Supabase
// auth.
//
// Two activation paths:
// 1. USE_MOCK_AUTH=true env (production demo deployment)
// 2. mock_bypass cookie (set when user clicks "Enter demo")

import { cookies } from 'next/headers'

export const DEMO_USER_ID = '00000000-0000-0000-0000-0000000000aa'
export const DEMO_USER_EMAIL = 'demo@example.com'

export type DemoPlan = 'free' | 'pro' | 'enterprise'

export interface DemoOrg {
  id: string
  name: string
  slug: string
  plan: DemoPlan
}

export const DEMO_ORG: DemoOrg = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Corp',
  slug: 'acme',
  plan: 'pro',
}

export const DEMO_ORGS_BY_SLUG: Record<string, DemoOrg> = {
  acme: DEMO_ORG,
  beta: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Beta SaaS',
    slug: 'beta',
    plan: 'free',
  },
}

export async function isMockMode(): Promise<boolean> {
  if (process.env.USE_MOCK_AUTH === 'true') return true
  const cookieStore = await cookies()
  return cookieStore.get('mock_bypass')?.value === 'true'
}

export function getDemoOrg(slug: string) {
  return DEMO_ORGS_BY_SLUG[slug] ?? null
}
