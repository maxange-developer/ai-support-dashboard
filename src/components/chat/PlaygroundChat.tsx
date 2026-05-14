'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Send, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypingIndicator } from './TypingIndicator'
import { NeonDiamond } from './NeonDiamond'

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
  const t = useTranslations('playground')
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingText, setPendingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [errorCode, setErrorCode] = useState<'errorGeneric' | 'errorNetwork' | 'errorStream' | null>(null)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [input, setInput] = useState('')

  const pendingRef = useRef('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const quickQuestions = useMemo(
    () => [t('quickQuestions.q1'), t('quickQuestions.q2'), t('quickQuestions.q3'), t('quickQuestions.q4')],
    [t],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingText])

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      setErrorCode(null)
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
          throw new Error('Request failed')
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
            let data: { type: string; text?: string; sources?: Source[]; conversationId?: string; error?: string }
            try {
              data = JSON.parse(part.slice(6)) as typeof data
            } catch {
              continue
            }

            if (data.type === 'token' && data.text) {
              pendingRef.current += data.text
              setPendingText(pendingRef.current)
            } else if (data.type === 'done') {
              // capture before clearing — functional updater runs at render time,
              // not at call time, so pendingRef.current must be saved here
              const committedContent = pendingRef.current
              pendingRef.current = ''
              setPendingText('')
              setIsStreaming(false)
              setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: committedContent, sources: data.sources ?? [] },
              ])
              if (data.conversationId) setConversationId(data.conversationId)
            } else if (data.type === 'error') {
              setErrorCode('errorGeneric')
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        setErrorCode(msg.toLowerCase().includes('network') ? 'errorNetwork' : 'errorStream')
      } finally {
        setIsStreaming(false)
        pendingRef.current = ''
        setPendingText('')
      }
    },
    [isStreaming, orgSlug, conversationId],
  )

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      await sendMessage(input.trim())
    },
    [input, sendMessage],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className="flex flex-col glass border-2 border-white/10 h-[calc(100vh-7rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <NeonDiamond />
              {hasDocuments ? (
                <>
                  <p className="text-base font-medium text-white/90 mt-1">{t('emptyTitle')}</p>
                  <p className="text-sm text-white/50 max-w-sm mx-auto -mt-1">{t('emptySubtitle')}</p>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-white/80">{t('emptyNoDocsTitle')}</p>
                  <p className="text-sm text-white/50 max-w-sm mx-auto mt-2">{t('emptyNoDocsSubtitle')}</p>
                </>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  className="glass border border-neon-blue/30 text-white/80 text-sm px-4 py-2 rounded-full hover:border-neon-blue hover:text-white transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isStreaming && (
          <div className="mr-8 glass border border-white/10 bg-white/2 px-4 py-3 text-sm">
            {pendingText ? (
              <span className="whitespace-pre-wrap text-white/90">
                {pendingText}
                <span className="inline-block w-0.5 h-4 bg-neon-blue ml-0.5 animate-pulse align-middle" />
              </span>
            ) : (
              <TypingIndicator />
            )}
          </div>
        )}

        {errorCode && <p className="text-sm text-red-400 text-center py-2">{t(errorCode)}</p>}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 p-4 shrink-0">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex items-stretch gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              resizeTextarea()
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none min-h-[3rem] max-h-[7.5rem] px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-blue transition-colors duration-200 disabled:opacity-50 overflow-y-auto scrollbar-hide"
            style={{ lineHeight: '1.5rem' }}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            aria-label={t('send')}
            className="h-12 w-12 flex items-center justify-center border-2 border-neon-blue text-white relative overflow-hidden hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <span className="absolute inset-0 bg-neon-blue scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
            <Send size={15} aria-hidden className="relative z-10" />
          </button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const t = useTranslations('playground')
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'
  const hasSources = !isUser && (message.sources?.length ?? 0) > 0
  const sourcesCount = message.sources?.length ?? 0

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 text-sm',
          isUser
            ? 'glass border border-neon-blue/30 bg-neon-blue/5 ml-8 text-white'
            : 'glass border border-white/10 bg-white/2 mr-8 text-white',
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
              {sourcesCount === 1
                ? t('sourcesSingular', { count: sourcesCount })
                : t('sourcesPlural', { count: sourcesCount })}
            </button>

            {showSources && (
              <ul className="mt-2 space-y-1.5 border-l-2 border-neon-pink pl-3">
                {message.sources!.map((src, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/40">
                    <FileText size={10} aria-hidden className="shrink-0 text-neon-pink/60" />
                    <span className="truncate">{src.documentTitle}</span>
                    <span className="font-mono text-white/60 shrink-0 ml-auto">
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
