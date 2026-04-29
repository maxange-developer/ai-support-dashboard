import { uploadDocument } from '../actions'
import UploadForm from '@/components/documents/UploadForm'

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const boundAction = uploadDocument.bind(null, orgSlug)

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Carica documento</h1>
      <UploadForm action={boundAction} />
    </div>
  )
}
