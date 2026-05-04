import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDocumentsByOrg } from '@/lib/db/documents'
import DocumentList from '@/components/documents/DocumentList'

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

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold neon-text" style={{ fontSize: 'var(--fs-page)' }}>
            Documenti
          </h1>
          <p className="text-white/40 text-sm mt-1">{documents.length} documento{documents.length !== 1 ? 'i' : ''} caricato{documents.length !== 1 ? 'i' : ''}</p>
        </div>
        <Link
          href={`/app/${orgSlug}/documents/new`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-blue text-black font-semibold text-sm hover:bg-neon-blue/80 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-200"
        >
          <Plus size={15} aria-hidden />
          Nuovo documento
        </Link>
      </div>

      <DocumentList documents={documents} />
    </div>
  )
}
