import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY não configurada' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )

    const text = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        { error: text || response.statusText },
        { status: response.status }
      )
    }

    const data = JSON.parse(text)
    const models = (data.models || []).map((model) => ({
      name: model.name,
      supportedGenerationMethods: model.supportedGenerationMethods || []
    }))

    return NextResponse.json({ models })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao listar modelos do Gemini' },
      { status: 500 }
    )
  }
}
