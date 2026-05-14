'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FileText, Plus, Trash2, X, CheckSquare, Square, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { DocumentListItem } from '@/lib/db/documents'
import UploadForm from './UploadForm'

const STATUS_CLS: Record<DocumentListItem['status'], string> = {
  processing: 'bg-neon-blue/10 text-white border border-neon-blue/30 animate-pulse',
  ready: 'bg-neon-green/10 text-neon-green border border-neon-green/30',
  error: 'bg-red-500/10 text-red-400 border border-red-400/30',
}

type UploadState = { errorCode: string } | null

interface Props {
  documents: DocumentListItem[]
  orgSlug: string
  deleteAction: (ids: string[]) => Promise<{ errorCode?: string }>
  uploadAction: (prev: UploadState, formData: FormData) => Promise<UploadState>
}

export default function DocumentsView({ documents, deleteAction, uploadAction }: Props) {
  const router = useRouter()
  const t = useTranslations('documents')
  const tCommon = useTranslations('common')
  const [view, setView] = useState<'list' | 'upload'>('list')
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteErrorCode, setDeleteErrorCode] = useState<string | null>(null)

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
    setDeleteErrorCode(null)
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true)
    setDeleteErrorCode(null)
    const result = await deleteAction(Array.from(selected))
    setIsDeleting(false)
    if (result.errorCode) {
      setDeleteErrorCode(result.errorCode)
    } else {
      setConfirmOpen(false)
      cancelSelection()
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {selecting ? (
        <div className="flex items-center justify-between glass border border-white/10  px-4 py-3">
          <span className="text-white/60 text-sm">{t('selected', { count: selected.size })}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={cancelSelection}
              className="h-9 px-4 border border-white/30 text-white/60 text-xs font-semibold uppercase tracking-wider hover:border-white hover:text-white transition-all duration-200 flex items-center gap-2"
            >
              <X size={14} aria-hidden /> {tCommon('cancel')}
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={selected.size === 0}
              className="h-9 px-4 border-2 border-red-500 text-red-400 text-xs font-semibold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} aria-hidden /> {t('deleteSelected', { count: selected.size })}
            </button>
          </div>
        </div>
      ) : view === 'list' ? (
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setView('upload')}
            className="h-9 px-4 border-2 border-neon-blue text-white text-xs font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black motion-reduce:hover:text-white transition-all duration-300 group shrink-0"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={14} aria-hidden /> {t('newDocument')}
            </span>
            <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left motion-reduce:hidden" />
          </button>
          <button
            onClick={() => setSelecting(true)}
            disabled={documents.length === 0}
            className="h-9 px-4 border-2 border-red-500/60 text-red-400 text-xs font-semibold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all duration-300 shrink-0 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} aria-hidden /> {tCommon('delete')}
          </button>
        </div>
      ) : null}

      {view === 'upload' ? (
        <UploadForm action={uploadAction} onBack={() => setView('list')} />
      ) : (
        <div className="flex flex-col">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass  border-2 border-white/10">
              <FileText size={40} className="text-white/20 mb-4" aria-hidden />
              <p className="text-sm text-white/40">{t('emptyState')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const cls = STATUS_CLS[doc.status]
                const statusLabel = t(`status.${doc.status}`)
                const sourceLabel = t(`source.${doc.source_type}`)
                const isSelected = selected.has(doc.id)
                return (
                  <div
                    key={doc.id}
                    onClick={selecting ? () => toggleSelect(doc.id) : undefined}
                    className={cn(
                      'glass  border-2 transition-colors duration-300 flex items-center gap-4 px-4 py-3',
                      selecting ? 'cursor-pointer' : 'hover-lift',
                      isSelected
                        ? 'border-neon-blue/60 bg-neon-blue/5'
                        : selecting
                        ? 'border-white/10 hover:border-neon-blue/30'
                        : 'border-white/10 hover:border-neon-blue/50',
                    )}
                  >
                    {selecting && (
                      <span className="shrink-0 text-white/70">
                        {isSelected
                          ? <CheckSquare size={15} aria-hidden />
                          : <Square size={15} aria-hidden />}
                      </span>
                    )}
                    <FileText size={16} className="text-white/50 shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{doc.title}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {sourceLabel} · {new Date(doc.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 shrink-0 ${cls}`}>
                      {statusLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o && !isDeleting) setConfirmOpen(false) }}>
        <DialogContent className="sm:max-w-md bg-black/95 border-white/15 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selected.size === 1
                ? t('deleteDialog.titleSingular')
                : t('deleteDialog.titlePlural', { count: selected.size })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50 mt-1">
            {t('deleteDialog.body')}
          </p>
          {deleteErrorCode && (
            <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400 mt-2">
              <AlertCircle size={14} className="shrink-0" aria-hidden />
              <p className="text-sm">{t('deleteDialog.error')}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
              className="h-9 px-4 border border-white/20 text-white/60 text-xs uppercase tracking-wider hover:text-white hover:border-white/40 transition-all disabled:opacity-40"
            >
              {t('deleteDialog.cancel')}
            </button>
            <button
              onClick={() => void handleDeleteConfirm()}
              disabled={isDeleting}
              className="h-9 px-5 bg-red-500 text-black font-semibold text-xs uppercase tracking-wider hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDeleting ? t('deleteDialog.confirming') : t('deleteDialog.confirm')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
