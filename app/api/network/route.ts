import { NextResponse } from 'next/server'
import { getLocalIp } from '@/lib/get-local-ip'

export async function GET() {
  const localIp = getLocalIp()
  const port = process.env.PORT || 3000
  return NextResponse.json({ localIp: localIp || 'localhost', port })
}
