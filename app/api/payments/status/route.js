import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

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
