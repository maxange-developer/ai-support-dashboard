'use client'

import { useState, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6">
      {/* Raw key shown once after creation */}
      {rawKey && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Salva questa chiave — non sarà più mostrata.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-white dark:bg-black/30 rounded px-3 py-2 border break-all select-all">
              {rawKey}
            </code>
            <Button size="icon-sm" variant="outline" onClick={copyRawKey} aria-label="Copia chiave">
              {keyCopied ? <Check size={12} /> : <Copy size={12} />}
            </Button>
          </div>
        </div>
      )}

      {/* Create form */}
      <form action={createFormAction} className="flex gap-2 items-end">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="key-name">Nuova chiave API</Label>
          <Input
            id="key-name"
            name="name"
            placeholder="es. Sito principale"
            required
            disabled={isCreating}
          />
        </div>
        <Button type="submit" disabled={isCreating}>
          <Plus size={14} aria-hidden />
          {isCreating ? 'Creazione…' : 'Crea'}
        </Button>
      </form>
      {createError && <p className="text-sm text-destructive">{createError}</p>}

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center gap-2">
          <Key size={32} className="text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Nessuna chiave API. Creane una per iniziare.</p>
        </div>
      ) : (
        <div className="divide-y rounded-md border">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center gap-3 px-4 py-3">
              <Key size={14} className="text-muted-foreground shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{key.name ?? 'Senza nome'}</p>
                <p className="text-xs text-muted-foreground">
                  {key.last_used_at
                    ? `Usata il ${new Date(key.last_used_at).toLocaleDateString('it-IT')}`
                    : 'Mai usata'}
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px] hidden sm:flex shrink-0">
                {key.id.slice(0, 8)}…
              </Badge>
              <form action={deleteFormAction}>
                <input type="hidden" name="id" value={key.id} />
                <Button
                  type="submit"
                  size="icon-sm"
                  variant="ghost"
                  disabled={isDeleting}
                  aria-label={`Elimina chiave ${key.name ?? ''}`}
                >
                  <Trash2 size={13} className="text-destructive" aria-hidden />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
    </div>
  )
}
