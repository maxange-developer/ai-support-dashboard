import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDocumentsByOrg } from '@/lib/db/documents'
import { uploadDocument, deleteDocumentsAction } from './actions'
import DocumentsView from '@/components/documents/DocumentsView'
import { getTranslations } from 'next-intl/server'
import { isMockMode, getDemoOrg } from '@/lib/auth/mock-bypass'

type OrgRow = { id: string }

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const t = await getTranslations('documents')

  const mock = await isMockMode()

  let orgId: string

  if (mock) {
    const demoOrg = getDemoOrg(orgSlug)
    if (!demoOrg) notFound()
    orgId = demoOrg.id
  } else {
    const supabase = await createClient()
    const { data: orgRows } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .returns<OrgRow[]>()
    const org = orgRows?.[0]
    if (!org) notFound()
    orgId = org.id
  }

  const supabaseRead = await createClient()
  const documents = await getDocumentsByOrg(supabaseRead, orgId)
  const boundDelete = deleteDocumentsAction.bind(null, orgSlug, orgId)
  const boundUpload = uploadDocument.bind(null, orgSlug)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {t('title')}<span className="text-neon-blue">.</span>
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {documents.length === 1
            ? t('subtitleSingular', { count: documents.length })
            : t('subtitlePlural', { count: documents.length })}
        </p>
      </div>
      <DocumentsView documents={documents} orgSlug={orgSlug} deleteAction={boundDelete} uploadAction={boundUpload} />
    </div>
  )
}
