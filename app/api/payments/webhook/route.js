import { NextResponse } from 'next/server'
import { payment } from '@/lib/mercadopago'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.type === 'payment') {
      const paymentId = body.data.id
      const paymentData = await payment.get({ id: paymentId })

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