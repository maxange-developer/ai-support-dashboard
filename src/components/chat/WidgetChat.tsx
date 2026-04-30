'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
    [input, isStreaming, orgSlug, conversationId, apiKey],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-3 border-b flex items-center gap-2 shrink-0">
        <span className="size-2 rounded-full bg-green-500" aria-hidden />
        <span className="text-sm font-semibold">Supporto</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && !isStreaming && (
          <p className="text-xs text-muted-foreground text-center pt-6">Come posso aiutarti?</p>
        )}

        {messages.map((msg, i) => (
          <WidgetMessage key={i} message={msg} />
        ))}

        {isStreaming && (
          <div className="max-w-[85%] rounded-xl rounded-tl-none px-3 py-2 bg-muted text-sm">
            {pendingText ? (
              <span className="whitespace-pre-wrap leading-relaxed">
                {pendingText}
                <span className="inline-block w-0.5 h-3.5 bg-foreground/50 ml-0.5 animate-pulse align-middle" />
              </span>
            ) : (
              <div className="space-y-1.5">
                <div className="h-2.5 w-36 rounded bg-muted-foreground/20 animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-muted-foreground/20 animate-pulse" />
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-destructive text-center py-1">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 shrink-0">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio…"
            disabled={isStreaming}
            className="resize-none flex-1 max-h-24 min-h-[2rem] text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isStreaming || !input.trim()}
            aria-label="Invia"
          >
            <Send size={14} aria-hidden />
          </Button>
        </form>
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
          'max-w-[85%] rounded-xl text-sm px-3 py-2',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted rounded-tl-none',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {hasSources && (
          <div className="mt-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setShowSources((s) => !s)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSources ? <ChevronUp size={10} aria-hidden /> : <ChevronDown size={10} aria-hidden />}
              {message.sources!.length} fonte{message.sources!.length !== 1 ? 'i' : 'e'}
            </button>
            {showSources && (
              <ul className="mt-1.5 space-y-1">
                {message.sources!.map((src, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <FileText size={9} aria-hidden />
                    <span className="truncate">{src.documentTitle}</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-auto shrink-0">
                      {Math.round(src.similarity * 100)}%
                    </Badge>
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
