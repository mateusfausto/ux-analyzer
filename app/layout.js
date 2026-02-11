import './globals.css'

export const metadata = {
  title: 'UX Analyzer - Análise Profissional de UX com IA',
  description: 'Análise automatizada de interfaces usando as 10 Heurísticas de Nielsen',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}