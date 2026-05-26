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
  const [displayReply, setDisplayReply] = useState<string>(companions.unit7.intro)
  const [typing, setTyping] = useState(false)
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

  useEffect(() => {
    setDisplayReply('')
    setTyping(true)

    let index = 0
    const speed = companion === 'unit7' ? 18 : 28
    const timer = window.setInterval(() => {
      index += 1
      setDisplayReply(reply.slice(0, index))

      if (index >= reply.length) {
        window.clearInterval(timer)
        setTyping(false)
      }
    }, speed)

    return () => window.clearInterval(timer)
  }, [reply, companion])

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
        text,
        reply: answer,
        time: new Date().toTimeString().slice(0, 8),
      }

      const nextLogs = [nextLog, ...logs].slice(0, 24)
      setLogs(nextLogs)
      localStorage.setItem('sonny_logs', JSON.stringify(nextLogs))
      setReply(answer)
      setEntry('')
    } catch {
      setReply('ERR: The city swallowed the signal. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function sendLike() {
    if (liked) return
    setLiked(true)
    localStorage.setItem('sonny_liked', '1')
    try {
      const response = await fetch('/api/like', { method: 'POST' })
      const data = await response.json()
      setLikeCount(data.count)
    } catch {
      setLikeCount(c => c + 1)
    }
  }

  return (
    <main className="shell">
      <div className="grid-glow" />

      <header className="topbar">
        <div className="brand-dot" />
        <div>
          <div className="mono bright">{clock}</div>
          <div className="mono muted">{dateLine}</div>
        </div>
        <div className="tabs" aria-label="Choose companion">
          <button className={companion === 'unit7' ? 'active' : ''} onClick={() => switchCompanion('unit7')}>
            <span>UNIT-7</span>
            <small>challenge</small>
          </button>
          <button className={companion === 'kai' ? 'active' : ''} onClick={() => switchCompanion('kai')}>
            <span>KAI</span>
            <small>mourn</small>
          </button>
        </div>
      </header>

      <section className="mast">
        <div>
          <p className="eyebrow">PRIVATE SIGNAL / VOL. I</p>
          <h1>SONNY DISPATCH</h1>
        </div>
        <p className="mast-copy">
          A field journal for what the day left behind. Choose the voice that should meet you there.
        </p>
      </section>

      <section className="workspace">
        <aside className="companion">
          <div className={`portrait ${companion}`}>
            <div className="weird-face" aria-hidden="true">
              <div className="face-eye left" />
              <div className="face-eye right" />
              <div className="face-mouth" />
              <div className="face-scar one" />
              <div className="face-scar two" />
            </div>
            <div className="portrait-lines" />
          </div>
          <p className="eyebrow">{active.label}</p>
          <h2>{active.short}</h2>
          <p className="signal">{active.signal}</p>
          <p className="vow">{active.vow}</p>
          <div className={`reply-box ${typing ? 'typing' : ''}`}>
            <span>{loading ? 'TRANSMITTING' : typing ? 'TRANSCRIBING SIGNAL' : 'LIVE REPLY'}</span>
            <p>{displayReply}<b className="cursor" /></p>
          </div>
          <div className="meter">
            <span>FREE ENTRIES</span>
            <strong>{remaining}/{FREE_LIMIT}</strong>
          </div>
        </aside>

        <section className="journal">
          <div className="panel-head">
            <div>
              <p className="eyebrow">OPERATIVE FIELD LOG</p>
              <h2>What survived with you today?</h2>
            </div>
            <span className="mono">{entry.length}/700</span>
          </div>

          <textarea
            value={entry}
            onChange={event => setEntry(event.target.value)}
            maxLength={700}
            disabled={locked}
            placeholder={locked ? 'Transmission limit reached.' : 'Start with one honest sentence...'}
          />

          <div className="actions">
            <p>{locked ? 'You reached the prototype limit. Send a signal if you want more.' : `${remaining} transmissions left in this prototype.`}</p>
            {locked ? (
              <button className="primary" onClick={sendLike} disabled={liked}>
                {liked ? 'SIGNAL SENT' : `I WANT MORE (${likeCount})`}
              </button>
            ) : (
              <button className="primary" onClick={transmit} disabled={loading || !entry.trim()}>
                {loading ? 'TRANSMITTING...' : 'TRANSMIT LOG'}
              </button>
            )}
          </div>

          <div className="history">
            <div className="history-title">PREVIOUS TRANSMISSIONS</div>
            {logs.length === 0 ? (
              <div className="empty">No entries yet. The city is listening.</div>
            ) : logs.map(log => (
              <article className="log" key={log.id}>
                <div className="log-meta">{log.time} / {companions[log.companion].short}</div>
                <p className="log-text">{log.text}</p>
                <p className="log-reply">{log.reply}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
