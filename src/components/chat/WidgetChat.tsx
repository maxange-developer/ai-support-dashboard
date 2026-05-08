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

export default function WidgetChat({
  orgSlug,
  apiKey,
}: {
  orgSlug: string
  apiKey: string | undefined
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingText, setPendingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [input, setInput] = useState('')

  const pendingRef = useRef('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingText])

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || isStreaming) return

      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      setError(null)
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setIsStreaming(true)
      pendingRef.current = ''
      setPendingText('')

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgSlug, message: text, conversationId, apiKey }),
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
            let data: {
              type: string
              text?: string
              sources?: Source[]
              conversationId?: string
              error?: string
            }
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
              setError(data.error ?? 'Error generating response')
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setIsStreaming(false)
        pendingRef.current = ''
        setPendingText('')
      }
    },
    [input, isStreaming, orgSlug, conversationId, apiKey],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 shrink-0 glass">
        <span className="size-2 rounded-full bg-neon-green" aria-hidden />
        <span className="text-sm font-semibold text-white">Support</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <p className="text-xs text-white/40 text-center pt-6">How can I help you?</p>
        )}

        {messages.map((msg, i) => (
          <WidgetMessage key={i} message={msg} />
        ))}

        {isStreaming && (
          <div className="max-w-[85%] glass border border-white/10 px-3 py-2 text-sm">
            {pendingText ? (
              <span className="whitespace-pre-wrap leading-relaxed text-white/90">
                {pendingText}
                <span className="inline-block w-0.5 h-3.5 bg-neon-blue ml-0.5 animate-pulse align-middle" />
              </span>
            ) : (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-400 text-center py-1">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — identical pattern to playground */}
      <div className="flex items-stretch gap-2 p-3 border-t border-white/10 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            resizeTextarea()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none min-h-[2.5rem] max-h-24 px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-blue transition-colors duration-200 disabled:opacity-50 overflow-y-auto scrollbar-hide"
          style={{ lineHeight: '1.5rem' }}
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isStreaming || !input.trim()}
          aria-label="Send"
          className="h-10 w-10 flex items-center justify-center border-2 border-neon-blue text-white relative overflow-hidden hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <Send size={14} aria-hidden className="relative z-10" />
        </button>
      </div>
    </div>
  )
}

function WidgetMessage({ message }: { message: Message }) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'
  const hasSources = !isUser && (message.sources?.length ?? 0) > 0

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] text-sm px-3 py-2',
          isUser
            ? 'glass border border-neon-blue/30 bg-neon-blue/5 text-white'
            : 'glass border border-white/10 bg-white/2 text-white',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {hasSources && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowSources((s) => !s)}
              className="flex items-center gap-1 text-[10px] text-white/35 hover:text-neon-pink transition-colors"
            >
              {showSources ? <ChevronUp size={10} aria-hidden /> : <ChevronDown size={10} aria-hidden />}
              {message.sources!.length} source{message.sources!.length !== 1 ? 's' : ''}
            </button>
            {showSources && (
              <ul className="mt-1.5 space-y-1 border-l-2 border-neon-pink pl-2">
                {message.sources!.map((src, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <FileText size={9} aria-hidden className="text-neon-pink/60" />
                    <span className="truncate">{src.documentTitle}</span>
                    <span className="font-mono text-white/60 ml-auto shrink-0">
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
