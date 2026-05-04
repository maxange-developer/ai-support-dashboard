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
            Documenti<span className="text-neon-pink">.</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {documents.length} documento{documents.length !== 1 ? 'i' : ''} caricato{documents.length !== 1 ? 'i' : ''}
          </p>
        </div>
        <Link
          href={`/app/${orgSlug}/documents/new`}
          className="flex items-center gap-2 px-6 py-2.5 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-sm overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <Plus size={14} aria-hidden className="relative z-10" />
          <span className="relative z-10">Nuovo</span>
        </Link>
      </div>

      <DocumentList documents={documents} />
    </div>
  )
}
