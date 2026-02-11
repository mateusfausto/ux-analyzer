import { NextResponse } from 'next/server'
import { preference } from '@/lib/mercadopago'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { amount, email, payment_method } = await request.json()

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

    const response = await preference.create({ body: preferenceData })

    // Registrar no banco
    await supabase
      .from('payments')
      .insert({
        user_email: email,
        payment_id: response.id,
        amount,
        status: 'pending',
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