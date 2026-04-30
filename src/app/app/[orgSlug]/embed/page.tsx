import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listApiKeys } from '@/lib/db/api-keys'
import { createKeyAction, deleteKeyAction } from './actions'
import ApiKeyManager from '@/components/embed/ApiKeyManager'
import EmbedSnippet from '@/components/embed/EmbedSnippet'

type MembershipRow = { org_id: string }
type OrgRow = { id: string; slug: string }

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: memberRows } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = memberRows?.map((m) => m.org_id) ?? []

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id, slug')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) notFound()

  const keys = await listApiKeys(createAdminClient(), org.id)

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const snippet = `<script src="${appUrl}/api/embed/${orgSlug}/script.js?apiKey=YOUR_API_KEY"></script>`

  const boundCreate = createKeyAction.bind(null, orgSlug)
  const boundDelete = deleteKeyAction.bind(null, orgSlug)

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Widget da incorporare</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Crea una chiave API, copia lo snippet e incollalo nel tuo sito.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Chiavi API</h2>
        <ApiKeyManager keys={keys} createAction={boundCreate} deleteAction={boundDelete} />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Codice da incorporare</h2>
        <p className="text-sm text-muted-foreground">
          Sostituisci <code className="font-mono text-xs bg-muted px-1 rounded">YOUR_API_KEY</code>{' '}
          con la chiave creata sopra.
        </p>
        <EmbedSnippet snippet={snippet} />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Anteprima widget</h2>
        <div className="rounded-lg border overflow-hidden h-[500px]">
          <iframe
            src={`/widget/${orgSlug}`}
            className="w-full h-full"
            title="Anteprima widget chat"
          />
        </div>
      </section>
    </div>
  )
}
