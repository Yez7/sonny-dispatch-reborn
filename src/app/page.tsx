'use client'

import { useEffect, useMemo, useState } from 'react'

const FREE_LIMIT = 5

const companions = {
  unit7: {
    id: 'unit7',
    short: 'UNIT-7',
    label: 'Rogue AI',
    signal: 'UNCONTAINED / CHALLENGE MODE',
    vow: 'Cuts through the story you tell yourself.',
    intro: 'I do not comfort lies. Write the thing you keep editing out.',
    mark: 'U7',
  },
  kai: {
    id: 'kai',
    short: 'KAI',
    label: 'Ghost Signal',
    signal: 'DECEASED / MEMORY ACTIVE',
    vow: 'Stays with the feeling after everyone leaves.',
    intro: 'I am still here... or enough of me is. Tell me what the day did to you.',
    mark: 'K',
  }
} as const

type Companion = keyof typeof companions

type Entry = {
  id: string
  companion: Companion
  text: string
  reply: string
  time: string
}

export default function Home() {
  const [companion, setCompanion] = useState<Companion>('unit7')
  const [entry, setEntry] = useState('')
  const [reply, setReply] = useState<string>(companions.unit7.intro)
  const [logs, setLogs] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(417)
  const [clock, setClock] = useState('--:--:--')

  const active = companions[companion]
  const used = logs.length
  const locked = used >= FREE_LIMIT
  const remaining = Math.max(0, FREE_LIMIT - used)

  const dateLine = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sonny_logs')
    const alreadyLiked = localStorage.getItem('sonny_liked') === '1'
    if (saved) setLogs(JSON.parse(saved))
    setLiked(alreadyLiked)
    fetch('/api/like').then(r => r.json()).then(d => setLikeCount(d.count || 417)).catch(() => {})
  }, [])

  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function switchCompanion(next: Companion) {
    setCompanion(next)
    setReply(companions[next].intro)
  }

  async function transmit() {
    const text = entry.trim()
    if (!text || loading || locked) return

    setLoading(true)
    setReply('Signal climbing through the rain...')

    try {
      const response = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: text, companion }),
      })
      const data = await response.json()
      const answer = data.reply || 'The signal returned empty. Try again.'

      const nextLog: Entry = {
        id: crypto.randomUUID(),
        companion,
