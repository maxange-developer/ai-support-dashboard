'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Source {
  documentId: string
  documentTitle: string
  similarity: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface PlaygroundChatProps {
  orgSlug: string
  hasDocuments: boolean
}

export default function PlaygroundChat({ orgSlug, hasDocuments }: PlaygroundChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingText, setPendingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [input, setInput] = useState('')

  const pendingRef = useRef('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingText])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || isStreaming) return

      setInput('')
      setError(null)
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setIsStreaming(true)
      pendingRef.current = ''
      setPendingText('')

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgSlug, message: text, conversationId }),
        })

        if (!response.ok || !response.body) {
          const err = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(err.error ?? 'Request failed')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue
            let data: { type: string; text?: string; sources?: Source[]; tokensUsed?: number; conversationId?: string; error?: string }
            try {
              data = JSON.parse(part.slice(6)) as typeof data
            } catch {
              continue
            }

            if (data.type === 'token' && data.text) {
              pendingRef.current += data.text
              setPendingText(pendingRef.current)
            } else if (data.type === 'done') {
              setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: pendingRef.current, sources: data.sources ?? [] },
              ])
              pendingRef.current = ''
              setPendingText('')
              if (data.conversationId) setConversationId(data.conversationId)
            } else if (data.type === 'error') {
              setError(data.error ?? 'Errore durante la risposta')
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore di rete')
      } finally {
        setIsStreaming(false)
        pendingRef.current = ''
        setPendingText('')
      }
    },
    [input, isStreaming, orgSlug, conversationId],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className="flex flex-col glass rounded-xl border border-white/10 h-[calc(100vh-7rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            {hasDocuments ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full border border-neon-blue/30 flex items-center justify-center mx-auto">
                  <span className="text-neon-blue text-lg">✦</span>
                </div>
                <p className="text-sm text-white/40">Fai una domanda. Le risposte si basano sui tuoi documenti.</p>
              </div>
            ) : (
              <>
                <FileText size={36} className="text-white/20" aria-hidden />
                <div className="space-y-1">
                  <p className="font-medium text-sm text-white/60">Nessun documento</p>
                  <p className="text-sm text-white/35">Carica documenti per iniziare a usare il playground.</p>
                </div>
              </>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isStreaming && (
          <div className="max-w-[80%] glass rounded-xl border border-white/10 px-4 py-3 text-sm">
            {pendingText ? (
              <span className="whitespace-pre-wrap text-white/90">
                {pendingText}
                <span className="inline-block w-0.5 h-4 bg-neon-blue ml-0.5 animate-pulse align-middle" />
              </span>
            ) : (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center py-2">{error}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 shrink-0">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi una domanda… (Invio per inviare, Shift+Invio per andare a capo)"
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none max-h-32 min-h-[2.5rem] px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-neon-blue focus:bg-neon-blue/5 transition-all duration-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            aria-label="Invia"
            className="p-2.5 rounded-xl bg-neon-blue text-black hover:bg-neon-blue/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
          >
            <Send size={16} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'
  const hasSources = !isUser && (message.sources?.length ?? 0) > 0

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-3 text-sm',
          isUser
            ? 'bg-neon-blue/10 border border-neon-blue/30 text-white text-right ml-auto'
            : 'glass border border-white/10 text-white',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {hasSources && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowSources((s) => !s)}
              className="flex items-center gap-1 text-xs text-white/35 hover:text-neon-pink transition-colors"
            >
              {showSources ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
              {message.sources!.length} fonte{message.sources!.length !== 1 ? 'i' : 'e'}
            </button>

            {showSources && (
              <ul className="mt-2 space-y-1.5 border-l-2 border-neon-pink pl-3">
                {message.sources!.map((src, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/40">
                    <FileText size={10} aria-hidden className="shrink-0 text-neon-pink/60" />
                    <span className="truncate">{src.documentTitle}</span>
                    <span className="font-mono text-neon-blue/60 shrink-0 ml-auto">
                      {Math.round(src.similarity * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
