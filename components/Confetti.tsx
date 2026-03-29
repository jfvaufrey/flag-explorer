'use client'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (trigger) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }
  }, [trigger])
  return null
}
