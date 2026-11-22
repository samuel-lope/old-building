# NY Facade Studio — React + Cloudflare Workers (Static Assets)

Estúdio paramétrico e data-driven para criação procedural de fachadas arquitetônicas de Nova York em SVG, migrado de aplicação HTML monolítica para **React 19 + TypeScript + Vite** com **Cloudflare Workers Static Assets (`ASSETS` binding)** e documentação informativa integrada na interface.

## Documentação das Funcionalidades
- **In-App**: Clique em **`? Documentação`** na barra superior, na aba **`4. Guia`** ou nos botões **`?`** de cada seção no painel lateral.
- **Técnica**: Consulte [docs/FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) para detalhes de todos os parâmetros, fórmulas do motor SVG e rotas da API Worker.

## Estrutura do Projeto

```text
├── worker/index.ts              # Cloudflare Worker (/api/health, /api/docs, /api/presets + env.ASSETS)
├── wrangler.jsonc               # Configuração Workers + Static Assets (SPA + run_worker_first)
├── vite.config.ts               # Vite + @vitejs/plugin-react + @cloudflare/vite-plugin
├── src/
│   ├── constants/
│   │   ├── defaults.ts          # Paletas, chave localStorage e estado padrão v2.3.0
│   │   └── featureDocs.ts       # Catálogo completo de documentação das funcionalidades
│   ├── engine/
│   │   ├── colorUtils.ts        # Utilitários matemáticos, XML e de cor
│   │   ├── svgPrimitives.ts     # Vidraças com <clipPath> e ornamentos superiores
│   │   ├── facadeLayout.ts      # Motor geométrico de seções, slots, colunas, ameias e níveis
│   │   ├── structuralDetailsRenderer.ts # Tijolos, cantaria, cunhais, jardim, escada e escada de incêndio
│   │   ├── windowRenderer.ts    # Renderizador procedural de janelas
│   │   ├── doorRenderer.ts      # Renderizador procedural de portas do térreo
│   │   └── facadeRenderer.ts    # Compositor SVG completo e exportação limpa
│   ├── context/FacadeContext.tsx
│   ├── components/              # Header, Sidebar, Abas, HelpPopover, DocsModal, Viewport, JsonModal
│   └── styles/index.css
└── docs/FUNCIONALIDADES.md
```

## Comandos

```bash
npm install          # Instala dependências
npm run cf-typegen   # Gera tipos Env do Wrangler (worker-configuration.d.ts)
npm run dev          # Inicia Vite + runtime Cloudflare Workers local
npm test             # Executa testes unitários do motor procedural (Vitest)
npm run build        # Compila TypeScript e gera bundle de produção em dist/
npm run preview      # Pré-visualiza build de produção localmente
npm run deploy       # Build e deploy no Cloudflare Workers
```
