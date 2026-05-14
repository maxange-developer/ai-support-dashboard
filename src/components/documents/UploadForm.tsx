'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Upload, AlertCircle, ArrowLeft, Paperclip } from 'lucide-react'
import type { DemoDoc } from '@/lib/demo-state/DemoStateProvider'
import type { SourceType } from '@/lib/ai/parsing'

type State = { success: true } | { errorCode: string } | null
type BoundAction = (prev: State, formData: FormData) => Promise<State>

interface Props {
  action: BoundAction
  onBack?: () => void
  onMockSuccess?: (doc: DemoDoc) => void
}

export default function UploadForm({ action, onBack, onMockSuccess }: Props) {
  const t = useTranslations('documents.upload')
  const tCommon = useTranslations('common')
  const [state, formAction, isPending] = useActionState(action, null)
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state && 'success' in state) {
      toast.success(t('toastSuccess'))
      if (onMockSuccess && pendingFile) {
        const ext = pendingFile.name.split('.').pop()?.toLowerCase() ?? ''
        const sourceType: SourceType =
          ext === 'pdf' ? 'pdf' : ext === 'md' ? 'markdown' : 'manual'
        onMockSuccess({
          id: crypto.randomUUID(),
          org_id: '',
          title: pendingFile.name.replace(/\.(pdf|md|txt)$/i, ''),
          source_type: sourceType,
          status: 'ready',
          created_at: new Date().toISOString(),
        })
      } else {
        onBack?.()
      }
    }
  }, [state, t, onBack, onMockSuccess, pendingFile])

  return (
    <form action={formAction} className="space-y-5 max-w-lg" noValidate>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          {t('fileLabel')}
        </label>

        {/* Hidden native input — programmatically triggered by button below */}
        <input
          ref={fileRef}
          id="file"
          name="file"
          type="file"
          accept=".pdf,.md,.txt"
          disabled={isPending}
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setPendingFile(f ? { name: f.name, type: f.type } : null)
          }}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileRef.current?.click()}
            className="h-10 px-4 flex items-center gap-2 border border-white/20 bg-white/5 text-white text-xs font-medium uppercase tracking-wider hover:border-neon-blue/50 hover:text-neon-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Paperclip size={13} aria-hidden />
            {t('chooseFile')}
          </button>
          <span className="flex-1 text-sm text-white/40 truncate">
            {pendingFile ? pendingFile.name : t('noFileSelected')}
          </span>
        </div>

        <p className="text-xs text-white/35">{t('fileHint')}</p>
      </div>

      {state && 'errorCode' in state && (
        <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
          <AlertCircle size={14} className="shrink-0" aria-hidden />
          <p className="text-sm">{t(state.errorCode as 'errorMissing')}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-10 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-sm relative overflow-hidden hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left motion-reduce:hidden" />
        <Upload size={15} aria-hidden className="relative z-10" />
        <span className="relative z-10">
          {isPending ? t('submitting') : t('submit')}
        </span>
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 border border-white/20 text-white/50 text-sm font-semibold uppercase tracking-wider hover:border-white hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} aria-hidden />
          {tCommon('back')}
        </button>
      )}
    </form>
  )
}
