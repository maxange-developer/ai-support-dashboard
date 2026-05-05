'use client'

import { useActionState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'

type State = { error: string } | null
type BoundAction = (prev: State, formData: FormData) => Promise<State>

export default function UploadForm({ action }: { action: BoundAction }) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5 max-w-lg" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="file" className="text-xs font-medium text-white/50 uppercase tracking-wider">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.md,.txt"
          disabled={isPending}
          className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm
                     file:mr-4 file:py-1 file:px-3 file:border-0
                     file:bg-neon-blue/10 file:text-neon-blue
                     file:text-xs file:font-medium file:uppercase file:tracking-wider
                     focus:outline-none focus:border-neon-blue transition-colors duration-200
                     disabled:opacity-50 cursor-pointer"
        />
        <p className="text-xs text-white/35">PDF, Markdown or plain text · max 10 MB</p>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
          <AlertCircle size={14} className="shrink-0" aria-hidden />
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-10 border-2 border-neon-blue text-white font-semibold uppercase
                   tracking-wider text-sm relative overflow-hidden hover:text-black
                   motion-reduce:hover:text-white transition-all duration-300 group
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100
                         transition-transform duration-300 origin-left motion-reduce:hidden" />
        <Upload size={15} aria-hidden className="relative z-10" />
        <span className="relative z-10">
          {isPending ? 'Uploading…' : 'Upload Document'}
        </span>
      </button>
    </form>
  )
}
