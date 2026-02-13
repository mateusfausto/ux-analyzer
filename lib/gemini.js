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

  const prompt = `Você é um Especialista Sênior em UX/UI com foco em Acessibilidade e Usabilidade.
Analise esta interface de usuário com profundidade técnica, baseando-se nas 10 Heurísticas de Nielsen.

PRIMEIRA ETAPA: OBSERVAÇÃO VISUAL
Descreva o que você vê na imagem. Identifique o tipo de site/app, o layout principal, paleta de cores e hierarquia visual.
Se a imagem estiver vazia, quebrada ou não for uma interface, aborte a análise e informe isso no resumo.

SEGUNDA ETAPA: ANÁLISE HEURÍSTICA
Para cada uma das 10 heurísticas abaixo, faça uma avaliação crítica:
${NIELSEN_HEURISTICS.map((h, i) => `${i + 1}. ${h}`).join('\n')}

DIRETRIZES DE PONTUAÇÃO:
- Seja rigoroso. Notas acima de 8 exigem excelência comprovada.
- Notas abaixo de 5 exigem problemas graves identificados.
- Considere contraste, legibilidade, tamanho de toque e clareza das ações.

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
Retorne APENAS um JSON válido seguindo estritamente esta estrutura:
{
  "overall_score": número (0.0 a 10.0, com uma casa decimal),
  "summary": "Resumo executivo da análise (máx 3 parágrafos). Destaque os pontos mais críticos (positivos e negativos).",
  "visual_evidence": ["Evidência visual 1", "Evidência visual 2", "Evidência visual 3"],
  "screen_capture_issue": boolean (true se a imagem tiver problemas técnicos),
  "heuristics": [
    {
      "heuristic": "Nome da Heurística",
      "score": número (inteiro 0-10),
      "findings": [
        "Ponto positivo: ...",
        "Problema identificado: ... (seja específico sobre onde e o quê)"
      ],
      "recommendations": [
        "Ação concreta: ... (sugira correções práticas, ex: 'Aumentar contraste do botão X')",
        "Melhoria sugerida: ..."
      ]
    }
  ]
}`

  const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  // Lista de modelos Flash em ordem de prioridade para fallback
  const fallbackModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-flash-latest' // Legado, se ainda existir
  ]
  
  // Cria lista única garantindo que o configurado seja o primeiro
  const models = [configuredModel, ...fallbackModels.filter(m => m !== configuredModel)]

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
  let successModel

  for (const model of models) {
    // console.log(`Tentando modelo: ${model}`)
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
      lastError = new Error(`Erro na API Gemini (${response.status}) com modelo ${model}: ${message}`)
      continue
    }

    data = JSON.parse(responseText)
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (text) {
      successModel = model
      break
    }
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
