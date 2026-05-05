'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, Key, AlertCircle, Copy, Check, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ApiKeyListItem } from '@/lib/db/api-keys'

type CreateState = { rawKey: string } | { error: string } | null
type DeleteState = { error: string } | null

interface ApiKeyManagerProps {
  keys: ApiKeyListItem[]
  createAction: (prev: CreateState, formData: FormData) => Promise<CreateState>
  deleteAction: (prev: DeleteState, formData: FormData) => Promise<DeleteState>
}

export default function ApiKeyManager({ keys, createAction, deleteAction }: ApiKeyManagerProps) {
  const [createState, createFormAction, isCreating] = useActionState(createAction, null)
  const [deleteState, deleteFormAction, isDeleting] = useActionState(deleteAction, null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // One-time amber disclosure box
  const [savedRawKey, setSavedRawKey] = useState<string | null>(null)
  const [showRawKey, setShowRawKey] = useState(false)
  const [rawKeyCopied, setRawKeyCopied] = useState(false)

  // Per-key list controls
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const rawKey = createState && 'rawKey' in createState ? createState.rawKey : null
  const createError = createState && 'error' in createState ? createState.error : null
  const deleteError = deleteState && 'error' in deleteState ? deleteState.error : null

  useEffect(() => {
    if (rawKey) {
      setSavedRawKey(rawKey)
      setShowRawKey(false)
      setRawKeyCopied(false)
      toast.success('API key created', { description: "Copy and save the key — it won't be shown again." })
    }
  }, [rawKey])

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

  function toggleVisibility(id: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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
      {/* Raw key one-time disclosure */}
      {savedRawKey && (
        <div className="border border-amber-500/30 bg-amber-500/8 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm font-medium text-amber-300">Save this key — it won't be shown again.</p>
            </div>
            <button
              onClick={dismissKey}
              aria-label="Dismiss"
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
              aria-label={showRawKey ? 'Hide key' : 'Show key'}
              className="p-2 border border-white/20 bg-white/5 hover:border-neon-blue/40 hover:text-neon-blue text-white/50 transition-all shrink-0"
            >
              {showRawKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              onClick={copyRawKey}
              aria-label="Copy key"
              className="p-2 border border-white/20 bg-white/5 hover:border-neon-blue/40 hover:text-neon-blue text-white/50 transition-all shrink-0"
            >
              {rawKeyCopied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      <form action={createFormAction} className="flex items-center gap-2" noValidate>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="key-name" className="text-xs font-medium text-white/50 uppercase tracking-wider">
            New API Key
          </label>
          <input
            id="key-name"
            name="name"
            placeholder="e.g. Main website"
            disabled={isCreating}
            className="w-full h-10 px-3 bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-blue transition-colors duration-200 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="flex items-center gap-1.5 h-10 px-5 mt-[1.375rem] border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-xs overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <Plus size={13} aria-hidden className="relative z-10" />
          <span className="relative z-10">{isCreating ? 'Creating…' : 'Create'}</span>
        </button>
      </form>
      {createError && (
        <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
          <AlertCircle size={14} className="shrink-0" aria-hidden />
          <p className="text-sm">{createError}</p>
        </div>
      )}

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center gap-3">
          <Key size={28} className="text-white/20" aria-hidden />
          <p className="text-sm text-white/35">No API keys yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => {
            const isVisible = visibleKeys.has(key.id)
            const prefix = `sk-${key.id.slice(0, 8)}`
            return (
              <div
                key={key.id}
                className="glass rounded-lg border-2 border-white/10 hover:border-neon-blue/30 transition-colors duration-200 p-4 flex items-center justify-between gap-4"
              >
                {/* Left: name + date */}
                <div className="min-w-0 shrink-0">
                  <p className="text-sm font-medium text-white truncate">{key.name ?? 'Unnamed'}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {key.last_used_at
                      ? `Last used ${new Date(key.last_used_at).toLocaleDateString('en-GB')}`
                      : `Created ${new Date(key.created_at).toLocaleDateString('en-GB')}`}
                  </p>
                </div>

                {/* Centre: masked/visible input */}
                <input
                  readOnly
                  type={isVisible ? 'text' : 'password'}
                  value={prefix}
                  className="flex-1 h-9 bg-white/5 border border-white/10 px-3 text-sm font-mono text-white/70 min-w-0 focus:outline-none select-all"
                  aria-label="API key prefix"
                />

                {/* Right: eye + copy + delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleVisibility(key.id)}
                    aria-label={isVisible ? 'Hide key' : 'Show key prefix'}
                    className="h-9 w-9 flex items-center justify-center border border-white/20 text-white/40 hover:border-neon-blue hover:text-neon-blue transition-all duration-200"
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopy(key)}
                    aria-label="Copy key prefix"
                    className="h-9 px-3 flex items-center gap-1.5 border border-neon-blue/40 text-neon-blue text-xs hover:bg-neon-blue/10 transition-all duration-200"
                  >
                    {copied === key.id
                      ? <><Check size={12} aria-hidden /> Copied</>
                      : <><Copy size={12} aria-hidden /> Copy</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(key.id)}
                    aria-label={`Delete key ${key.name ?? ''}`}
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
      {deleteError && (
        <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
          <AlertCircle size={14} className="shrink-0" aria-hidden />
          <p className="text-sm">{deleteError}</p>
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!pendingDeleteId} onOpenChange={(o) => { if (!o) setPendingDeleteId(null) }}>
        <DialogContent className="sm:max-w-md bg-black/95 border-white/15 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Delete API key?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50 mt-1">
            Key <span className="font-semibold text-white">{keyToDelete?.name ?? 'Unnamed'}</span> will be permanently deleted.
            Any integrations using this key will stop working immediately.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setPendingDeleteId(null)}
              className="h-9 px-4 border border-white/20 text-white/60 text-xs uppercase tracking-wider hover:text-white hover:border-white/40 transition-all"
            >
              Cancel
            </button>
            {pendingDeleteId && (
              <form action={deleteFormAction} onSubmit={() => setPendingDeleteId(null)}>
                <input type="hidden" name="id" value={pendingDeleteId} />
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="h-9 px-5 bg-red-500 text-black font-semibold text-xs uppercase tracking-wider hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
