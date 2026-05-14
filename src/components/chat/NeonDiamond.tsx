'use client'

import { Sparkles } from 'lucide-react'

export function NeonDiamond() {
  return (
    <div className="relative h-14 w-14 flex items-center justify-center">
      {/* Outer glow — pulses with the diamond ring */}
      <div
        className="absolute inset-0 bg-cyan-400/10 blur-xl"
        style={{ animation: 'pulse 3s ease-in-out infinite' }}
        aria-hidden
      />

      {/* Rotating diamond — starts at 45° (rotated square), spins a full 360° */}
      <div
        className="absolute inset-0 border border-cyan-400/60 rounded-sm motion-reduce:hidden"
        style={{
          transform: 'rotate(45deg)',
          animation: 'spin-slow 6s linear infinite',
          boxShadow:
            '0 0 24px rgba(34, 211, 238, 0.4), inset 0 0 12px rgba(34, 211, 238, 0.2)',
        }}
        aria-hidden
      />
      {/* Static fallback for reduced motion */}
      <div
        className="absolute inset-0 border border-cyan-400/60 rounded-sm hidden motion-reduce:block"
        style={{
          transform: 'rotate(45deg)',
          boxShadow:
            '0 0 24px rgba(34, 211, 238, 0.4), inset 0 0 12px rgba(34, 211, 238, 0.2)',
        }}
        aria-hidden
      />

      {/* Sparkles icon — pulses softly to draw the eye */}
      <Sparkles
        className="relative h-5 w-5 text-cyan-300"
        style={{ animation: 'pulse 2s ease-in-out infinite' }}
        aria-hidden
      />
    </div>
  )
}
