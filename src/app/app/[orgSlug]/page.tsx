import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, TrendingUp, DollarSign, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConversationStats, getCostStats, getTopQuestions } from '@/lib/db/analytics'
import CostChart from '@/components/dashboard/CostChart'
import { getTranslations } from 'next-intl/server'
import { getDemoOrg } from '@/lib/auth/mock-bypass'

type OrgRow = { id: string; name: string }

export default async function OrgHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params

  let org: OrgRow | undefined

  if (process.env.USE_MOCK_DATA === 'true') {
    org = getDemoOrg(orgSlug) ?? undefined
  } else {
    const supabase = await createClient()
    const { data: orgRows } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('slug', orgSlug)
      .limit(1)
      .returns<OrgRow[]>()
    org = orgRows?.[0]
  }

  if (!org) notFound()

  const admin = createAdminClient()
  const t = await getTranslations('dashboard')

  const [stats, costStats, topQuestions] = await Promise.all([
    getConversationStats(admin, org.id),
    getCostStats(admin, org.id),
    getTopQuestions(admin, org.id),
  ])

  const totalDollars = (costStats.totalCents / 100).toFixed(4)
  const avgDollars = (costStats.avgPerConvCents / 100).toFixed(4)

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {t('title')}<span className="text-neon-blue">.</span>
        </h1>
        <p className="text-sm text-white/60 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={t('stats.totalChats')}
          value={stats.total}
          icon={<MessageCircle size={16} aria-hidden />}
        />
        <StatCard
          title={t('stats.todayChats')}
          value={stats.today}
          sub={t('stats.todayChatsSub', { count: stats.week })}
          icon={<TrendingUp size={16} aria-hidden />}
        />
        <StatCard
          title={t('stats.totalCost')}
          value={`$${totalDollars}`}
          icon={<DollarSign size={16} aria-hidden />}
        />
        <StatCard
          title={t('stats.avgCost')}
          value={`$${avgDollars}`}
          icon={<BarChart2 size={16} aria-hidden />}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {t('costChartTitle')}
        </h2>
        <CostChart data={costStats.daily} />
      </section>

      {topQuestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            {t('topQuestionsTitle')}
          </h2>
          <div className="glass border-2 border-white/10 divide-y divide-white/8">
            {topQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                <span className="w-5 shrink-0 text-xs font-mono text-white/30 text-right">{i + 1}</span>
                <p className="flex-1 text-sm text-white/80 truncate">{q.content}</p>
                <span className="text-xs text-white shrink-0 font-mono">{q.count}×</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {topQuestions.length === 0 && stats.total === 0 && (
        <div className="glass border-2 border-white/10 p-8 text-center">
          <p className="text-white/40 text-sm">
            {t.rich('emptyState', {
              playgroundLink: (chunks) => (
                <Link href={`/app/${orgSlug}/playground`} className="text-white hover:text-white/70 transition-colors">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
}) {
  return (
    <div className="glass p-6 border-2 border-white/10 hover:border-neon-blue/30 transition-colors hover-lift">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-white/40 font-medium">{title}</p>
        <span className="text-white/60">{icon}</span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      {sub && <p className="text-xs text-white/35 mt-1">{sub}</p>}
    </div>
  )
}
