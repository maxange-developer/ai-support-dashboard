'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface EmbedSnippetProps {
  snippet: string
  snippetHint?: string
  copyLabel?: string
}

export default function EmbedSnippet({ snippet, snippetHint, copyLabel }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-2">
      <div className="relative bg-white/5 border border-neon-blue/30 rounded-lg">
        <pre className="overflow-x-auto p-4 pr-12 text-sm font-mono leading-relaxed text-neon-green">
          <code>{snippet}</code>
        </pre>
        <button
          onClick={copy}
          aria-label={copyLabel ?? 'Copy snippet'}
          className="absolute top-2 right-2 p-1.5 border border-white/15 bg-white/5 text-white/40 hover:text-neon-blue hover:border-neon-blue/40 transition-all"
        >
          {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
        </button>
      </div>
      {snippetHint && (
        <p className="text-xs text-white/35">
          {snippetHint}{' '}
          <code className="font-mono text-neon-blue/60">&lt;/body&gt;</code>.
        </p>
      )}
    </div>
  )
}
