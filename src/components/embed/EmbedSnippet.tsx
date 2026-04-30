'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export default function EmbedSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-md border bg-muted">
        <pre className="overflow-x-auto p-4 pr-12 text-xs font-mono leading-relaxed">
          <code>{snippet}</code>
        </pre>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={copy}
          aria-label="Copia snippet"
          className="absolute top-2 right-2"
        >
          {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Incolla questo tag nell'HTML del tuo sito, prima di{' '}
        <code className="font-mono">&lt;/body&gt;</code>.
      </p>
    </div>
  )
}
