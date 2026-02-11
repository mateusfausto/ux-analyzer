'use client'

import { X } from 'lucide-react'

export default function ExtensionInstructionsModal({ isOpen, onClose, onDownload }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Como instalar a extensão
            </h2>
            <p className="text-gray-600">
              Use a extensão para analisar páginas autenticadas direto no navegador.
            </p>
          </div>

          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Baixe o arquivo da extensão.</li>
            <li>Acesse chrome://extensions.</li>
            <li>Ative o modo desenvolvedor.</li>
            <li>Clique em “Carregar sem compactação” e selecione a pasta extraída.</li>
          </ol>

          <button
            onClick={onDownload}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors"
          >
            Baixar extensão
          </button>
        </div>
      </div>
    </div>
  )
}
