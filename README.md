# WorldPanel — Painel Econômico Global

Painel web local para análise macroeconômica, qualidade de vida e planejamento de mudança internacional. Funciona direto no navegador, sem instalação de dependências — basta abrir o `index.html`.

Desenvolvido com foco em **casais jovens com cidadania UE** interessados em morar na Europa (especialmente Itália), mas útil para qualquer comparação entre ~41 países.

---

## Como usar

1. Clone ou baixe esta pasta.
2. Abra `index.html` no navegador (Chrome, Firefox ou Edge recomendados).
3. Na primeira visita com internet, o painel busca dados na API do World Bank e preenche o cache local.
4. Nas visitas seguintes, os dados carregam mais rápido a partir do `localStorage`.

> **Dica:** Para evitar limitações do protocolo `file://`, você pode servir a pasta com um servidor local simples:
>
> ```bash
> npx serve .
> ```
>
> ou, com Python:
>
> ```bash
> python -m http.server 8080
> ```

---

## Abas do painel

| Aba | Descrição |
|-----|-----------|
| **Visão Geral** | KPIs, tabelas por categoria (macro, mercado de trabalho, fiscal…) e gráficos de ranking |
| **Histórico** | Até 8 indicadores por país, séries desde 1960+, correlação, variações anuais, governantes e eventos |
| **Qualidade** | IDH, felicidade, Gini, saúde, educação e segurança |
| **Mudança** | Score de expatriação, simulador salarial e ranking de destinos |
| **Guias País** | Passo a passo de mudança, dificuldade, documentos UE e plano completo para a Itália |
| **Planejamento** | Anotações, tarefas e metas pessoais (salvas no navegador) |
| **Comparar** | Um indicador × até 6 países no mesmo gráfico |
| **Fórmulas** | 14 fórmulas econômicas explicadas + simulador família UE |
| **Análise** | Conclusões automáticas a partir dos dados carregados |
| **Config** | Países ativos, intervalo de refresh e estatísticas do cache |

---

## Estrutura do projeto

```
Economy/
├── index.html          # Interface, CSS e layout
├── world-data.js       # Países, indicadores, dados embutidos, bandeiras
├── world-db.js         # Cache World Bank + fotos de governantes (localStorage)
├── world-app.js        # Lógica principal, API, KPIs e tabelas
├── world-formulas.js   # Fórmulas e simulador família UE
├── world-guides.js     # Guias por país e plano Itália (cidades, aluguel, hustles)
├── world-planner.js    # Anotações e tarefas de planejamento
├── world-leaders.js    # Governantes, ministros, eventos históricos e fotos Wikipedia
├── world-history.js    # Gráficos históricos, correlação e painel de governantes
├── world-compare.js    # Comparativo multi-país + vista lado a lado
├── world-ux.js         # Navegação, hero, deep linking, loading
├── world-prefs.js      # Favoritos, watchlist, anotações, tema, exportações
└── assets/
    ├── cities/         # Fotos das cidades italianas (plano Itália)
    └── leaders/        # Fotos locais de governantes (fallback offline)
```

### Ordem dos scripts

Os arquivos JS devem ser carregados nesta ordem (já configurada no `index.html`):

`world-data.js` → `world-db.js` → `world-formulas.js` → `world-guides.js` → `world-planner.js` → `world-leaders.js` → `world-app.js` → `world-history.js` → `world-compare.js` → `world-ux.js` → `world-prefs.js` → `initUX()`

---

## Fontes de dados

| Fonte | Uso |
|-------|-----|
| [World Bank Open Data API](https://data.worldbank.org/) | PIB, inflação, desemprego, dívida, comércio, séries históricas |
| Dados embutidos (`world-data.js`) | IDH, felicidade, custo de vida, salários, índices de migração |
| UNESCO / PNUD / ONU | Alfabetização histórica, IDH, World Happiness Report |
| [Wikipedia](https://www.wikipedia.org/) | Fotos de governantes (cache em `LeaderDB`) |
| [flagcdn.com](https://flagcdn.com) | Bandeiras dos países |

---

## Cache local (banco de dados)

O painel usa `localStorage` do navegador em duas chaves:

| Chave | Conteúdo |
|-------|----------|
| `worldpanel_cache_v2` | Séries históricas da API World Bank (refresh a cada 24h) |
| `worldpanel_leaders_v1` | URLs de fotos de governantes buscadas na Wikipedia |

Para limpar o cache: aba **Config** → botão de limpar, ou apague os dados do site nas configurações do navegador.

---

## Destaques por módulo

### Governantes (`world-leaders.js`)

- Mandatos, medidas e consequências por país
- Fotos via Wikipedia com fallback e cache persistente
- Ministros e feitos **separados por pasta ministerial** (Brasil completo)
- Decretos e leis com links oficiais quando disponíveis
- Eventos econômicos mapeados no gráfico histórico

### Plano Itália (`world-guides.js`)

- Tabela de cidades com aluguel estimado (2024/25)
- Orçamento mensal para casal
- Plataformas de trabalho remoto e side hustles
- Cronograma de 90 dias e links úteis (Immobiliare, ENIC-NARIC, INPS…)

### Histórico (`world-history.js`)

- Seleção de até 8 indicadores simultâneos
- Correlação entre séries
- Causas por ano e governante no período
- Marcadores de eventos (Plano Real, COVID, etc.)

---

## Requisitos

- Navegador moderno com JavaScript habilitado
- Conexão com internet na primeira carga (API World Bank, Wikipedia, CDNs)
- Nenhum Node.js, npm ou build obrigatório

### Dependências externas (CDN)

- [Chart.js 4.4](https://www.chartjs.org/) — gráficos
- [Google Fonts — Inter](https://fonts.google.com/) — tipografia

## Melhorias UX (v2)

- **Hero de boas-vindas** com CTA e cards de destaque (dispensável)
- **Navegação em 4 grupos**: Explorar · Países · Ferramentas · Sistema
- **Menu mobile** (hamburger + drawer)
- **Deep linking**: `?tab=indicators&country=ITA`
- **Simulador com perfil editável** (composição, idade, UE, objetivo)
- **Skeleton loaders** e barra de progresso no carregamento
- **Exportar** gráficos PNG · tabelas CSV · planejamento JSON/CSV
- **Tema claro/escuro** (botão no header)
- **Favoritos** e **watchlist** com alertas de threshold
- **Anotações por ano** no histórico (aparecem no gráfico)
- **Comparar lado a lado** (2 países)
- **Tooltips** nos indicadores (?)
- **Links para fórmulas** relacionadas no histórico
- **Estados vazios** ilustrativos
- **Acessibilidade**: skip link, `aria-live`, `aria-current`, labels em gráficos

### Arquivos

| Arquivo | Função |
|---------|--------|
| `world-ux.js` | Navegação, hero, deep linking, loading |
| `world-prefs.js` | Favoritos, watchlist, anotações, tema, exportações |

---

41 países em 5 regiões: Américas, Europa, Ásia, África e Oceania — incluindo Brasil, Portugal, Itália, Espanha, Alemanha, França, EUA, Argentina e China.

Governantes com dados detalhados: Brasil, EUA, Itália, Espanha, Portugal, Alemanha, França, Reino Unido, Argentina, México, Chile, Colômbia, Japão, Índia, China e outros.

---

## Licença e uso

Projeto pessoal/educacional. Dados macro são públicos (World Bank, PNUD). Fotos da Wikipedia seguem as licenças dos respectivos arquivos no Wikimedia Commons.

---

## Créditos

World Bank Open Data · PNUD (IDH) · World Happiness Report · Wikimedia Commons · UNESCO
