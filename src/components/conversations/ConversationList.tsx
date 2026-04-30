'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ConversationListItem, MessageRow } from '@/lib/db/analytics'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const PERIODS = [
  { value: 'today', label: 'Oggi' },
  { value: '7d', label: '7 giorni' },
  { value: '30d', label: '30 giorni' },
  { value: 'all', label: 'Tutte' },
]

interface Props {
  conversations: ConversationListItem[]
  period: string
  orgSlug: string
  getMessages: (convId: string) => Promise<MessageRow[]>
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
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => router.push(`/app/${orgSlug}/conversations?period=${p.value}`)}
            className={[
              'px-3 py-1 text-sm rounded-md border transition-colors',
              period === p.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nessuna conversazione nel periodo selezionato.
        </p>
      ) : (
        <div className="rounded-md border divide-y">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConv(conv)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {conv.visitorId ? `Visitatore ${conv.visitorId.slice(0, 8)}` : 'Anonimo'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(conv.startedAt).toLocaleString('it-IT')}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">{conv.messageCount} msg</p>
                <p className="text-xs text-muted-foreground">${(conv.costCents / 100).toFixed(4)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedConv
                ? new Date(selectedConv.startedAt).toLocaleString('it-IT')
                : 'Conversazione'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[55vh] space-y-3">
            {isPending ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Caricamento…</p>
            ) : messages.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nessun messaggio.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={[
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    ].join(' ')}
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
