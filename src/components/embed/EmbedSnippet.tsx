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
    <div className="space-y-3">
      <div className="relative bg-white/5 border border-neon-blue/30">
        <pre className="overflow-x-auto p-4 pr-14 text-sm font-mono leading-relaxed text-neon-green">
          <code>{snippet}</code>
        </pre>
        <button
          onClick={copy}
          aria-label={copyLabel ?? 'Copy snippet'}
          className="absolute top-2 right-2 flex items-center gap-1 h-8 px-2.5 border-2 border-neon-blue text-white text-xs overflow-hidden relative group hover:text-black motion-reduce:hover:text-white transition-all duration-300"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <span className="relative z-10 flex items-center gap-1">
            {copied ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
          </span>
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
