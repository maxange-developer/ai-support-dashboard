import { uploadDocument } from '../actions'
import UploadForm from '@/components/documents/UploadForm'
import { getTranslations } from 'next-intl/server'

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const boundAction = uploadDocument.bind(null, orgSlug)
  const t = await getTranslations('documents.upload')

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <UploadForm action={boundAction} />
    </div>
  )
}
