import { NextResponse } from 'next/server'
import { analyzeWithGemini } from '@/lib/gemini'
import { generatePDF } from '@/lib/pdf'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request) {
  try {
    const { image_base64, url } = await request.json()

    if (!image_base64) {
      return NextResponse.json(
        { error: 'Imagem é obrigatória' },
        { status: 400, headers: corsHeaders }
      )
    }

    const analysis = await analyzeWithGemini(image_base64)
    const pdfBuffer = generatePDF(analysis, url || 'Tela capturada')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analise-ux-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500, headers: corsHeaders }
    )
  }
}
