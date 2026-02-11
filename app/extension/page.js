'use client'

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            Extensão UX Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Use a extensão para analisar páginas que exigem autenticação. Ela captura a tela atual e gera o PDF usando o mesmo serviço da aplicação.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Instalação no Chrome
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Baixe o arquivo da extensão.</li>
              <li>Acesse chrome://extensions.</li>
              <li>Ative o modo desenvolvedor.</li>
              <li>Clique em “Carregar sem compactação” e selecione a pasta extraída.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Download
            </h3>
            <a
              href="/api/extension/download"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
            >
              Baixar extensão
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
