import { NextResponse } from 'next/server'
import { captureScreenshot } from '@/lib/screenshot'

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      )
    }

    const base64 = await captureScreenshot(url)

    return NextResponse.json({
      base64_length: base64.length,
    })
  } catch (error) {
    console.error('Erro ao capturar screenshot:', error)
    return NextResponse.json(
      { error: 'Erro ao capturar screenshot' },
      { status: 500 }
    )
  }
}
