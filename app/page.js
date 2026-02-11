'use client'

import { useState } from 'react'
import { Search, TrendingUp } from 'lucide-react'
import PaymentModal from '@/components/PaymentModal'
import ProcessingModal from '@/components/ProcessingModal'
import ExtensionInstructionsModal from '@/components/ExtensionInstructionsModal'

export default function Home() {
  const [url, setUrl] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExtensionPaymentModal, setShowExtensionPaymentModal] = useState(false)
  const [showExtensionInstructionsModal, setShowExtensionInstructionsModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('payment')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [extensionUnlocked, setExtensionUnlocked] = useState(false)
  const [extensionDownloadPending, setExtensionDownloadPending] = useState(false)

  const handleAnalyzeClick = () => {
    if (!url) {
      alert('Por favor, insira uma URL válida')
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false)
    setShowProcessingModal(true)
    setProcessingStatus('screenshot')

    try {
      // Simular processo de análise
      await new Promise(resolve => setTimeout(resolve, 2000))
      setProcessingStatus('analysis')

      await new Promise(resolve => setTimeout(resolve, 3000))
      setProcessingStatus('pdf')

      // Chamar API de análise
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const pdfUrl = URL.createObjectURL(blob)
        setPdfUrl(pdfUrl)
        setProcessingStatus('complete')

        setTimeout(() => {
          window.open(pdfUrl, '_blank', 'noopener')
        }, 500)
      } else {
        throw new Error('Erro ao gerar análise')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao processar análise. Tente novamente.')
      setShowProcessingModal(false)
    }
  }

  const handleExtensionPaymentSuccess = () => {
    setShowExtensionPaymentModal(false)
    setExtensionUnlocked(true)
    if (extensionDownloadPending) {
      setExtensionDownloadPending(false)
      window.location.href = '/api/extension/download'
    }
  }

  const handleExtensionDownload = () => {
    if (extensionUnlocked) {
      window.location.href = '/api/extension/download'
      return
    }

    setExtensionDownloadPending(true)
    setShowExtensionInstructionsModal(false)
    setShowExtensionPaymentModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">UX</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Analyzer</span>
            </div>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900">
              Análise de UX
              <span className="block bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mt-2">
                Profissional com IA
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Avalie interfaces automaticamente usando as 10 Heurísticas de Nielsen. 
              Relatórios completos por apenas R$ 5,00.
            </p>
          </div>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://seu-site.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                />
              </div>

              <button
                onClick={handleAnalyzeClick}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-6 h-6" />
                Analisar Agora - R$ 5,00
              </button>

              <p className="text-sm text-gray-500 text-center">
                Pagamento único • Relatório instantâneo • Download em PDF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Como Funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-blue-500">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cole a URL</h3>
              <p className="text-gray-600">
                Insira o endereço da página que deseja analisar
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-purple-500">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Pague R$ 5,00</h3>
              <p className="text-gray-600">
                Pagamento único via Pix ou Cartão de Crédito
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-green-500">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Receba o PDF</h3>
              <p className="text-gray-600">
                Análise completa com recomendações detalhadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Heuristics */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            10 Heurísticas de Nielsen
          </h2>
          <p className="text-center text-blue-100 mb-12 text-lg">
            Princípios fundamentais de usabilidade analisados automaticamente
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              "Visibilidade do Status",
              "Sistema e Mundo Real",
              "Controle do Usuário",
              "Consistência",
              "Prevenção de Erros",
              "Reconhecimento",
              "Flexibilidade",
              "Design Minimalista",
              "Recuperação de Erros",
              "Ajuda e Documentação"
            ].map((heuristic, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all min-h-[140px] flex flex-col justify-between"
              >
                <div className="text-3xl font-bold mb-3 opacity-80">{index + 1}</div>
                <div className="text-base font-semibold leading-snug">{heuristic}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Extensão para páginas autenticadas
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Analise páginas que exigem login diretamente no seu navegador. A extensão captura a tela atual e envia a análise para o mesmo serviço.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                {extensionUnlocked ? (
                  <button
                    onClick={handleExtensionDownload}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Baixar extensão
                  </button>
                ) : (
                  <button
                    onClick={() => setShowExtensionPaymentModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Comprar extensão
                  </button>
                )}
                <button
                  onClick={() => setShowExtensionInstructionsModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
                >
                  Ver instruções de instalação
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2026 UX Analyzer. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PaymentModal
        isOpen={showExtensionPaymentModal}
        onClose={() => setShowExtensionPaymentModal(false)}
        onPaymentSuccess={handleExtensionPaymentSuccess}
        title="Pagamento da Extensão"
        amount={5.00}
        description="Licença para uso da extensão no navegador"
        confirmLabel="Comprar extensão"
      />

      <ExtensionInstructionsModal
        isOpen={showExtensionInstructionsModal}
        onClose={() => setShowExtensionInstructionsModal(false)}
        onDownload={handleExtensionDownload}
      />

      <ProcessingModal
        isOpen={showProcessingModal}
        status={processingStatus}
        onClose={() => setShowProcessingModal(false)}
      />
    </div>
  )
}
