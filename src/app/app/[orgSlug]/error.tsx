'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
      <p className="text-lg font-semibold">Qualcosa è andato storto</p>
      {process.env.NODE_ENV === 'development' && (
        <p className="text-sm text-muted-foreground font-mono max-w-md break-words">
          {error.message}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Riprova
      </button>
    </div>
  )
}
