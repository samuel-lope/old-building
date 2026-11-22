# Documentação Completa das Funcionalidades — NY Facade Studio (Etapa 2.1)

O **NY Facade Studio** é um estúdio paramétrico e data-driven para composição procedural de fachadas históricas de Nova York em SVG vetorial, rodando em **React 19 + TypeScript + Vite** e servido na borda pelo **Cloudflare Workers com Static Assets (`ASSETS` binding)**.

---

## 1. Arquitetura Cloudflare Workers + React SPA

- **Static Assets (`env.ASSETS`)**: O build do Vite gera o bundle cliente React + CSS dentro de `dist/client`. Em produção, rotas da interface SPA são atendidas diretamente pela rede edge do Cloudflare com `not_found_handling: "single-page-application"`.
- **Worker Entrypoint (`worker/index.ts`)**: Intercepta explicitamente rotas `/api/*` (`run_worker_first: ["/api/*"]`) e delega qualquer outra requisição a `env.ASSETS.fetch(request)`.
- **Endpoints disponíveis**:
  - `GET /api/health` — status, versão e runtime do serviço.
  - `GET /api/docs` — retorna o catálogo JSON estruturado (`FEATURE_DOCS`) utilizado pela própria interface de documentação.
  - `GET /api/presets` — retorna as paletas arquitetônicas (`BUILDING_PALETTES`) e a biblioteca padrão de módulos de janela.

---

## 2. Fluxo de Trabalho na Interface

1. **Aba `1. Estrutura`**: Configure volumetria (pavimentos, largura, slots, seteiras), composição (ático, faixa vertical central, embasamento, posição da porta, layout de 1 ou 2 vitrines) e paleta de cores do edifício.
2. **Aba `2. Janelas`**: Crie, duplique ou edite módulos de janela reutilizáveis na biblioteca visualizando o resultado em tempo real no **Preview Isolado**.
3. **Aba `3. Portas`**: Modele portas de entrada do térreo (`TERREO_PORTA`) com folhas simples, duplas ou sidelight, bandeira superior com numeração, painéis almofadados ou envidraçados, ferragens, pilastras e degraus.
4. **Aba `4. Slots`**: Atribua um módulo padrão por zona (`typical`, `attic`, `ground`, `door`) ou clique diretamente em qualquer janela ou porta no SVG para aplicar uma sobrescrita individual.
5. **Aba `5. Guia` & Botões `?`**: Consulte ajuda contextual diretamente dentro de cada card de controle ou abra a **Central de Documentação Interativa** pelo cabeçalho.

---

## 3. Detalhamento de Todas as Funcionalidades

### 3.1. Volumetria, Traço, Paredes & Elementos Externos (`1. Estrutura`)
| Parâmetro | Faixa / Opções | Padrão | Regra Procedural |
| --- | --- | --- | --- |
| **Pavimentos Tipo** | `1` a `6` | `2` | Cada andar adiciona `126u` de alvenaria + `38u` de cornija/friso (`26u` + `12u`) e gera `TIPO_<andar>_SLOT_<i>`. |
| **Largura da Fachada** | `220u` a `520u` (step `10`) | `280u` | Define `bodyWidth`. Cornijas projetam `+10u` de cada lado (`corniceWidth = bodyWidth + 20u`). |
| **Janelas por Pavimento Tipo** | `2` a `6` Slots | `3 Slots` | Subdivide o pavimento respeitando cunhais e faixas de colunas; ajusta o ático para `max(3, count)` slots. |
| **Seteiras (Ameias)** | `2` a `6` | `4` | `buildBattlementsPath` calcula merlões e rebaixos na razão `1 : 1.12` com `38u` de altura total. |
| **Contorno Edificação / Elementos** | `2.0u–8.0u` / `1.0u–4.5u` | `5.0u` / `2.40u` | Separa a hierarquia de traço da massa construtiva e dos detalhes internos de janelas, portas e gradis. |
| **Detalhamento das Paredes** | Lisa, Tijolos Clássicos, Tijolos Detalhados, Cantaria | `Tijolos Clássicos NY` | Aplica `<pattern>` de alvenaria, blocos acentuados, cunhais (`hasQuoins`) e cornijas c/ dentículos ou mísulas. |
| **Faixas de Colunas** | `Nenhuma`, `Central`, `Bordas`, `Entre Vãos` | `Entre Vãos` | Renderiza pilastras caneladas com base e capitel sem sobrepor os vãos de janela. |
| **Jardim no Rodapé** | `Gradil + Sebes`, `Floreira Pedra`, `Canteiro Floral` | `Ligado` | Ocupa o rodapé sob a vitrine evitando `TERREO_PORTA`. |
| **Escada na Porta (Stoop)** | `Stoop Pedra`, `Corrimão Ferro`, `Degraus Largos` | `Ligado` | Escadaria frontal ancorada sob `TERREO_PORTA`. |
| **Escada de Incêndio** | `Esquerda`, `Centro`, `Direita` | `Desligado` | Varandas gradeadas por andar, mãos-francesas, ziguezague diagonal e drop ladder no térreo. |

