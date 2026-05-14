'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import type { ConversationListItem, MessageRow } from '@/lib/db/analytics'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const PERIOD_KEYS = ['today', '7d', '30d', 'all'] as const

interface Props {
  conversations: ConversationListItem[]
  period: string
  orgSlug: string
  getMessages: (convId: string) => Promise<MessageRow[]>
}

function Stat({ label, value, color = 'white' }: { label: string; value: string; color?: 'white' | 'neon-blue' }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 glass border border-white/10 rounded">
      <span className="text-[10px] text-white/35 uppercase tracking-wider font-medium">{label}</span>
      <span className={`text-xs font-mono font-semibold ${color === 'neon-blue' ? 'text-white' : 'text-white/70'}`}>
        {value}
      </span>
    </div>
  )
}

export default function ConversationList({ conversations, period, orgSlug, getMessages }: Props) {
  const router = useRouter()
  const t = useTranslations('conversations')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationListItem | null>(null)
  const [isPending, startTransition] = useTransition()

  function openConv(conv: ConversationListItem) {
    setSelectedConv(conv)
    setMessages([])
    setOpen(true)
    startTransition(async () => {
      const msgs = await getMessages(conv.id)
      setMessages(msgs)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {PERIOD_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => router.push(`/app/${orgSlug}/conversations?period=${key}`)}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all duration-200',
              period === key
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-transparent text-white/40 border-transparent hover:text-white/70',
            )}
          >
            {t(`periods.${key}`)}
          </button>
        ))}
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-sm text-white/50 max-w-sm mx-auto">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="glass border-2 border-white/10 overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-white/8 bg-white/2">
            <p className="flex-1 text-xs font-medium text-white/40 uppercase tracking-wider">{t('table.visitor')}</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider hidden sm:block">{t('table.date')}</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider text-right w-16">{t('table.messages')}</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider text-right w-20">{t('table.cost')}</p>
          </div>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConv(conv)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-white/3 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {conv.visitorId
                    ? t('visitorWithId', { id: conv.visitorId.slice(0, 8) })
                    : t('visitorAnonymous')}
                </p>
              </div>
              <p className="text-xs text-white/35 hidden sm:block shrink-0">
                {new Date(conv.startedAt).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-white/50 text-right w-16 font-mono shrink-0">{conv.messageCount}</p>
              <p className="text-xs text-white text-right w-20 font-mono shrink-0">
                ${(conv.costCents / 100).toFixed(4)}
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden bg-black/95 border-white/15 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-semibold">
              {selectedConv
                ? t('modal.title', { date: new Date(selectedConv.startedAt).toLocaleString(locale) })
                : t('title')}
            </DialogTitle>
          </DialogHeader>

          {selectedConv && (
            <div className="flex items-center gap-3 flex-wrap">
              <Stat label={t('modal.stats.messages')} value={String(selectedConv.messageCount)} />
              <Stat
                label={t('modal.stats.tokens')}
                value={
                  isPending
                    ? '—'
                    : String(messages.filter((m) => m.role === 'assistant').reduce((s, m) => s + (m.tokens_used ?? 0), 0))
                }
              />
              <Stat label={t('modal.stats.cost')} value={`$${(selectedConv.costCents / 100).toFixed(4)}`} color="neon-blue" />
            </div>
          )}

          <div className="overflow-y-auto max-h-[52vh] space-y-3 custom-scrollbar">
            {isPending ? (
              <p className="py-4 text-center text-sm text-white/35">{t('modal.loading')}</p>
            ) : messages.length === 0 ? (
              <p className="py-4 text-center text-sm text-white/35">{t('modal.empty')}</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'glass border border-neon-blue/30 bg-neon-blue/5 text-white'
                        : 'glass border border-white/10 bg-white/2 text-white/90',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
