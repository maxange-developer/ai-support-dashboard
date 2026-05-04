'use client'

import { useState } from 'react'
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
      <div className="relative rounded-xl border border-neon-blue/30 bg-white/3">
        <pre className="overflow-x-auto p-4 pr-12 text-xs font-mono leading-relaxed text-neon-blue/80">
          <code>{snippet}</code>
        </pre>
        <button
          onClick={copy}
          aria-label="Copia snippet"
          className="absolute top-2 right-2 p-1.5 rounded-lg border border-white/15 bg-white/5 text-white/40 hover:text-neon-blue hover:border-neon-blue/40 transition-all"
        >
          {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
        </button>
      </div>
      <p className="text-xs text-white/35">
        Incolla questo tag nell'HTML del tuo sito, prima di{' '}
        <code className="font-mono text-neon-blue/60">&lt;/body&gt;</code>.
      </p>
    </div>
  )
}