### 3.2. Composição Estrutural & Regra de Terços no Térreo (`1. Estrutura`)
- **Pavimento Ático**: Ativa/desativa o andar superior reduzido (`68u`) sincronizado com as prumadas dos pavimentos tipo e sua própria cornija inferior.
- **Embasamento no Térreo**: Rodapé de `32u` de altura posicionado estritamente sob a área da vitrine (`shopArea`), sem sobrepor portas.
- **Portas no Térreo (Regra de `1/3` — Etapa 2.4)**:
  - `1 Porta`: `TERREO_PORTA` ocupa até `1/3` da largura útil do pavimento térreo (à esquerda ou à direita), restando `2/3` para `2 Vitrines` ou `1 Vitrine Ampla`.
  - `2 Portas + 1 Vitrine`: `TERREO_PORTA`, `TERREO_PORTA_2` e `gf-shop-single` dividem o térreo em `1/3 + 1/3 + 1/3`, com arranjo à esquerda (`2 Esq`), nas extremidades (`Extremidades`, com vitrine central) ou à direita (`2 Dir`).
- **Ajuste da Vitrine no Vão**:
  - `Preencher Vão` (`fill`): força `targetW = slotRect.width` e `targetH = slotRect.height` recalculando moldura, pinázios e reflexos sem distorção de traço.
  - `Proporção do Módulo` (`proportional`): respeita `widthPct`, `heightPct` e `aspectRatio` configurados no módulo.

### 3.3. Paleta da Estrutura (`1. Estrutura`)
- **4 Presets Arquitetônicos**: `Ocre NY Clássico`, `Terracota Tijolo`, `Pedra Calcária` e `Grafite Urbano`.
- **7 Canais de Cor Independentes**: `wall`, `wallShadow`, `stroke`, `cornice`, `corniceFrieze`, `plinthBand`, `door`. Editar qualquer canal muda `paletteId` para `'custom'`.

### 3.4. Preview Isolado & Biblioteca de Módulos (`2. Janelas`)
- **Preview Isolado**: Renderiza o módulo selecionado em um slot virtual adaptativo (`136×86u` para proporções largas `aspectRatio > 1.15` ou `cols >= 4`; `88×106u` para janelas verticais) com contorno tracejado do vão.
- **CRUD de Biblioteca**:
  - `+ Novo`: adiciona `win-custom-<id>` com configuração `2×3` e verga/peitoril retos.
  - `Duplicar`: cria cópia exata do módulo em edição.
  - `Excluir`: remove o módulo (bloqueado quando resta apenas `1` módulo) e migra automaticamente zonas e sobrescritas órfãs para o primeiro módulo da biblioteca.

### 3.5. Geometria, Vidraças, Reflexos e Ornamentos (`2. Janelas`)
- **Aspect Ratio**: `Livre`, `1:1`, `2:3`, `3:5`, `4:3`, `3:2`, `16:9`.
- **Escala no Slot**: `widthPct` (`50%`–`105%`) e `heightPct` (`45%`–`105%`).
- **Espessuras Seguras**: Moldura (`3.0u`–`12.0u`, limitada a `24%` da menor dimensão do slot) e Pinázios (`1.5u`–`8.0u`, limitados a `12%` da menor dimensão).
- **Grade de Vidraças**: `1` a `6` colunas × `1` a `5` linhas.
- **Divisão Vertical**: `Uniforme` ou `Com Bandeira` (`transomRatio` de `14%` a `45%` na fileira superior; força no mínimo `2` linhas).
- **Reflexos com `<clipPath>`**: `Diagonal Clássico`, `Duplo Reflexo Paralelo`, `Reflexo Suave de Canto` ou `Sem Reflexo`. Cada vidraça possui seu próprio `<clipPath>` evitando qualquer vazamento sobre os pinázios.
- **Acabamentos Superior e Inferior**:
  - Superior (`topDetail`): `none`, `lintel_flat`, `lintel_cornice`, `pediment`, `arch` (com pedra-chave).
  - Inferior (`bottomDetail`): `none`, `sill_flat`, `sill_cornice`, `sill_corbels` (consolos laterais).
  - Escala (`detailScale`): `0.6×` a `1.6×`.
