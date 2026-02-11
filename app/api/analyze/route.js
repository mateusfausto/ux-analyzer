import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { captureScreenshot } from '@/lib/screenshot'
import { analyzeWithGemini } from '@/lib/gemini'
import { generatePDF } from '@/lib/pdf'

export async function POST(request) {
  try {
    const { url, user_email } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      )
    }

    // Capturar screenshot
    const screenshot = await captureScreenshot(url)

    // Analisar com Gemini
    const analysis = await analyzeWithGemini(screenshot)

    // Gerar PDF
    const pdfBuffer = generatePDF(analysis, url)

    // Salvar no banco
    await supabase
      .from('analyses')
      .insert({
        user_email,
        url,
        overall_score: analysis.overall_score,
      })

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analise-ux-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    )
  }
}