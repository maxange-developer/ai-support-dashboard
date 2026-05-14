import { getTranslations } from 'next-intl/server'

type Plan = 'free' | 'pro' | 'enterprise'

const STYLES: Record<Plan, string> = {
  free: 'bg-white/5 text-white/70 border-white/15',
  pro: 'bg-blue-600/15 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(37,99,235,0.25)]',
  enterprise: 'bg-fuchsia-600/15 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.25)]',
}

export async function PlanBadge({ plan }: { plan: Plan }) {
  const t = await getTranslations('settings.plans')
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider ${STYLES[plan]}`}
    >
      {t(plan)}
    </span>
  )
}
