import { NextResponse } from 'next/server'
import { getPaymentClient } from '@/lib/mercadopago'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const body = await request.json()

    if (body.type === 'payment') {
      const paymentClient = getPaymentClient()
      if (!paymentClient) {
        return NextResponse.json(
          { error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' },
          { status: 500 }
        )
      }

      const paymentId = body.data.id
      const paymentData = await paymentClient.get({ id: paymentId })

      if (paymentData.status === 'approved') {
        await supabase
          .from('payments')
          .update({ status: 'approved' })
          .eq('payment_id', paymentId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
