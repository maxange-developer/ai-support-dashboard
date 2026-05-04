'use client'

import { useState, useActionState } from 'react'
import { Trash2, Plus, Key, AlertCircle, Copy, Check } from 'lucide-react'
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
  const [keyCopied, setKeyCopied] = useState(false)

  const rawKey = createState && 'rawKey' in createState ? createState.rawKey : null
  const createError = createState && 'error' in createState ? createState.error : null
  const deleteError = deleteState && 'error' in deleteState ? deleteState.error : null

  function copyRawKey() {
    if (!rawKey) return
    void navigator.clipboard.writeText(rawKey).then(() => {
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-5">
      {/* Raw key shown once */}
      {rawKey && (
        <div className="border border-amber-500/30 bg-amber-500/8 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm font-medium text-amber-300">Salva questa chiave — non sarà più mostrata.</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-black/40 px-3 py-2 border border-white/10 break-all select-all text-white/80">
              {rawKey}
            </code>
            <button
              onClick={copyRawKey}
              aria-label="Copia chiave"
              className="p-2 border border-white/20 bg-white/5 hover:border-neon-blue/40 hover:text-neon-blue text-white/50 transition-all"
            >
              {keyCopied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      <form action={createFormAction} className="flex gap-2 items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="key-name" className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Nuova chiave API
          </label>
          <input
            id="key-name"
            name="name"
            placeholder="es. Sito principale"
            required
            disabled={isCreating}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-blue transition-colors duration-200 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="flex items-center gap-1.5 px-5 py-2.5 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-xs overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <Plus size={13} aria-hidden className="relative z-10" />
          <span className="relative z-10">{isCreating ? 'Creazione…' : 'Crea'}</span>
        </button>
      </form>
      {createError && <p className="text-sm text-red-400">{createError}</p>}

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center gap-3">
          <Key size={28} className="text-white/20" aria-hidden />
          <p className="text-sm text-white/35">Nessuna chiave API. Creane una per iniziare.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="glass rounded-lg border-2 border-white/10 hover:border-neon-blue/30 hover-lift transition-all duration-200 flex items-center gap-3 px-4 py-3"
            >
              <Key size={13} className="text-neon-blue/50 shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{key.name ?? 'Senza nome'}</p>
                <p className="text-xs text-white/35">
                  {key.last_used_at
                    ? `Usata il ${new Date(key.last_used_at).toLocaleDateString('it-IT')}`
                    : 'Mai usata'}
                </p>
              </div>
              <span className="font-mono text-[10px] text-white/25 hidden sm:block shrink-0">
                {key.id.slice(0, 8)}…
              </span>
              <form action={deleteFormAction}>
                <input type="hidden" name="id" value={key.id} />
                <button
                  type="submit"
                  disabled={isDeleting}
                  aria-label={`Elimina chiave ${key.name ?? ''}`}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                >
                  <Trash2 size={13} aria-hidden />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
      {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
    </div>
  )
}
