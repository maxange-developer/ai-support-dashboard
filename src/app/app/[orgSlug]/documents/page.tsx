import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDocumentsByOrg } from '@/lib/db/documents'
import DocumentList from '@/components/documents/DocumentList'
import { buttonVariants } from '@/components/ui/button'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documenti</h1>
        <Link href={`/app/${orgSlug}/documents/new`} className={buttonVariants()}>
          <Plus size={16} className="mr-2" aria-hidden />
          Nuovo documento
        </Link>
      </div>
      <DocumentList documents={documents} />
    </div>
  )
}