- **Sincronização de Cores do Módulo**: Opções independentes para sincronizar cor dos detalhes com `building.colors.cornice` e cor do contorno com `building.colors.stroke`.

### 3.6. Construtor de Módulos de Portas (`3. Portas` — Etapas 2.2 / 2.4)
- **Biblioteca `doorLibrary` (4 Presets Iniciais)**:
  - `door-ny-classic`: Porta NY Clássica 2 Painéis (`widthPct: 82%` de `1/3`, folha única sólida sincronizada com a cor do prédio).
  - `door-shop-transom`: Porta Comercial meio-vidro c/ bandeira numerada (`widthPct: 90%` de `1/3`, placa `"241"`, kickplate e soleira).
  - `door-double-grand`: Portal Duplo Clássico NY (`widthPct: 100%` de `1/3`, frontão, pilastras contidas no terço e 2 degraus NY).
  - `door-sidelight-modern`: Entrada c/ Lateral Fixa (`widthPct: 100%` de `1/3`, sidelight, vidro integral e puxador vertical).
- **Configurações Estruturais de Folhas, Bandeira & Dimensões**:
  - `widthPct` (`55%`–`100%` de `1/3` do térreo) e `heightPct` (`55%`–`100%`, alcançando até a base da cornija do térreo, descontando automaticamente a altura de vergas/frontões).
  - `leafLayout`: `single` (1 folha), `double` (2 folhas simétricas c/ astrágalo central) e `sidelight` (lateral fixa à esquerda `left`, à direita `right` ou em ambos os lados `both`).
  - `hasTransom`: Bandeira superior (`16%`–`38%` da altura interna), `1` a `4` divisões de vidro e placa de numeração predial (`transomNumber`).
- **Composição Interna & Ferragens**:
  - `panelStyle`: `solid_panels` (2 ou 4 almofadas em baixo-relevo), `half_glass` (`glassRatio` 35%–70% + base almofadada) e `full_glass`.
  - Grade de vidro `glassCols × glassRows` (`1–3 × 1–3`) com `<clipPath>` individual por vidraça.
  - `handleStyle`: maçaneta clássica (`knob_classic`), puxador vertical (`handle_vertical`) ou `none`; `hasKickplate` opcional.
- **Ornamentos Externos & Sincronização**:
  - Cabeceira/Verga (`topDetail`), **Pilastras Laterais Clássicas** (`hasPilasters`) e **Base/Soleira** (`none`, `sill_stone`, `double_step` estilo stoop NY).
  - Sincronização independente de `leafColor` com `building.colors.door`, `detailColor` com `cornice` e `strokeColor` com `stroke`.

### 3.7. Interpolação & Sobrescritas (`4. Slots`)
- **Atribuição por Zona**: Define o módulo padrão para `typical`, `attic`, `ground` (janelas/vitrines) e `door` (`TERREO_PORTA`).
- **Sobrescrita Individual (`slotOverrides`)**: Clicar em qualquer janela ou na porta no SVG seleciona o slot correspondente e permite escolher um módulo específico ou retornar à herança da zona (`__inherit__`).
- **Visibilidade da Porta na Prancheta**: Alterna entre exibir o módulo da biblioteca ou guia hachurada no modo interativo (na exportação SVG limpa a porta é sempre renderizada).

### 3.8. Ferramentas de Prancheta, JSON & Exportação
- **Guias de Slots**: Exibe retângulos tracejados e rótulos com o ID de cada slot (`ATICO_SLOT_1`, `TIPO_1_SLOT_2`, `gf-shop-single`, `TERREO_PORTA`, etc.).
- **Cotas / Níveis**: Mostra largura `L:<w>u`, altura `H:<h>u` e régua altimétrica convertida para metros (`(bottomY - py) * 0.028`).
- **Zoom**: `40%` a `220%` (`−`, `+`, `FIT`).
- **JSON do Projeto**: Modal para inspecionar, copiar, recarregar e importar o estado completo (`building`, `windowLibrary`, `doorLibrary`, `slotAssignments`, `slotOverrides`).
- **Exportar SVG**: Baixa `ny-facade-etapa2-2-<N>pav.svg` com `cleanExport: true` (sem camadas de interação ou guias).
- **Persistência**: Salvamento automático e migração segura em `localStorage` (`ny_facade_studio_v2_1_state`).
