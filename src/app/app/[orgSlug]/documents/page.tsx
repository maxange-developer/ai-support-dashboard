import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDocumentsByOrg } from '@/lib/db/documents'
import { deleteDocumentsAction } from './actions'
import DocumentsView from '@/components/documents/DocumentsView'

type OrgRow = { id: string }

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) notFound()

  const documents = await getDocumentsByOrg(supabase, org.id)
  const boundDelete = deleteDocumentsAction.bind(null, orgSlug, org.id)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-bold neon-text" style={{ fontSize: 'var(--fs-page)' }}>
          Documents<span className="text-neon-pink">.</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>
      <DocumentsView documents={documents} orgSlug={orgSlug} deleteAction={boundDelete} />
    </div>
  )
}
