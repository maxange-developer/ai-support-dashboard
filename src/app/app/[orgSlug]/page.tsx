import { notFound } from 'next/navigation'
import { MessageCircle, TrendingUp, DollarSign, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConversationStats, getCostStats, getTopQuestions } from '@/lib/db/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CostChart from '@/components/dashboard/CostChart'

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

  const [stats, costStats, topQuestions] = await Promise.all([
    getConversationStats(admin, org.id),
    getCostStats(admin, org.id),
    getTopQuestions(admin, org.id),
  ])

  const totalDollars = (costStats.totalCents / 100).toFixed(4)
  const avgDollars = (costStats.avgPerConvCents / 100).toFixed(4)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 2×2 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Conversazioni totali"
          value={stats.total}
          icon={<MessageCircle size={15} aria-hidden />}
        />
        <StatCard
          title="Conversazioni oggi"
          value={stats.today}
          sub={`${stats.week} negli ultimi 7 giorni`}
          icon={<TrendingUp size={15} aria-hidden />}
        />
        <StatCard
          title="Costo totale"
          value={`$${totalDollars}`}
          icon={<DollarSign size={15} aria-hidden />}
        />
        <StatCard
          title="Costo medio / conversazione"
          value={`$${avgDollars}`}
          icon={<BarChart2 size={15} aria-hidden />}
        />
      </div>

      {/* Cost chart */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Costo ultimi 7 giorni</h2>
        <CostChart data={costStats.daily} />
      </section>

      {/* Top questions */}
      {topQuestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Domande più frequenti</h2>
          <div className="rounded-md border divide-y">
            {topQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-5 shrink-0 text-xs font-mono text-muted-foreground text-right">
                  {i + 1}
                </span>
                <p className="flex-1 text-sm truncate">{q.content}</p>
                <span className="text-xs text-muted-foreground shrink-0">{q.count}×</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {topQuestions.length === 0 && stats.total === 0 && (
        <p className="text-sm text-muted-foreground">
          Nessuna conversazione ancora. Usa il{' '}
          <a href={`/app/${orgSlug}/playground`} className="underline underline-offset-2">
            playground
          </a>{' '}
          o incorpora il widget per iniziare.
        </p>
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
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}
