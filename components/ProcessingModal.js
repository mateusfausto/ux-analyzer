'use client'

import { Loader2, CheckCircle2, X } from 'lucide-react'

export default function ProcessingModal({ isOpen, status, progress, onClose }) {
  if (!isOpen) return null

  const steps = [
    { id: 'payment', label: 'Pagamento confirmado', icon: CheckCircle2 },
    { id: 'screenshot', label: 'Capturando página...', icon: Loader2 },
    { id: 'analysis', label: 'Analisando interface...', icon: Loader2 },
    { id: 'pdf', label: 'Gerando relatório PDF...', icon: Loader2 },
    { id: 'complete', label: 'Análise concluída!', icon: CheckCircle2 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center space-y-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            {status === 'complete' ? (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            ) : (
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {status === 'complete' ? 'Pronto!' : 'Processando...'}
            </h2>
            <p className="text-gray-600">
              {status === 'complete' 
                ? 'Seu relatório está pronto para download'
                : 'Aguarde enquanto processamos sua análise'}
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const currentIndex = steps.findIndex(s => s.id === status)
              const isActive = step.id === status
              const isComplete = index < currentIndex || (status === 'complete' && step.id === 'complete')
              const shouldSpin = isActive && status !== 'complete'
              const Icon = step.icon

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className={`${isComplete ? 'text-green-500' : isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className={`w-5 h-5 ${shouldSpin ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-gray-900' : isComplete ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {progress && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
