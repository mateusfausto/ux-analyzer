const NIELSEN_HEURISTICS = [
  "Visibilidade do Status do Sistema",
  "Correspondência entre o Sistema e o Mundo Real",
  "Controle e Liberdade do Usuário",
  "Consistência e Padrões",
  "Prevenção de Erros",
  "Reconhecimento em vez de Memorização",
  "Flexibilidade e Eficiência de Uso",
  "Design Estético e Minimalista",
  "Ajudar Usuários a Reconhecer, Diagnosticar e Recuperar Erros",
  "Ajuda e Documentação"
]

export async function analyzeWithGemini(imageBase64) {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada')
  }

  const prompt = `Analise esta interface de usuário com base nas 10 Heurísticas de Nielsen.
Antes de pontuar, descreva o que você realmente vê na imagem. Se a imagem parecer vazia, monocromática ou sem UI, sinalize isso explicitamente e evite conclusões exageradas.

${NIELSEN_HEURISTICS.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Para cada heurística, forneça:
- Uma pontuação de 0 a 10
- Principais achados (2-3 pontos)
- Recomendações de melhoria (2-3 pontos)

Retorne APENAS um JSON válido no seguinte formato:
{
  "overall_score": número,
  "summary": "resumo geral da análise",
  "visual_evidence": ["elemento visível 1", "elemento visível 2", "elemento visível 3"],
  "screen_capture_issue": boolean,
  "heuristics": [
    {
      "heuristic": "nome da heurística",
      "score": número,
      "findings": ["achado 1", "achado 2"],
      "recommendations": ["recomendação 1", "recomendação 2"]
    }
  ]
}`

  const configuredModel = process.env.GEMINI_MODEL || 'gemini-flash-latest'
  const models = [configuredModel]

  const requestBody = JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/png',
            data: imageBase64
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.2,
      topK: 24,
      topP: 0.9,
      maxOutputTokens: 4096,
    }
  })

  let data
  let text
  let lastError

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      }
    )

    const responseText = await response.text()

    if (!response.ok) {
      const message = responseText ? responseText.slice(0, 500) : response.statusText
      lastError = new Error(`Erro na API Gemini (${response.status}): ${message}`)
      continue
    }

    data = JSON.parse(responseText)
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    break
  }

  if (!text) {
    throw lastError || new Error('Resposta inválida da API Gemini')
  }
  
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Resposta inválida da API Gemini')
  }

  return JSON.parse(jsonMatch[0])
}
