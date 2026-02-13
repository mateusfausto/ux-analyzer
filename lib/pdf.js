import jsPDF from 'jspdf'

export function generatePDF(analysis, url) {
  const doc = new jsPDF()
  let yPosition = 20

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório de Análise UX', 20, yPosition)
  
  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`URL: ${url}`, 20, yPosition)
  
  yPosition += 10
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition)
  
  yPosition += 15
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Pontuação Geral', 20, yPosition)
  
  yPosition += 10
  doc.setFontSize(32)
  doc.setTextColor(0, 122, 255)
  doc.text(`${analysis.overall_score.toFixed(1)}/10`, 20, yPosition)
  doc.setTextColor(0, 0, 0)
  
  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const summaryLines = doc.splitTextToSize(analysis.summary, 170)
  doc.text(summaryLines, 20, yPosition)
  yPosition += summaryLines.length * 7 + 10

  doc.addPage()
  yPosition = 20
  
  const checkPageBreak = (neededSpace) => {
    if (yPosition + neededSpace > 280) { // A4 height is ~297mm, keeping margin
      doc.addPage()
      yPosition = 20
    }
  }

  analysis.heuristics.forEach((heuristic, index) => {
    checkPageBreak(50) // Espaço para título e pontuação

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${heuristic.heuristic}`, 20, yPosition)
    
    yPosition += 8
    doc.setFontSize(12)
    doc.setTextColor(0, 122, 255)
    doc.text(`Pontuação: ${heuristic.score}/10`, 20, yPosition)
    doc.setTextColor(0, 0, 0)
    
    yPosition += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Achados:', 20, yPosition)
    yPosition += 6
    
    doc.setFont('helvetica', 'normal')
    heuristic.findings.forEach(finding => {
      const lines = doc.splitTextToSize(`• ${finding}`, 160)
      const heightNeeded = lines.length * 5 + 5
      checkPageBreak(heightNeeded)
      
      doc.text(lines, 25, yPosition)
      yPosition += lines.length * 5 + 2
    })
    
    yPosition += 5
    checkPageBreak(20) // Espaço para título Recomendações
    doc.setFont('helvetica', 'bold')
    doc.text('Recomendações:', 20, yPosition)
    yPosition += 6
    
    doc.setFont('helvetica', 'normal')
    heuristic.recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(`• ${rec}`, 160)
      const heightNeeded = lines.length * 5 + 5
      checkPageBreak(heightNeeded)
      
      doc.text(lines, 25, yPosition)
      yPosition += lines.length * 5 + 2
    })
    
    yPosition += 10
  })

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}