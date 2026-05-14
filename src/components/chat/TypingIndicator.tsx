'use client'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1" role="status" aria-label="Assistant is typing">
      <div
        className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: '0ms', animationDuration: '900ms' }}
      />
      <div
        className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: '200ms', animationDuration: '900ms' }}
      />
      <div
        className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: '400ms', animationDuration: '900ms' }}
      />
    </div>
  )
}
