'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ConversationListItem, MessageRow } from '@/lib/db/analytics'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All' },
]

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
      <span className={`text-xs font-mono font-semibold ${color === 'neon-blue' ? 'text-neon-blue' : 'text-white/70'}`}>
        {value}
      </span>
    </div>
  )
}

export default function ConversationList({ conversations, period, orgSlug, getMessages }: Props) {
  const router = useRouter()
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
      {/* Period filter */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => router.push(`/app/${orgSlug}/conversations?period=${p.value}`)}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all duration-200',
              period === p.value
                ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/40'
                : 'bg-transparent text-white/40 border-white/15 hover:text-white hover:border-white/30',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {conversations.length === 0 ? (
        <div className="glass rounded-lg border-2 border-white/10 py-16 text-center">
          <p className="text-sm text-white/35">No conversations in the selected period.</p>
        </div>
      ) : (
        <div className="glass rounded-lg border-2 border-white/10 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-white/8 bg-white/2">
            <p className="flex-1 text-xs font-medium text-white/40 uppercase tracking-wider">Visitor</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider hidden sm:block">Date</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider text-right w-16">Msgs</p>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider text-right w-20">Cost</p>
          </div>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConv(conv)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-white/3 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {conv.visitorId ? `Visitor ${conv.visitorId.slice(0, 8)}` : 'Anonymous'}
                </p>
              </div>
              <p className="text-xs text-white/35 hidden sm:block shrink-0">
                {new Date(conv.startedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-white/50 text-right w-16 font-mono shrink-0">{conv.messageCount}</p>
              <p className="text-xs text-neon-blue text-right w-20 font-mono shrink-0">
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
                ? new Date(selectedConv.startedAt).toLocaleString('en-GB')
                : 'Conversation'}
            </DialogTitle>
          </DialogHeader>

          {selectedConv && (
            <div className="flex items-center gap-3 flex-wrap">
              <Stat label="Messages" value={String(selectedConv.messageCount)} />
              <Stat
                label="Tokens"
                value={
                  isPending
                    ? '—'
                    : String(messages.filter((m) => m.role === 'assistant').reduce((s, m) => s + (m.tokens_used ?? 0), 0))
                }
              />
              <Stat label="Cost" value={`$${(selectedConv.costCents / 100).toFixed(4)}`} color="neon-blue" />
            </div>
          )}

          <div className="overflow-y-auto max-h-[52vh] space-y-3 custom-scrollbar">
            {isPending ? (
              <p className="py-4 text-center text-sm text-white/35">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="py-4 text-center text-sm text-white/35">No messages.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
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
