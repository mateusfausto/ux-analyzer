import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    const { data } = await supabase
      .from('payments')
      .select('status')
      .eq('payment_id', paymentId)
      .single()

    return NextResponse.json({
      status: data?.status || 'pending',
    })
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar pagamento' },
      { status: 500 }
    )
  }
}