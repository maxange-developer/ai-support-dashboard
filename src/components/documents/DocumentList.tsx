import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DocumentListItem } from '@/lib/db/documents'

const STATUS_MAP: Record<
  DocumentListItem['status'],
  { label: string; variant: 'secondary' | 'default' | 'destructive' }
> = {
  processing: { label: 'Elaborazione...', variant: 'secondary' },
  ready: { label: 'Pronto', variant: 'default' },
  error: { label: 'Errore', variant: 'destructive' },
}

const SOURCE_LABEL: Record<DocumentListItem['source_type'], string> = {
  pdf: 'PDF',
  markdown: 'Markdown',
  manual: 'Testo',
}

export default function DocumentList({ documents }: { documents: DocumentListItem[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText size={48} className="text-muted-foreground mb-4" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Nessun documento. Caricane uno per iniziare.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y rounded-md border">
      {documents.map((doc) => {
        const { label, variant } = STATUS_MAP[doc.status]
        return (
          <div key={doc.id} className="flex items-center gap-4 px-4 py-3">
            <FileText size={16} className="text-muted-foreground shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                {SOURCE_LABEL[doc.source_type]} ·{' '}
                {new Date(doc.created_at).toLocaleDateString('it-IT')}
              </p>
            </div>
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      })}
    </div>
  )
}
