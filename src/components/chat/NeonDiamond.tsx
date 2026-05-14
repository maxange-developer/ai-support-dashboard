'use client'

import { Sparkles } from 'lucide-react'

export function NeonDiamond() {
  return (
    <div className="neon-cube-wrap">
      <div className="neon-cube" aria-hidden>
        <div className="neon-cube-face neon-cube-front" />
        <div className="neon-cube-face neon-cube-back" />
        <div className="neon-cube-face neon-cube-right" />
        <div className="neon-cube-face neon-cube-left" />
        <div className="neon-cube-face neon-cube-top" />
        <div className="neon-cube-face neon-cube-bottom" />
      </div>
      <Sparkles className="neon-cube-sparkle" strokeWidth={1.5} aria-hidden />
    </div>
  )
}
