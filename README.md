# UX Analyzer

Análise de UX com IA, geração de PDF e extensão para páginas autenticadas.

## Requisitos
- Node.js 18+

## Configuração
1. Copie o arquivo `.env.example` para `.env`
2. Preencha as variáveis de ambiente

## Desenvolvimento
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Extensão
1. Acesse `chrome://extensions`
2. Ative o modo desenvolvedor
3. Clique em “Carregar sem compactação”
4. Selecione a pasta `extension`

## Endpoints principais
- `POST /api/analyze`
- `POST /api/analyze-image`
- `GET /api/extension/download`
