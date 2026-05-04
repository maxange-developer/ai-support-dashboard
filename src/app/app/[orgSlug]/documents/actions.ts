'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateUploadFile } from '@/lib/validations/document'
import { parseFile } from '@/lib/ai/parsing'
import { chunkText } from '@/lib/ai/chunking'
import { embedBatch } from '@/lib/ai/embeddings'
import { insertDocument, updateDocumentStatus, insertChunks, deleteDocumentsFromDB } from '@/lib/db/documents'
import { logger } from '@/lib/logger'

type State = { error: string } | null
type MembershipRow = { org_id: string }
type OrgRow = { id: string }

export async function uploadDocument(
  orgSlug: string,
  _prev: State,
  formData: FormData,
): Promise<State> {
  // 1. validate file
  const file = formData.get('file')
  const validationError = validateUploadFile(file)
  if (validationError) return validationError
  const validFile = file as File

  // 2. auth + membership check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autenticato' }

  const { data: membershipData } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = membershipData?.map((m) => m.org_id) ?? []
  if (orgIds.length === 0) return { error: 'Nessuna organizzazione trovata' }

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) return { error: 'Organizzazione non trovata' }

  // 3. read buffer
  const buffer = await validFile.arrayBuffer()

  // 4. storage upload — service role: bypasses storage RLS
  const admin = createAdminClient()
  const storageKey = `${org.id}/${Date.now()}-${validFile.name}`
  const { error: storageError } = await admin.storage
    .from('documents')
    .upload(storageKey, validFile)

  if (storageError) {
    logger.error('storage upload failed', storageError.message)
    return { error: `Upload fallito: ${storageError.message}` }
  }

  // 5. parse
  let parsed: Awaited<ReturnType<typeof parseFile>>
  try {
    parsed = await parseFile(buffer, validFile.name)
  } catch (err) {
    logger.error('parseFile failed', err)
    return { error: 'Errore nel parsing del file' }
  }

  // 6. insert document (status defaults to 'processing')
  let docId: string
  try {
    docId = await insertDocument(admin, {
      org_id: org.id,
      title: parsed.title,
      content: parsed.content,
      source_type: parsed.sourceType,
    })
  } catch (err) {
    logger.error('insertDocument failed', err)
    return { error: 'Errore durante il salvataggio del documento' }
  }

  // 7–9. chunk → embed → insertChunks; mark error on failure
  try {
    const chunks = chunkText(parsed.content)
    const embeddings = await embedBatch(chunks.map((c) => c.content))
    await insertChunks(
      admin,
      chunks.map((chunk, i) => ({
        document_id: docId,
        org_id: org.id,
        content: chunk.content,
        embedding: embeddings[i],
        chunk_index: chunk.chunkIndex,
      })),
    )
  } catch (err) {
    logger.error('embedding/chunks failed', err)
    await updateDocumentStatus(admin, docId, 'error').catch(() => undefined)
    return { error: 'Errore durante la generazione degli embedding' }
  }

  // 10. mark ready + revalidate + redirect
  await updateDocumentStatus(admin, docId, 'ready')
  revalidatePath(`/app/${orgSlug}/documents`)
  redirect(`/app/${orgSlug}/documents`)
}

export async function deleteDocumentsAction(
  orgSlug: string,
  orgId: string,
  ids: string[],
): Promise<{ error?: string }> {
  if (ids.length === 0) return {}

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: membershipData } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .returns<MembershipRow[]>()

  if (!membershipData || membershipData.length === 0) return { error: 'Access denied' }

  const admin = createAdminClient()
  try {
    await deleteDocumentsFromDB(admin, ids, orgId)
  } catch (err) {
    logger.error('deleteDocumentsAction failed', err)
    return { error: 'Failed to delete documents' }
  }

  revalidatePath(`/app/${orgSlug}/documents`)
  return {}
}
