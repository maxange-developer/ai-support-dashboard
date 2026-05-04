import { FileText } from 'lucide-react'
import type { DocumentListItem } from '@/lib/db/documents'

const STATUS_STYLES: Record<DocumentListItem['status'], { label: string; cls: string }> = {
  processing: { label: 'Elaborazione…', cls: 'text-neon-blue border-neon-blue/40 bg-neon-blue/8 animate-pulse' },
  ready: { label: 'Pronto', cls: 'text-neon-green border-neon-green/40 bg-neon-green/8' },
  error: { label: 'Errore', cls: 'text-red-400 border-red-500/40 bg-red-500/8' },
}

const SOURCE_LABEL: Record<DocumentListItem['source_type'], string> = {
  pdf: 'PDF',
  markdown: 'Markdown',
  manual: 'Testo',
}

export default function DocumentList({ documents }: { documents: DocumentListItem[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-xl border border-white/10">
        <FileText size={40} className="text-white/20 mb-4" aria-hidden />
        <p className="text-sm text-white/40">Nessun documento. Caricane uno per iniziare.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const { label, cls } = STATUS_STYLES[doc.status]
        return (
          <div
            key={doc.id}
            className="glass rounded-xl border border-white/10 flex items-center gap-4 px-4 py-3 hover-lift hover:border-neon-blue/20 transition-all duration-200"
          >
            <FileText size={16} className="text-neon-blue/50 shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{doc.title}</p>
              <p className="text-xs text-white/35 mt-0.5">
                {SOURCE_LABEL[doc.source_type]} · {new Date(doc.created_at).toLocaleDateString('it-IT')}
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cls} shrink-0`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
