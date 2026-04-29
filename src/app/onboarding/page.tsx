'use client'

import { useActionState, useState } from 'react'
import { createOrgAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type State = { error: string } | null

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32)
    .replace(/^-|-$/g, '')
}

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    createOrgAction,
    null,
  )
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(toSlug(e.target.value))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Crea la tua organizzazione</CardTitle>
            <CardDescription>
              Potrai invitare altri membri in seguito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state && 'error' in state && state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}

              <div className="space-y-1">
                <Label htmlFor="name">Nome organizzazione</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  onChange={handleNameChange}
                  placeholder="Acme Inc."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true)
                    setSlug(e.target.value)
                  }}
                  placeholder="acme-inc"
                />
                {slug && (
                  <p className="text-xs text-muted-foreground">
                    Il tuo dashboard:{' '}
                    <span className="font-mono">/app/{slug}</span>
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending || !slug}>
                {isPending ? 'Creazione…' : 'Crea organizzazione'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
