import { NextResponse } from 'next/server'

let count = 417

export async function GET() {
  return NextResponse.json({ count })
}

export async function POST() {
  count += 1
  return NextResponse.json({ count })
}
