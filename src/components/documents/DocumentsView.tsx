'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2, X, CheckSquare, Square } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { DocumentListItem } from '@/lib/db/documents'

const STATUS_STYLES: Record<DocumentListItem['status'], { label: string; cls: string }> = {
  processing: { label: 'Processing…', cls: 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30 animate-pulse' },
  ready: { label: 'Ready', cls: 'bg-neon-green/10 text-neon-green border border-neon-green/30' },
  error: { label: 'Error', cls: 'bg-red-500/10 text-red-400 border border-red-400/30' },
}

const SOURCE_LABEL: Record<DocumentListItem['source_type'], string> = {
  pdf: 'PDF',
  markdown: 'Markdown',
  manual: 'Text',
}

interface Props {
  documents: DocumentListItem[]
  orgSlug: string
  deleteAction: (ids: string[]) => Promise<{ error?: string }>
}

export default function DocumentsView({ documents, orgSlug, deleteAction }: Props) {
  const router = useRouter()
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function cancelSelection() {
    setSelecting(false)
    setSelected(new Set())
    setDeleteError(null)
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteAction(Array.from(selected))
    setIsDeleting(false)
    if (result.error) {
      setDeleteError(result.error)
    } else {
      setConfirmOpen(false)
      cancelSelection()
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-3 justify-end">
        <Link
          href={`/app/${orgSlug}/documents/new`}
          className="flex items-center gap-2 h-10 px-5 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-xs overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group shrink-0"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <Plus size={13} aria-hidden className="relative z-10" />
          <span className="relative z-10">New Document</span>
        </Link>

        {documents.length > 0 && !selecting && (
          <button
            onClick={() => setSelecting(true)}
            className="flex items-center gap-2 h-10 px-5 border-2 border-red-500 text-red-400 font-semibold uppercase tracking-wider text-xs overflow-hidden relative hover:text-black motion-reduce:hover:text-red-400 transition-all duration-300 group shrink-0"
          >
            <span className="absolute inset-0 bg-red-500 transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
            <Trash2 size={13} aria-hidden className="relative z-10" />
            <span className="relative z-10">Delete</span>
          </button>
        )}
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-lg border-2 border-white/10">
          <FileText size={40} className="text-white/20 mb-4" aria-hidden />
          <p className="text-sm text-white/40">No documents yet. Upload one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const { label, cls } = STATUS_STYLES[doc.status]
            const isSelected = selected.has(doc.id)
            return (
              <div
                key={doc.id}
                onClick={selecting ? () => toggleSelect(doc.id) : undefined}
                className={cn(
                  'glass rounded-lg border-2 transition-colors duration-300 flex items-center gap-4 px-4 py-3',
                  selecting ? 'cursor-pointer' : 'hover-lift',
                  isSelected
                    ? 'border-neon-blue/60 bg-neon-blue/5'
                    : selecting
                    ? 'border-white/10 hover:border-neon-blue/30'
                    : 'border-white/10 hover:border-neon-blue/50',
                )}
              >
                {selecting && (
                  <span className="shrink-0 text-neon-blue/70">
                    {isSelected
                      ? <CheckSquare size={15} aria-hidden />
                      : <Square size={15} aria-hidden />}
                  </span>
                )}
                <FileText size={16} className="text-neon-blue/50 shrink-0" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{doc.title}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {SOURCE_LABEL[doc.source_type]} · {new Date(doc.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 shrink-0 ${cls}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Selection footer */}
      {selecting && (
        <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/10 px-6 py-4 flex items-center gap-4 md:left-60">
          <p className="flex-1 text-sm text-white/70 font-medium">
            {selected.size} selected
          </p>
          <button
            onClick={cancelSelection}
            className="flex items-center gap-1.5 h-9 px-4 border border-white/30 text-white/60 text-xs uppercase tracking-wider hover:text-white hover:border-white/50 transition-all"
          >
            <X size={12} aria-hidden />
            Cancel
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 h-9 px-4 bg-red-500 text-black font-semibold text-xs uppercase tracking-wider hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={12} aria-hidden />
            Delete Selected
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o && !isDeleting) setConfirmOpen(false) }}>
        <DialogContent className="sm:max-w-md bg-black/95 border-white/15 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Delete {selected.size} document{selected.size !== 1 ? 's' : ''}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50 mt-1">
            This action cannot be undone. All chunks and embeddings will be permanently removed.
          </p>
          {deleteError && <p className="text-sm text-red-400 mt-2">{deleteError}</p>}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
              className="h-9 px-4 border border-white/20 text-white/60 text-xs uppercase tracking-wider hover:text-white hover:border-white/40 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleDeleteConfirm()}
              disabled={isDeleting}
              className="h-9 px-5 bg-red-500 text-black font-semibold text-xs uppercase tracking-wider hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
