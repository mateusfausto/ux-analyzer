'use client'

import { useState } from 'react'
import { X, QrCode, CreditCard, Loader2 } from 'lucide-react'

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess, title = 'Pagamento da Análise', amount = 5.00, description = 'Pagamento único por análise', confirmLabel }) {
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  if (!isOpen) return null

  const handlePayment = async () => {
    const paymentsRequired = process.env.NEXT_PUBLIC_PAYMENTS_REQUIRED === 'true'
    if (paymentsRequired && !email.trim()) {
      alert('Informe seu e-mail para continuar')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email: email.trim() || null,
          payment_method: paymentMethod,
          test_mode: !paymentsRequired,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Erro ao processar pagamento')
      }

      onPaymentSuccess()
    } catch (error) {
      alert(error?.message || 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-3xl font-bold text-blue-500">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-gray-600">
              {description}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === 'pix'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <QrCode className="w-8 h-8 text-blue-500" />
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Pix</div>
                <div className="text-sm text-gray-600">Aprovação instantânea</div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 text-blue-500" />
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Cartão de Crédito</div>
                <div className="text-sm text-gray-600">Em até 12x</div>
              </div>
            </button>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>{confirmLabel || `Pagar R$ ${amount.toFixed(2).replace('.', ',')}`}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
