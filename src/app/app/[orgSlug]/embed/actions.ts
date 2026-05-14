'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createApiKey, deleteApiKey } from '@/lib/db/api-keys'
import { logger } from '@/lib/logger'
import { isMockMode } from '@/lib/auth/mock-bypass'

type CreateState = { rawKey: string } | { errorCode: string } | null
type DeleteState = { errorCode: string } | null

type MembershipRow = { org_id: string }
type OrgRow = { id: string }

async function resolveOrgId(orgSlug: string): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberRows } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = memberRows?.map((m) => m.org_id) ?? []
  if (!orgIds.length) return null

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  return orgRows?.[0]?.id ?? null
}

export async function createKeyAction(
  orgSlug: string,
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  if (!name) return { errorCode: 'errorRequired' }

  if (await isMockMode()) {
    revalidatePath(`/app/${orgSlug}/embed`)
    return { rawKey: `sk-demo-${randomBytes(16).toString('hex')}` }
  }

  const orgId = await resolveOrgId(orgSlug)
  if (!orgId) return { errorCode: 'errorUnauth' }

  try {
    const { rawKey } = await createApiKey(createAdminClient(), orgId, name)
    revalidatePath(`/app/${orgSlug}/embed`)
    return { rawKey }
  } catch (err) {
    logger.error('createApiKey failed', err)
    return { errorCode: 'errorCreate' }
  }
}

export async function deleteKeyAction(
  orgSlug: string,
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const id = formData.get('id') as string | null
  if (!id) return { errorCode: 'errorMissingId' }

  if (await isMockMode()) {
    revalidatePath(`/app/${orgSlug}/embed`)
    return null
  }

  const orgId = await resolveOrgId(orgSlug)
  if (!orgId) return { errorCode: 'errorUnauth' }

  try {
    await deleteApiKey(createAdminClient(), id, orgId)
    revalidatePath(`/app/${orgSlug}/embed`)
    return null
  } catch (err) {
    logger.error('deleteApiKey failed', err)
    return { errorCode: 'errorDelete' }
  }
}
