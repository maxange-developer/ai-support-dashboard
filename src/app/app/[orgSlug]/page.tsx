import { notFound } from 'next/navigation'
import { MessageCircle, TrendingUp, DollarSign, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConversationStats, getCostStats, getTopQuestions } from '@/lib/db/analytics'
import CostChart from '@/components/dashboard/CostChart'
import { getTranslations } from 'next-intl/server'

type OrgRow = { id: string; name: string }

export default async function OrgHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .limit(1)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
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
        <h1 className="font-bold text-neon-blue" style={{ fontSize: 'var(--fs-page)' }}>
          {t('title')}<span className="text-neon-pink">.</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Overview of conversations and AI costs</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total conversations"
          value={stats.total}
          icon={<MessageCircle size={16} aria-hidden />}
        />
        <StatCard
          title="Today's conversations"
          value={stats.today}
          sub={`${stats.week} in the last 7 days`}
          icon={<TrendingUp size={16} aria-hidden />}
        />
        <StatCard
          title="Total cost"
          value={`$${totalDollars}`}
          icon={<DollarSign size={16} aria-hidden />}
        />
        <StatCard
          title="Avg cost / conversation"
          value={`$${avgDollars}`}
          icon={<BarChart2 size={16} aria-hidden />}
        />
      </div>

      {/* Cost chart */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Cost — last 7 days
        </h2>
        <CostChart data={costStats.daily} />
      </section>

      {/* Top questions */}
      {topQuestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Top questions
          </h2>
          <div className="glass rounded-lg border-2 border-white/10 divide-y divide-white/8">
            {topQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                <span className="w-5 shrink-0 text-xs font-mono text-white/30 text-right">{i + 1}</span>
                <p className="flex-1 text-sm text-white/80 truncate">{q.content}</p>
                <span className="text-xs text-neon-blue shrink-0 font-mono">{q.count}×</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {topQuestions.length === 0 && stats.total === 0 && (
        <div className="glass rounded-lg border-2 border-white/10 p-8 text-center">
          <p className="text-white/40 text-sm">
            No conversations yet. Use the{' '}
            <a href={`/app/${orgSlug}/playground`} className="text-neon-blue hover:text-neon-blue/70 transition-colors">
              playground
            </a>{' '}
            or embed the widget to get started.
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
    <div className="glass rounded-lg p-6 border-2 border-white/10 hover:border-neon-blue/30 transition-colors hover-lift">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-white/40 font-medium">{title}</p>
        <span className="text-neon-blue/60">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-neon-blue">{value}</p>
      {sub && <p className="text-xs text-white/35 mt-1">{sub}</p>}
    </div>
  )
}
