'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

type State = { error: string } | null
type BoundAction = (prev: State, formData: FormData) => Promise<State>

export default function UploadForm({ action }: { action: BoundAction }) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.md,.txt"
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">PDF, Markdown o testo · max 10 MB</p>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        <Upload size={16} className="mr-2" aria-hidden />
        {isPending ? 'Caricamento in corso...' : 'Carica documento'}
      </Button>
    </form>
  )
}
