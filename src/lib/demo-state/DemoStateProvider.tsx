'use client'

import { createContext, useContext, useState } from 'react'
import type { SourceType } from '@/lib/ai/parsing'

export interface DemoDoc {
  id: string
  org_id: string
  title: string
  source_type: SourceType
  status: 'ready' | 'processing'
  created_at: string
}

export interface DemoKey {
  id: string
  org_id: string
  name: string | null
  last_used_at: string | null
  created_at: string
}

interface DemoState {
  addedDocs: DemoDoc[]
  deletedDocIds: Set<string>
  addedKeys: DemoKey[]
  deletedKeyIds: Set<string>
  addDoc: (doc: DemoDoc) => void
  deleteDocs: (ids: string[]) => void
  addKey: (key: DemoKey) => void
  deleteKey: (id: string) => void
}

const Ctx = createContext<DemoState | null>(null)

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [addedDocs, setAddedDocs] = useState<DemoDoc[]>([])
  const [deletedDocIds, setDeletedDocIds] = useState<Set<string>>(new Set())
  const [addedKeys, setAddedKeys] = useState<DemoKey[]>([])
  const [deletedKeyIds, setDeletedKeyIds] = useState<Set<string>>(new Set())

  return (
    <Ctx.Provider value={{
      addedDocs,
      deletedDocIds,
      addedKeys,
      deletedKeyIds,
      addDoc: (d) => setAddedDocs((prev) => [d, ...prev]),
      deleteDocs: (ids) => setDeletedDocIds((prev) => new Set([...prev, ...ids])),
      addKey: (k) => setAddedKeys((prev) => [k, ...prev]),
      deleteKey: (id) => setDeletedKeyIds((prev) => new Set([...prev, id])),
    }}>
      {children}
    </Ctx.Provider>
  )
}

// Returns null when rendered outside the provider (non-mock mode).
export function useDemoState(): DemoState | null {
  return useContext(Ctx)
}
