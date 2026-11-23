import type { FeatureDocSection } from '../types/facade';

export const FEATURE_DOCS: FeatureDocSection[] = [
  {
    id: 'volumetria',
    category: 'Estrutura',
    tabLabel: '1. Estrutura Base',
    title: 'Volumetria & Pavimentos',
    summary:
      'Define a massa arquitetônica do edifício: número de pavimentos tipo, largura útil do corpo, densidade de vãos por andar e coroamento com ameias.',
    howItWorks:
      'O motor computeFacadeLayout empilha verticalmente cobertura (38u), cornija ajustável (16u–56u, padrão 38u), ático opcional (68u + cornija), N pavimentos tipo (126u + cornija cada) e térreo (156u). Cada alteração recalcula automaticamente as proporções dos vãos, pilastras e cotas altimétricas (1px = 0,028m).',
    parameters: [
      {
        name: 'Pavimentos Tipo',
        control: 'Slider (inpTypicalFloors)',
        rangeOrOptions: '1 a 6 (step 1)',
        defaultValue: '2',
        behavior:
          'Multiplica os andares intermediários. Cada pavimento adiciona 126u de parede + altura da cornija e cria slots TIPO_<andar>_SLOT_<i>.'
      },
      {
        name: 'Largura da Fachada',
        control: 'Slider (inpWidth)',
        rangeOrOptions: '220u a 520u (step 10)',
        defaultValue: '280u',
        behavior:
          'Define bodyWidth. Quando em balanço, as cornijas projetam +10u em cada lateral (corniceW = bodyWidth + 20u); quando rentes, corniceW = bodyWidth.'
      },
      {
        name: 'Janelas por Pavimento Tipo',
        control: 'Grupo Segmentado',
        rangeOrOptions: '2 | 3 | 4 | 5 | 6 Slots',
        defaultValue: '3 Slots',
        behavior:
          'Altera o ritmo de aberturas entre 2 e 6 janelas por andar, sincronizando o ático e preservando respiro para pilastras e cunhais.'
      },
      {
        name: 'Quantidade e Tipo de Ameias (Seteiras)',
        control: 'Grupo Segmentado + Select (selBattlementsStyle)',
        rangeOrOptions:
          '2 a 6 seteiras · Clássica | Escalonada | Arqueada | Frontão Central | Balaustrada',
        defaultValue: '4 · Clássica Retangular',
        behavior:
          'Define a silhueta do coroamento superior (merlões, degraus, arcos, frontão c/ óculo ou platibanda c/ balaústres), herda automaticamente a textura de tijolos/cantaria da parede e inclui pingadeira superior em pedra.'
      }
    ],
    tips: [
      'Aumente a Largura da Fachada para 340u–520u ao utilizar 5 ou 6 janelas por pavimento para manter proporções arquitetônicas clássicas.',
      'Os níveis à esquerda do SVG refletem a altura exata acumulada em metros a partir da cota +0.00m.'
    ]
  },
  {
    id: 'paredes-colunas-contornos',
    category: 'Estrutura',
    tabLabel: '1. Estrutura',
    title: 'Traço, Paredes, Tijolos & Faixas de Colunas',
    summary:
      'Controla o peso gráfico dos contornos (edificação e elementos), texturas procedurais de tijolos/pedra, cunhais laterais, dentículos de cornija e pilastras verticais.',
    howItWorks:
      'O motor gera padrões <pattern> para fiadas de tijolos ou cantaria (ashlar), adiciona blocos aparentes nas paredes, posiciona cunhais nas quinas e distribui faixas de colunas com base e capitel sem colidir com os slots de janela.',
    parameters: [
      {
        name: 'Espessura do Contorno da Edificação',
        control: 'Slider (inpBuildingStroke)',
        rangeOrOptions: '2.0u a 8.0u (step 0.5)',
        defaultValue: '5.0u',
        behavior:
          'Ajusta a espessura da linha externa da cobertura, paredes, embasamento e cornijas principais.'
      },
      {
        name: 'Espessura do Contorno dos Elementos',
        control: 'Slider (inpElementStroke)',
        rangeOrOptions: '1.0u a 4.5u (step 0.25)',
        defaultValue: '2.40u',
        behavior:
          'Controla proporcionalmente os traços de janelas, portas, colunas, cunhais, jardim, escada de entrada e escada de incêndio.'
      },
      {
        name: 'Detalhamento das Paredes',
        control: 'Select',
        rangeOrOptions:
          'Alvenaria Lisa | Tijolos Clássicos NY | Tijolos Detalhados + Blocos | Blocos de Cantaria (Ashlar)',
        defaultValue: 'Tijolos Clássicos NY',
        behavior:
          'Aplica textura vetorial de alvenaria e blocos acentuados sobre todas as paredes dos pavimentos e também sobre as ameias/seteiras da cobertura.'
      },
      {
        name: 'Faixas de Colunas / Pilastras',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Nenhuma | Central | Bordas | Entre Vãos',
        defaultValue: 'Entre Vãos',
        behavior:
          'Insere pilastras caneladas com capitel e base no centro, nas extremidades ou dividindo todas as prumadas de janelas.'
      },
      {
        name: 'Ornamento, Espessura & Alinhamento das Cornijas',
        control: 'Segmentados + Slider (inpCorniceHeight) + Switch Cunhais',
        rangeOrOptions:
          'Clássica | Dentículos | Mísulas · Altura 16u–56u · Com Balanço (+10u) / Rente (0u)',
        defaultValue: 'Dentículos · 38u · Com Balanço',
        behavior:
          'Escala proporcionalmente o corpo e o friso das cornijas (junto com dentículos/mísulas) e permite deixá-las rentes aos limites laterais do prédio (0u).'
      }
    ],
    tips: [
      'Combinar contorno da edificação em 5.0u–6.0u com contorno dos elementos em 2.0u–2.5u cria forte hierarquia de leitura técnica.'
    ]
  },
  {
    id: 'elementos-externos-fachada',
    category: 'Estrutura',
    tabLabel: '1. Estrutura',
    title: 'Elementos Externos: Toldo, Jardim, Escada & Escada de Incêndio',
    summary:
      'Adiciona elementos opcionais característicos das fachadas de Nova York: toldo comercial no térreo (logo abaixo da cornija), jardim no rodapé, escadaria frontal (stoop) e escada de incêndio metálica.',
    howItWorks:
      'Renderizados na camada #layer-exterior-elements: o toldo ancora-se abaixo da cornija do térreo cobrindo toda a fachada, só as portas ou só a vitrine; o jardim ocupa a base comercial sem obstruir a porta; a escada frontal alinha-se a TERREO_PORTA abaixo de +0.00m; e a escada de incêndio conecta as janelas da prumada selecionada.',
    parameters: [
      {
        name: 'Toldo no Térreo (Abrangência & Estilo)',
        control: 'Switch + 2 Grupos Segmentados',
        rangeOrOptions:
          'Abrangência: Térreo Inteiro | Só Porta(s) | Só Vitrine · Estilo: Listrado NY | Lona Sólida | Marquise Curva',
        defaultValue: 'Ligado (Só Vitrine · Listrado NY)',
        behavior:
          'Fixa toldo ou marquise abaixo da cornija do térreo em toda a fachada (full), acima das portas (door_only) ou sobre a vitrine (shop_only).'
      },
      {
        name: 'Jardim no Rodapé',
        control: 'Switch + Seletor de Estilo',
        rangeOrOptions: 'Gradil + Sebes | Floreira Pedra | Canteiro Floral',
        defaultValue: 'Ligado (Gradil + Sebes)',
        behavior:
          'Desenha mureta, gradil em ferro forjado ou floreira de pedra com folhagens em camadas e flores sob a vitrine.'
      },
      {
        name: 'Escada na Porta de Entrada',
        control: 'Switch + Seletor de Estilo',
        rangeOrOptions: 'Stoop Pedra | Corrimão Ferro | Degraus Largos',
        defaultValue: 'Ligado (Stoop Pedra)',
        behavior:
          'Renderiza degraus escalonados com muretas laterais (cheek walls) ou corrimãos metálicos sob TERREO_PORTA.'
      },
      {
        name: 'Escada de Incêndio na Fachada',
        control: 'Switch + Prumada',
        rangeOrOptions: '← Esquerda | Centro | Direita →',
        defaultValue: 'Desligado (Esquerda)',
        behavior:
          'Adiciona varandas gradeadas com mãos-francesas, lances diagonais em ziguezague entre andares, escada de cobertura e drop ladder no térreo.'
      }
    ],
    tips: [
      'Ative a Escada de Incêndio em edifícios com 2 a 6 pavimentos tipo para visualizar o ziguezague contínuo entre andares.'
    ]
  },
  {
    id: 'composicao-estrutural',
    category: 'Estrutura',
    tabLabel: '1. Estrutura Base',
    title: 'Composição Estrutural & Vitrine do Térreo',
    summary:
      'Controla elementos tectônicos complementares (ático, faixa vertical central, embasamento) e a organização da loja e acesso no pavimento térreo.',
    howItWorks:
      'O pavimento térreo é dividido pela regra de terços (1/3): cada porta ocupa até 1/3 da largura útil do pavimento. Com 1 Porta (esquerda ou direita), os 2/3 restantes abrigam 1 vitrine ampla ou 2 vitrines de 1/3; com 2 Portas + 1 Vitrine, os três módulos ocupam exatamente 1/3 + 1/3 + 1/3.',
    parameters: [
      {
        name: 'Pavimento Ático',
        control: 'Switch',
        rangeOrOptions: 'Ligado / Desligado',
        defaultValue: 'Ligado',
        behavior:
          'Adiciona o andar superior reduzido (68u) sincronizado com a prumada dos pavimentos tipo e sua própria cornija inferior.'
      },
      {
        name: 'Portas no Pavimento Térreo (até 1/3 cada)',
        control: 'Grupo Segmentado',
        rangeOrOptions: '1 Porta | 2 Portas + 1 Vitrine',
        defaultValue: '1 Porta',
        behavior:
          'Alterna entre TERREO_PORTA único (com 2/3 para vitrines) e duas entradas independentes (TERREO_PORTA + TERREO_PORTA_2) combinadas com 1 vitrine de 1/3.'
      },
      {
        name: 'Embasamento no Térreo (4 Modelos)',
        control: 'Switch + Select (selPlinthStyle)',
        rangeOrOptions:
          'Painel Clássico Moldurado | Cantaria Almofadada | Boiserie Comercial | Granito c/ Grelhas de Ventilação',
        defaultValue: 'Ligado · Painel Clássico Moldurado',
        behavior:
          'Adiciona rodapé contínuo (32u de altura) sob a vitrine com painéis rebaixados, blocos de pedra alternados, marcenaria ou grelhas de ventilação.'
      },
      {
        name: 'Posição / Arranjo da(s) Porta(s)',
        control: 'Grupo Segmentado',
        rangeOrOptions: '1 Porta: Esq / Dir · 2 Portas: 2 Esq / Extremidades / 2 Dir',
        defaultValue: 'Direita',
        behavior:
          'Posiciona TERREO_PORTA, TERREO_PORTA_2 e a zona da vitrine, espelhando automaticamente o embasamento e o jardim.'
      },
      {
        name: 'Layout da Vitrine no Térreo',
        control: 'Grupo Segmentado',
        rangeOrOptions: '2 Vitrines | 1 Vitrine Ampla (automático com 2 Portas)',
        defaultValue: '2 Vitrines',
        behavior:
          'Em 1 Porta, alterna entre gf-shop-0/gf-shop-1 e gf-shop-single; com 2 Portas, fixa 1 vitrine ocupando o 1/3 livre.'
      },
      {
        name: 'Ajuste da Vitrine no Vão',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Preencher Vão | Proporção do Módulo',
        defaultValue: 'Preencher Vão',
        behavior:
          'Em Preencher Vão (fillSlot), ignora widthPct/heightPct/aspectRatio para ocupar 100% do retângulo da vitrine sem distorcer espessuras de traço.'
      }
    ],
    tips: [
      'Use "2 Portas + 1 Vitrine" com arranjo "Extremidades" para compor fachadas simétricas com vitrine central de 1/3.',
      'Clique individualmente em TERREO_PORTA ou TERREO_PORTA_2 no SVG para atribuir módulos distintos a cada entrada.'
    ]
  },
  {
    id: 'paleta-estrutura',
    category: 'Estrutura',
    tabLabel: '1. Estrutura Base',
    title: 'Paleta da Estrutura',
    summary:
      'Gerencia presets cromáticos históricos de Nova York e personalização individual de cada camada construtiva do prédio.',
    howItWorks:
      'Os presets preenchem simultaneamente as 7 cores estruturais. Qualquer ajuste em um seletor individual altera o identificador da paleta para "custom" e atualiza automaticamente módulos de janela que estejam com sincronização ativa.',
    parameters: [
      {
        name: 'Presets Arquitetônicos',
        control: 'Grade de Paletas',
        rangeOrOptions: 'Ocre NY Clássico | Terracota Tijolo | Pedra Calcária | Grafite Urbano',
        defaultValue: 'Ocre NY Clássico',
        behavior:
          'Aplica conjuntos harmônicos de alvenaria, sombra sob cornijas, cantaria e contorno técnico.'
      },
      {
        name: 'Cores Individuais (9 canais)',
        control: 'Color Pickers',
        rangeOrOptions:
          'Parede, Sombra, Contorno, Cornija, Friso, Embasam./Faixa, Porta, Ferro/Escada, Toldo',
        defaultValue: 'Paleta #F3A847 / #FAF5E8 / #2E1412 / #A63A2B',
        behavior:
          'Atualiza em tempo real todas as camadas SVG; Contorno e Cornija alimentam módulos sincronizados e Toldo Térreo controla a cor da lona/marquise.'
      }
    ],
    tips: [
      'A cor de Sombra deve ser ~15% mais escura que a Parede para destacar a projeção das cornijas.',
      'O canal Porta define a base cromática do esboço provisório TERREO_PORTA.'
    ]
  },
  {
    id: 'preview-biblioteca-janelas',
    category: 'Janelas',
    tabLabel: '2. Janelas',
    title: 'Preview Isolado & Biblioteca de Módulos',
    summary:
      'Visualiza o módulo selecionado em escala isolada e permite criar, duplicar, editar e excluir presets reutilizáveis da biblioteca.',
    howItWorks:
      'O Preview Isolado adapta o slot virtual (136×86u para janelas largas ou aspectRatio > 1,15; 88×106u para verticais) exibindo a caixa tracejada do vão disponível. Toda edição reflete em tempo real no preview e em todos os slots da fachada que usam aquele módulo.',
    parameters: [
      {
        name: '+ Novo',
        control: 'Botão Primário',
        rangeOrOptions: 'Cria win-custom-<id>',
        defaultValue: '2×3 com verga e peitoril retos',
        behavior:
          'Adiciona um novo módulo editável à biblioteca sem sobrescrever presets existentes.'
      },
      {
        name: 'Duplicar',
        control: 'Botão',
        rangeOrOptions: 'Clona módulo ativo',
        defaultValue: 'Sufixo (Cópia)',
        behavior:
          'Cria variação independente mantendo todas as proporções, cores e ornamentos do módulo atual.'
      },
      {
        name: 'Excluir',
        control: 'Botão Perigo',
        rangeOrOptions: 'Bloqueado se restar 1 módulo',
        defaultValue: 'Requer >= 2 módulos',
        behavior:
          'Remove o módulo e reatribui automaticamente zonas e sobrescritas afetadas para o primeiro módulo restante.'
      }
    ],
    tips: [
      'Duplique "Janela NY 2x3 Clássica" antes de adicionar frontões ou consolos caso queira manter um pavimento diferente do outro.'
    ]
  },
  {
    id: 'geometria-janela',
    category: 'Janelas',
    tabLabel: '2. Janelas',
    title: 'Geometria, Base, Altura & Proporção',
    summary:
      'Define o enquadramento do módulo dentro do slot, restrição de aspect ratio e espessuras reais de moldura e pinázios.',
    howItWorks:
      'Calcula targetW e targetH a partir de widthPct e heightPct do slot. Se aspectRatio != "free", ajusta o retângulo inscrito preservando o centro do slot. Molduras e pinázios possuem teto proporcional (24% e 12% da menor dimensão) para evitar colapso em vãos pequenos como o ático.',
    parameters: [
      {
        name: 'Proporção (Aspect Ratio)',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Livre | 1:1 | 2:3 | 3:5 | 4:3 | 3:2 | 16:9',
        defaultValue: 'Livre',
        behavior:
          'Trava a razão largura/altura dentro da caixa percentual selecionada.'
      },
      {
        name: 'Base / Largura no Slot',
        control: 'Slider',
        rangeOrOptions: '50% a 105%',
        defaultValue: '100%',
        behavior: 'Escala horizontal relativa à largura do slot alvo.'
      },
      {
        name: 'Altura no Slot',
        control: 'Slider',
        rangeOrOptions: '45% a 105%',
        defaultValue: '100%',
        behavior: 'Escala vertical relativa à altura do slot alvo.'
      },
      {
        name: 'Espessura da Moldura Externa',
        control: 'Slider',
        rangeOrOptions: '3.0u a 12.0u (step 0.5)',
        defaultValue: '6.5u',
        behavior: 'Define o quadro externo de madeira/ferro da esquadria.'
      },
      {
        name: 'Espessura das Divisórias (Pinázios)',
        control: 'Slider',
        rangeOrOptions: '1.5u a 8.0u (step 0.5)',
        defaultValue: '4.0u',
        behavior: 'Define o espaçamento sólido entre as folhas de vidro.'
      }
    ],
    tips: [
      'Valores acima de 100% permitem que a esquadria avance levemente além do retângulo guia do slot.'
    ]
  },
  {
    id: 'divisao-vidracas-reflexos',
    category: 'Janelas',
    tabLabel: '2. Janelas',
    title: 'Divisão entre Vidraças & Reflexos',
    summary:
      'Subdivide o vão envidraçado em grade matricial, habilita bandeira superior (transom) e renderiza reflexos vetoriais recortados por vidraça.',
    howItWorks:
      'Cada folha de vidro recebe um <clipPath id="clip-<uid>-<r>-<c>"> exclusivo. Isso garante que os polígonos diagonais de reflexo nunca vazem sobre os pinázios ou moldura externa, mesmo após exportar o SVG.',
    parameters: [
      {
        name: 'Colunas de Vidraças',
        control: 'Grupo Segmentado',
        rangeOrOptions: '1 a 6 colunas',
        defaultValue: '2',
        behavior: 'Subdivide horizontalmente o vão descontando a espessura dos pinázios.'
      },
      {
        name: 'Linhas de Vidraças',
        control: 'Grupo Segmentado',
        rangeOrOptions: '1 a 5 linhas',
        defaultValue: '3',
        behavior: 'Subdivide verticalmente o vão em folhas iguais ou com bandeira.'
      },
      {
        name: 'Modo de Divisão Vertical',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Uniforme | Com Bandeira',
        defaultValue: 'Uniforme',
        behavior:
          'No modo Com Bandeira (transom), garante ao menos 2 linhas e aplica transomRatio (14% a 45%) à linha superior.'
      },
      {
        name: 'Estilo de Reflexo no Vidro',
        control: 'Select',
        rangeOrOptions:
          'Diagonal Clássico | Duplo Reflexo Paralelo | Reflexo Suave de Canto | Sem Reflexo',
        defaultValue: 'Diagonal Clássico',
        behavior: 'Desenha polígonos translúcidos dentro de cada clipPath de vidraça.'
      }
    ],
    tips: [
      'O modo "Com Bandeira" com 25%–30% é ideal para reproduzir janelas comerciais e brownstones clássicos de Nova York.'
    ]
  },
  {
    id: 'detalhes-arquitetonicos',
    category: 'Janelas',
    tabLabel: '2. Janelas',
    title: 'Detalhes Superior & Inferior (Vergas e Peitoris)',
    summary:
      'Adiciona elementos de cantaria acima e abaixo da esquadria — vergas, frisos, frontões triangulares, arcos com pedra-chave e peitoris com consolos.',
    howItWorks:
      'Os acabamentos acoplam-se às bordas superior (wy) e inferior (wy + h) do módulo usando detailScale como multiplicador de altura e projeção lateral. O friso secundário é derivado automaticamente via darkenHex(detailColor, 0.22).',
    parameters: [
      {
        name: 'Acabamento Superior (Verga / Cabeceira)',
        control: 'Select',
        rangeOrOptions:
          'Nenhum | Verga Reta | Verga Saliente c/ Friso | Frontão / Cornija Clássica | Arco Rebaixado c/ Pedra-Chave',
        defaultValue: 'Nenhum',
        behavior: 'Renderiza elementos arquitetônicos coroando a janela.'
      },
      {
        name: 'Acabamento Inferior (Peitoril / Base)',
        control: 'Select',
        rangeOrOptions:
          'Nenhum | Peitoril Reto | Peitoril Saliente c/ Friso | Peitoril Duplo (c/ Consolos)',
        defaultValue: 'Nenhum',
        behavior: 'Renderiza soleira inferior com projeção lateral e cachorros opcionais.'
      },
      {
        name: 'Altura / Projeção dos Detalhes',
        control: 'Slider',
        rangeOrOptions: '0.6× a 1.6× (step 0.1)',
        defaultValue: '1.0×',
        behavior: 'Escala altura e balanço horizontal de vergas e peitoris simultaneamente.'
      }
    ],
    tips: [
      'Quando usar "Frontão Clássico" ou "Arco Rebaixado", reduza Altura no Slot para 92%–96% para manter folga visual abaixo da cornija do andar.'
    ]
  },
  {
    id: 'cores-modulo',
    category: 'Janelas',
    tabLabel: '2. Janelas',
    title: 'Cores do Módulo & Sincronização',
    summary:
      'Personaliza esquadria, vidro e reflexo de cada módulo, com opção de herdar automaticamente as cores da cornija e do contorno do edifício.',
    howItWorks:
      'Quando "Sincronizar c/ Cornija" ou "Sincronizar c/ Prédio" estão marcados, o renderizador lê building.colors.cornice e building.colors.stroke em tempo real, preservando unidade visual mesmo quando a paleta da estrutura muda.',
    parameters: [
      {
        name: 'Esquadria / Vidro / Reflexo',
        control: '3 Color Pickers',
        rangeOrOptions: 'HEX livre',
        defaultValue: '#8F5B3C / #63B0DF / #B4E1FA',
        behavior: 'Define o material da moldura, tonalidade do vidro e brilho.'
      },
      {
        name: 'Detalhes (Verga / Peitoril)',
        control: 'Color Picker + Checkbox Sincronizar',
        rangeOrOptions: 'Sincronizado com Cornija ou HEX custom',
        defaultValue: 'Sincronizado',
        behavior: 'Permite cantaria uniforme com as cornijas ou pedra contrastante.'
      },
      {
        name: 'Contorno da Esquadria',
        control: 'Color Picker + Checkbox Sincronizar',
        rangeOrOptions: 'Sincronizado com Prédio ou HEX custom',
        defaultValue: 'Sincronizado',
        behavior: 'Mantém a espessura e cor de linha coerentes com a fachada.'
      }
    ],
    tips: [
      'Desmarque a sincronização de detalhes quando quiser criar vergas de tijolo escuro ou ferro fundido.'
    ]
  },
  {
    id: 'preview-biblioteca-portas',
    category: 'Portas',
    tabLabel: '3. Portas',
    title: 'Preview Isolado & Biblioteca de Portas',
    summary:
      'Visualiza o módulo de porta ancorado no piso térreo em escala isolada e permite criar, duplicar, editar e excluir presets na doorLibrary.',
    howItWorks:
      'O palco isolado usa um vão de referência representando até 1/3 da largura útil do pavimento térreo (96×120u) com linha de piso (+0.00m). Todas as edições refletem instantaneamente em TERREO_PORTA e TERREO_PORTA_2.',
    parameters: [
      {
        name: 'Presets Iniciais (4 módulos)',
        control: 'Lista da Biblioteca',
        rangeOrOptions:
          'Porta NY Clássica 2 Painéis | Porta Comercial c/ Bandeira | Portal Duplo Clássico NY | Entrada c/ Lateral Fixa',
        defaultValue: 'door-ny-classic',
        behavior:
          'Fornece tipologias prontas cobrindo acessos residenciais tradicionais, lojas com numeração e portais monumentais.'
      },
      {
        name: '+ Novo / Duplicar / Excluir',
        control: 'Ações CRUD',
        rangeOrOptions: 'Requer >= 1 módulo restante ao excluir',
        defaultValue: 'Nova Porta em meio-vidro c/ bandeira',
        behavior:
          'Gerencia doorLibrary e reatribui automaticamente slotAssignments.door ou sobrescritas em TERREO_PORTA caso o módulo em uso seja excluído.'
      }
    ],
    tips: [
      'A porta sempre ancora pela base inferior do slot (wy = slotRect.y + slotRect.height - h) para permanecer nivelada ao solo (+0.00m).'
    ]
  },
  {
    id: 'folhas-bandeira-porta',
    category: 'Portas',
    tabLabel: '3. Portas',
    title: 'Tipologia de Folhas, Sidelight & Bandeira com Número',
    summary:
      'Configura portas de folha única, folha dupla simétrica ou com painel lateral fixo (sidelight), além de bandeira superior envidraçada opcional.',
    howItWorks:
      'O vão útil interno é dividido verticalmente primeiro pela bandeira superior (16%–38%) quando ativa, e depois horizontalmente conforme o layout: folha única (100%), dupla simétrica (2 × 50% com astrágalo central) ou sidelight (lateral simples 28%/72% ou dupla 22%/56%/22%).',
    parameters: [
      {
        name: 'Configuração de Folhas',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Folha Única | Dupla | Sidelight',
        defaultValue: 'Folha Única',
        behavior:
          'Define a subdivisão horizontal das folhas e posiciona maçanetas automaticamente nas bordas de abertura.'
      },
      {
        name: 'Lado da Lateral Fixa (Sidelight)',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Esquerda | Ambas | Direita',
        defaultValue: 'Esquerda',
        behavior: 'Escolhe se o visor lateral fixo fica à esquerda, à direita ou flanqueando ambos os lados da folha principal.'
      },
      {
        name: 'Largura no Vão (até 1/3) / Altura (até a Cornija) & Batente',
        control: '3 Sliders',
        rangeOrOptions: 'Largura 55%–100% de 1/3 · Altura 55%–100% até a cornija · Batente 3.0u–9.0u',
        defaultValue: '82%–100% / 74%–84% / 5.5u',
        behavior:
          'Controla a ocupação horizontal no terço do térreo e a altura até a face inferior da cornija (descontando ornamentos superiores).'
      },
      {
        name: 'Bandeira Superior (Transom) + Placa de Número',
        control: 'Switch + Slider + Colunas (1–4) + Texto',
        rangeOrOptions: 'Altura 16%–38% · 1 a 4 vidros · Número até 6 caracteres',
        defaultValue: 'Desligada (22%, 1 col)',
        behavior:
          'Adiciona travessa e visor superior com clipPath e renderiza placa moldurada centralizada com a numeração predial.'
      }
    ],
    tips: [
      'Em edifícios comerciais, preencha o campo Número do Edifício (ex.: "241") junto com a Bandeira Superior para identificação imediata do endereço.'
    ]
  },
  {
    id: 'paineis-ferragens-porta',
    category: 'Portas',
    tabLabel: '3. Portas',
    title: 'Painéis Almofadados, Visores de Vidro & Ferragens',
    summary:
      'Define o desenho interno de cada folha entre madeira almofadada, meio-vidro com grade de pinázios ou vidro integral comercial, além de maçanetas e kickplate.',
    howItWorks:
      'Folhas sólidas geram almofadas em baixo-relevo (2 ou 4 painéis). Folhas meio-vidro e vidro integral subdividem a área envidraçada em colunas × linhas (1–3) usando <clipPath> individual por vidraça para manter os reflexos contidos.',
    parameters: [
      {
        name: 'Estilo da Folha',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Almofadada | Meio-Vidro | Vidro Total',
        defaultValue: 'Almofadada',
        behavior: 'Alterna entre painéis opacos em relevo, visor superior ou folha comercial envidraçada.'
      },
      {
        name: 'Grade do Visor (Colunas × Linhas) & Altura do Vidro',
        control: 'Grupos Segmentados + Slider',
        rangeOrOptions: '1–3 Colunas · 1–3 Linhas · Altura 35%–70%',
        defaultValue: '1×2 · 52%',
        behavior: 'Controla o quadriculado de pinázios do visor envidraçado.'
      },
      {
        name: 'Maçaneta / Puxador & Kickplate',
        control: 'Grupo Segmentado + Switch',
        rangeOrOptions: 'Clássica (Knob) | Puxador Vertical | Nenhum · Kickplate Ligado/Desligado',
        defaultValue: 'Clássica · Sem Kickplate',
        behavior:
          'Desenha ferragens espelhadas em portas duplas ou no lado de abertura e chapa metálica protetora na base.'
      }
    ],
    tips: [
      'Combine "Vidro Total" + "Puxador Vertical" + "Kickplate" para fachadas de lojas contemporâneas ou cafeterias.'
    ]
  },
  {
    id: 'portal-soleira-cores',
    category: 'Portas',
    tabLabel: '3. Portas',
    title: 'Portal Arquitetônico, Pilastras, Degraus NY & Cores',
    summary:
      'Adiciona molduras monumentais ao redor da entrada (vergas, frontão, arco, pilastras laterais e degraus de acesso) e sincronização cromática com o edifício.',
    howItWorks:
      'Pilastras laterais acoplam-se externamente ao batente com base e capitel, ampliando automaticamente o balanço da verga superior e dos degraus. As cores de Folha, Portal e Contorno podem sincronizar em tempo real com building.colors.',
    parameters: [
      {
        name: 'Cabeceira / Verga Superior',
        control: 'Select',
        rangeOrOptions: 'Nenhuma | Verga Reta | Cornija Saliente | Frontão Clássico | Arco c/ Pedra-Chave',
        defaultValue: 'Nenhuma',
        behavior: 'Aplica coroamento superior com projeção escalável (0.6× a 1.5×).'
      },
      {
        name: 'Pilastras Laterais Clássicas',
        control: 'Switch',
        rangeOrOptions: 'Ligado / Desligado',
        defaultValue: 'Desligado',
        behavior: 'Flanqueia o batente com duas pilastras verticais em cantaria.'
      },
      {
        name: 'Base / Soleira',
        control: 'Grupo Segmentado',
        rangeOrOptions: 'Nenhuma | Soleira | 2 Degraus NY',
        defaultValue: 'Nenhuma',
        behavior: 'Renderiza soleira em pedra ou dois degraus escalonados na base (estilo stoop nova-iorquino).'
      },
      {
        name: 'Sincronização de Cores',
        control: '3 Checkboxes + Pickers',
        rangeOrOptions: 'Folha ↔ Porta · Portal ↔ Cornija · Contorno ↔ Prédio',
        defaultValue: 'Todas ativas no preset clássico',
        behavior: 'Mantém unidade automática ao trocar a paleta do edifício ou permite cores independentes.'
      }
    ],
    tips: [
      'Ative Pilastras + Frontão Clássico + 2 Degraus NY no preset "Portal Duplo Clássico NY" para fachadas institucionais ou residenciais de alto padrão.'
    ]
  },
  {
    id: 'interpolacao-slots',
    category: 'Interpolação',
    tabLabel: '4. Slots',
    title: 'Atribuição por Zona & Sobrescritas Individuais',
    summary:
      'Mapeia módulos das bibliotecas para zonas inteiras (Pavimentos Tipo, Ático, Térreo Vitrines e Porta Principal) e permite exceções cirúrgicas por slot clicando no SVG.',
    howItWorks:
      'A resolução de cada slot segue a precedência: slotOverrides[slot.id] -> slotAssignments[slot.zone] -> fallback primeiro módulo. Isso vale tanto para janelas quanto para TERREO_PORTA.',
    parameters: [
      {
        name: 'Pavimentos Tipo / Ático / Térreo Vitrines / Térreo Porta',
        control: '4 Selects de Zona',
        rangeOrOptions: 'Qualquer módulo de windowLibrary ou doorLibrary',
        defaultValue: 'win-ny-classic / win-attic-1x1 / win-ground-2x3 / door-ny-classic',
        behavior: 'Define o módulo herdado por todos os slots da respectiva zona.'
      },
      {
        name: 'Seleção Direta no SVG (.slot-hitbox)',
        control: 'Clique no Canvas SVG',
        rangeOrOptions: 'Qualquer slot de janela ou TERREO_PORTA',
        defaultValue: 'Nenhum selecionado',
        behavior:
          'Seleciona o slot, abre a aba 4. Slots e exibe o seletor de sobrescrita individual ou retorno à herança (__inherit__).'
      },
      {
        name: 'Exibir Módulo da Porta na Prancheta',
        control: 'Switch',
        rangeOrOptions: 'Módulo da Biblioteca | Guia Tracejada',
        defaultValue: 'Módulo da Biblioteca',
        behavior:
          'Permite ocultar temporariamente a porta na prancheta interativa (na exportação SVG, a porta é sempre renderizada).'
      }
    ],
    tips: [
      'Passe o mouse sobre qualquer janela ou sobre a porta na prancheta para ver ID do slot, dimensões em pixels e módulo atribuído no tooltip flutuante.'
    ]
  },
  {
    id: 'ferramentas-viewport-export',
    category: 'Ferramentas & Edge',
    tabLabel: 'Topbar & Viewport',
    title: 'Guias, Cotas, JSON Data-Driven, Exportação SVG & Cloudflare Workers',
    summary:
      'Ferramentas técnicas de prancheta, inspeção/importação do estado JSON completo, exportação vetorial limpa e entrega via Cloudflare Workers Static Assets.',
    howItWorks:
      'A renderização interativa inclui camadas de guias (#layer-interaction) e cotas (#layer-dimensions). Na exportação SVG, cleanExport: true remove essas camadas auxiliares e emite um arquivo XML autônomo pronto para Illustrator, Figma ou impressão. Em telas móveis 9:16 (<= 920px), a interface reorganiza-se em Bottom Sheet retrátil (collapsed/half/full), barra inferior fixa para o polegar, gesto pinch-to-zoom e HUD flutuante ao tocar em slots. Em produção, o Worker em worker/index.ts serve a SPA via env.ASSETS e responde rotas /api/* primeiro.',
    parameters: [
      {
        name: 'Guias de Slots',
        control: 'Botão Toggle (Topbar / Menu ⋮)',
        rangeOrOptions: 'Ligado / Desligado',
        defaultValue: 'Desligado',
        behavior: 'Mostra caixas tracejadas e etiquetas com o ID exato de cada slot (ex: TIPO_1_SLOT_1).'
      },
      {
        name: 'Cotas / Níveis',
        control: 'Botão Toggle (Topbar / Menu ⋮)',
        rangeOrOptions: 'Ligado / Desligado',
        defaultValue: 'Ligado',
        behavior: 'Exibe régua de largura (L), altura total (H) e elevação em metros de cada piso.'
      },
      {
        name: 'Zoom da Prancheta & Pinch Touchscreen',
        control: 'Toolbar Flutuante (− / % / + / FIT) + Gesto Pinça',
        rangeOrOptions: '40% a 220% (FIT inteligente no mobile 9:16)',
        defaultValue: '100% Desktop · Auto-Fit Mobile',
        behavior: 'Permite pinça com dois dedos em telas touch e auto-enquadramento da fachada na proporção 9:16 sem alterar o SVG exportado.'
      },
      {
        name: 'Navegação Mobile (Bottom Dock & Bottom Sheet)',
        control: 'Barra Inferior + Gaveta Retrátil em 3 Níveis',
        rangeOrOptions: 'collapsed (Prancheta) | half (Split 9:16) | full (Expandido)',
        defaultValue: 'half (Split 50/50)',
        behavior: 'Permite arrastar a alça ou alternar rapidamente entre visualização de tela cheia da fachada e edição com alvos táteis >= 44px.'
      },
      {
        name: 'JSON do Projeto',
        control: 'Modal Schema Data-Driven',
        rangeOrOptions: 'Inspecionar, Copiar, Recarregar, Importar',
        defaultValue: 'Sincronizado via localStorage',
        behavior:
          'Permite versionar, compartilhar ou restaurar projetos completos (building, windowLibrary, doorLibrary, slotAssignments, slotOverrides).'
      },
      {
        name: 'Exportar SVG',
        control: 'Botão Primário (Topbar / Menu ⋮)',
        rangeOrOptions: 'Download .svg limpo',
        defaultValue: 'ny-facade-etapa2-4-<N>pav.svg',
        behavior: 'Gera XML SVG puro sem hitboxes, seleção ou marcações de guia.'
      }
    ],
    tips: [
      'Todas as alterações são gravadas automaticamente em localStorage na chave ny_facade_studio_v2_1_state.',
      'As rotas /api/health, /api/docs e /api/presets ficam disponíveis diretamente no Cloudflare Worker.'
    ]
  }
];
