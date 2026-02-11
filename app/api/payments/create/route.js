import { NextResponse } from 'next/server'
import { getPreferenceClient } from '@/lib/mercadopago'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { amount, email, payment_method, test_mode } = await request.json()

    if (!amount) {
      return NextResponse.json(
        { error: 'Valor é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const allowTestMode = process.env.PAYMENTS_TEST_MODE !== 'false'
    const isTestMode = Boolean(test_mode) && allowTestMode

    if (isTestMode) {
      const paymentId = `test_${Date.now()}`

      await supabase
        .from('payments')
        .insert({
          user_email: email || null,
          payment_id: paymentId,
          amount,
          status: 'approved',
          payment_method: payment_method || 'test',
          is_test: true,
        })

      return NextResponse.json({
        payment_id: paymentId,
        status: 'approved',
        test_mode: true,
      })
    }

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const preferenceData = {
      items: [
        {
          title: 'Análise UX Profissional',
          quantity: 1,
          unit_price: amount,
        }
      ],
      payer: {
        email: email,
      },
      back_urls: {
        success: `${appUrl}?payment=success`,
        failure: `${appUrl}?payment=failure`,
        pending: `${appUrl}?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: email,
      notification_url: `${appUrl}/api/payments/webhook`,
    }

    const preferenceClient = getPreferenceClient()
    if (!preferenceClient) {
      return NextResponse.json(
        { error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' },
        { status: 500 }
      )
    }

    const response = await preferenceClient.create({ body: preferenceData })

    // Registrar no banco
    await supabase
      .from('payments')
      .insert({
        user_email: email,
        payment_id: response.id,
        amount,
        status: 'pending',
        payment_method: payment_method || 'pix',
        is_test: false,
      })

    return NextResponse.json({
      preference_id: response.id,
      init_point: response.init_point,
      payment_id: response.id,
      // Simular dados Pix (em produção viriam do Mercado Pago)
      qr_code: '00020101021243650016COM.MERCADOLIBRE',
      qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    })
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
