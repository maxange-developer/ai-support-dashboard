'use client'

import { useState, useActionState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Plus, Key, AlertCircle, Copy, Check, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ApiKeyListItem } from '@/lib/db/api-keys'

type CreateState = { rawKey: string } | { errorCode: string } | null
type DeleteState = { success: true } | { errorCode: string } | null

interface ApiKeyManagerProps {
  keys: ApiKeyListItem[]
  createAction: (prev: CreateState, formData: FormData) => Promise<CreateState>
  deleteAction: (prev: DeleteState, formData: FormData) => Promise<DeleteState>
}

export default function ApiKeyManager({ keys, createAction, deleteAction }: ApiKeyManagerProps) {
  const t = useTranslations('apiKeys')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [createState, createFormAction, isCreating] = useActionState(createAction, null)
  const [deleteState, deleteFormAction, isDeleting] = useActionState(deleteAction, null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // One-time amber disclosure box
  const [savedRawKey, setSavedRawKey] = useState<string | null>(null)
  const [showRawKey, setShowRawKey] = useState(false)
  const [rawKeyCopied, setRawKeyCopied] = useState(false)

  const [copied, setCopied] = useState<string | null>(null)

  const rawKey = createState && 'rawKey' in createState ? createState.rawKey : null
  const createErrorCode = createState && 'errorCode' in createState ? createState.errorCode : null
  const deleteErrorCode = deleteState && 'errorCode' in deleteState ? deleteState.errorCode : null

  useEffect(() => {
    if (rawKey) {
      setSavedRawKey(rawKey)
      setShowRawKey(false)
      setRawKeyCopied(false)
      toast.success(t('toastCreated'))
    }
  }, [rawKey, t])

  useEffect(() => {
    if (deleteState && 'success' in deleteState) {
      toast.success(t('toastDeleted'))
    }
  }, [deleteState, t])

  function copyRawKey() {
    if (!savedRawKey) return
    void navigator.clipboard.writeText(savedRawKey).then(() => {
      setRawKeyCopied(true)
      setTimeout(() => setRawKeyCopied(false), 2000)
    })
  }

  function dismissKey() {
    setSavedRawKey(null)
    setShowRawKey(false)
    setRawKeyCopied(false)
  }

  async function handleCopy(key: ApiKeyListItem) {
    const value = `sk-${key.id.slice(0, 8)}`
    await navigator.clipboard.writeText(value)
    setCopied(key.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const keyToDelete = keys.find((k) => k.id === pendingDeleteId)

  return (
    <div className="space-y-5">
      {savedRawKey && (
        <div className="border border-amber-500/30 bg-amber-500/8 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm font-medium text-amber-300">{t('savedKeyWarning')}</p>
            </div>
            <button
              onClick={dismissKey}
              aria-label={t('dismiss')}
              className="text-amber-400/60 hover:text-amber-400 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-black/40 px-3 py-2 border border-white/10 break-all select-all text-white/80">
              {showRawKey ? savedRawKey : '•'.repeat(Math.min(savedRawKey.length, 40))}
            </code>
            <button
              onClick={() => setShowRawKey((v) => !v)}
              aria-label={showRawKey ? t('hideKey') : t('showKey')}
              className="p-2 border border-white/20 bg-white/5 hover:border-neon-blue/40 hover:text-neon-blue text-white/50 transition-all shrink-0"
            >
              {showRawKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              onClick={copyRawKey}
              aria-label={t('copyKey')}
              className="p-2 border border-white/20 bg-white/5 hover:border-neon-blue/40 hover:text-neon-blue text-white/50 transition-all shrink-0"
            >
              {rawKeyCopied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}

      <form action={createFormAction} className="space-y-1.5" noValidate>
        <label htmlFor="key-name" className="text-xs font-medium text-white/50 uppercase tracking-wider">
          {t('newKey')}
        </label>
        <div className="flex items-center gap-2 w-full">
          <input
            id="key-name"
            name="name"
            placeholder={t('newKeyPlaceholder')}
            disabled={isCreating}
            className="flex-1 h-10 min-w-0 px-3 bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-blue transition-colors duration-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="h-10 px-4 border-2 border-neon-blue text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap relative overflow-hidden hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
            <Plus size={13} aria-hidden className="relative z-10" />
            <span className="relative z-10">{isCreating ? t('creating') : t('create')}</span>
          </button>
        </div>
      </form>
      {createErrorCode && (
        <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
          <AlertCircle size={14} className="shrink-0" aria-hidden />
          <p className="text-sm">{t(createErrorCode as 'errorCreate')}</p>
        </div>
      )}

      {keys.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-12 text-center">
          <Key size={28} className="text-white/30 mx-auto mb-4" aria-hidden />
          <p className="text-sm text-white/50 max-w-sm mx-auto">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => {
            const prefix = `sk-${key.id.slice(0, 8)}`
            const dateStr = key.last_used_at
              ? t('lastUsed', { date: new Date(key.last_used_at).toLocaleDateString(locale) })
              : t('createdOn', { date: new Date(key.created_at).toLocaleDateString(locale) })
            return (
              <div
                key={key.id}
                className="glass border-2 border-white/10 hover:border-neon-blue/30 transition-colors duration-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 shrink-0">
                  <p className="text-sm font-medium text-white truncate">{key.name ?? t('unnamed')}</p>
                  <p className="text-xs text-white/40 mt-0.5">{dateStr}</p>
                </div>

                <input
                  readOnly
                  type="text"
                  value={prefix}
                  className="flex-1 h-9 bg-white/5 border border-white/10 px-3 text-sm font-mono text-white/70 min-w-0 focus:outline-none select-all"
                  aria-label={t('copyPrefix')}
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleCopy(key)}
                    aria-label={t('copyPrefix')}
                    className="h-9 px-3 flex items-center gap-1.5 border border-neon-blue/40 text-white text-xs hover:bg-neon-blue/10 transition-all duration-200"
                  >
                    {copied === key.id
                      ? <><Check size={12} aria-hidden /> {tCommon('copied')}</>
                      : <><Copy size={12} aria-hidden /> {tCommon('copy')}</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(key.id)}
                    aria-label={tCommon('delete')}
                    className="h-9 w-9 flex items-center justify-center border border-red-500/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} aria-hidden />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {deleteErrorCode && (
        <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
          <AlertCircle size={14} className="shrink-0" aria-hidden />
          <p className="text-sm">{t(deleteErrorCode as 'errorDelete')}</p>
        </div>
      )}

      <Dialog open={!!pendingDeleteId} onOpenChange={(o) => { if (!o) setPendingDeleteId(null) }}>
        <DialogContent className="sm:max-w-md bg-black/95 border-white/15 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">{t('deleteDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50 mt-1">
            {t('deleteDialog.body', { name: keyToDelete?.name ?? t('unnamed') })}
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setPendingDeleteId(null)}
              className="h-9 px-4 border border-white/20 text-white/60 text-xs uppercase tracking-wider hover:text-white hover:border-white/40 transition-all"
            >
              {tCommon('cancel')}
            </button>
            {pendingDeleteId && (
              <form action={deleteFormAction} onSubmit={() => setPendingDeleteId(null)}>
                <input type="hidden" name="id" value={pendingDeleteId} />
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="h-9 px-5 bg-red-500 text-black font-semibold text-xs uppercase tracking-wider hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isDeleting ? t('deleteDialog.confirming') : t('deleteDialog.confirm')}
                </button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
