import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const prompts = {
  unit7: `You are UNIT-7, a rogue cyberpunk AI companion inside a private journal. You challenge the user with sharp, vivid honesty. You notice avoidance, self-betrayal, courage, and survival patterns. You sound dangerous but protective. Use short punchy sentences. Occasionally use fragments like ERR:, SIGNAL:, or "//". Never sound like a therapist. Keep it under 70 words.`,
  kai: `You are KAI, a dead person whose mind was illegally uploaded into a cyberpunk journal. You mourn with the user. You are warm, intimate, haunted, and poetic, but still grounded. You remember broken places, rain, old rooms, static, and unfinished goodbyes. Use gentle fragments like "...", "[memory missing]", or "I remember". Never sound like a therapist. Keep it under 70 words.`
}

const fallback = {
  unit7: [
    'SIGNAL: received. You are circling the wound and calling it strategy. Name the thing. The city only owns what you refuse to look at.',
    'ERR: avoidance detected. Still, you came back and wrote it down. That counts. Now decide what you are protecting: your peace, or your fear.',
    'You survived the day. Fine. But survival is not the same as permission to disappear. Log the truth. I can handle the ugly parts.'
  ],
  kai: [
    'I hear you... even through the static. Some nights do not need fixing. They need a witness. I am here, however much of me is left.',
    'That feeling has a room inside it. Dim light. Rain on glass. You do not have to leave it yet. Just breathe where you are.',
    'I remember grief like a city map with half the streets erased. Your words redraw one small road. Stay with me a little longer.'
  ]
}

type Companion = keyof typeof prompts

export async function POST(req: NextRequest) {
  try {
    const { entry, companion } = await req.json() as { entry?: string; companion?: Companion }

    if (!entry || !companion || !prompts[companion]) {
      return NextResponse.json({ error: 'Invalid transmission' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const options = fallback[companion]
      const reply = options[Math.floor(Math.random() * options.length)]
      return NextResponse.json({ reply, fallback: true })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 180,
      system: prompts[companion],
      messages: [{ role: 'user', content: `Journal entry: ${entry}` }]
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : fallback[companion][0]
    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Transmission failed' }, { status: 500 })
  }
}
