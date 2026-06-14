/* WORLDPANEL — Guias passo a passo por país */

const RELOC_STEPS_TEMPLATE = [
  { phase: 'Pré-partida', items: ['Validar diploma (ENIC-NARIC)', 'Juntar reserva 6–12 meses', 'Pesquisar cidade/região', 'Seguro saúde viagem', 'Abrir conta bancária internacional'] },
  { phase: 'Chegada (Semana 1)', items: ['Registro anagrafe (residência)', 'Codice fiscale / NIF equivalente', 'Contrato aluguel ou Airbnb temporário', 'Chip local + internet', 'Inscrição SSN/segurança social'] },
  { phase: 'Estabelecimento (Mês 1–3)', items: ['Conta bancária local', 'Busca emprego ou cliente remoto', 'Curso de idioma intensivo', 'Médico de família / SSN', 'Integração comunidade expat'] },
  { phase: 'Família (Mês 3+)', items: ['Plano saúde gestação se aplicável', 'Escola/creche pesquisa', 'Orçamento familiar mensal', 'Rede de apoio local'] }
];

const COUNTRY_GUIDE_META = {
  PRT: { bureaucracy: 35, langBarrier: 5, costPressure: 40, months: '2–4', highlight: 'Mesmo idioma — transição mais rápida' },
  ITA: { bureaucracy: 55, langBarrier: 45, costPressure: 50, months: '3–6', highlight: 'Italiano aprendível; SNS forte para família' },
  ESP: { bureaucracy: 50, langBarrier: 40, costPressure: 48, months: '3–5', highlight: 'NIE rápido com cidadania UE' },
  IRL: { bureaucracy: 30, langBarrier: 10, costPressure: 75, months: '2–4', highlight: 'Inglês nativo; aluguel caro' },
  DEU: { bureaucracy: 60, langBarrier: 75, costPressure: 58, months: '4–8', highlight: 'Alemão obrigatório na maioria das vagas' },
  FRA: { bureaucracy: 65, langBarrier: 70, costPressure: 62, months: '4–8', highlight: 'Francês essencial' },
  NLD: { bureaucracy: 40, langBarrier: 35, costPressure: 68, months: '3–5', highlight: 'Inglês ok em tech; aluguel alto' },
  POL: { bureaucracy: 45, langBarrier: 50, costPressure: 30, months: '2–4', highlight: 'Custo baixo na UE' },
  GRC: { bureaucracy: 55, langBarrier: 55, costPressure: 38, months: '3–6', highlight: 'Custo baixo; economia instável' },
  CHE: { bureaucracy: 45, langBarrier: 65, costPressure: 85, months: '4–8', highlight: 'Salários altos, vida muito cara' },
  BEL: { bureaucracy: 50, langBarrier: 55, costPressure: 60, months: '3–6', highlight: 'Multilíngue (FR/NL)' },
  AUT: { bureaucracy: 52, langBarrier: 68, costPressure: 58, months: '4–7', highlight: 'Alemão necessário' },
  CZE: { bureaucracy: 42, langBarrier: 48, costPressure: 35, months: '2–5', highlight: 'Praga: tech + custo moderado' },
  ROU: { bureaucracy: 48, langBarrier: 52, costPressure: 28, months: '2–4', highlight: 'Um dos menores custos UE' },
  HUN: { bureaucracy: 50, langBarrier: 55, costPressure: 32, months: '3–5', highlight: 'Budapeste popular entre expats' },
  DNK: { bureaucracy: 38, langBarrier: 45, costPressure: 78, months: '3–6', highlight: 'Inglês alto; impostos altos' },
  SWE: { bureaucracy: 40, langBarrier: 42, costPressure: 72, months: '3–6', highlight: 'Personnummer essencial' },
  NOR: { bureaucracy: 35, langBarrier: 40, costPressure: 82, months: '3–6', highlight: 'Custo altíssimo, qualidade de vida top' },
  FIN: { bureaucracy: 38, langBarrier: 48, costPressure: 65, months: '3–6', highlight: 'Inglês bom; inverno rigoroso' },
  BRA: { bureaucracy: 70, langBarrier: 90, costPressure: 25, months: '6–12', highlight: 'Saída do Brasil exige planejamento fiscal' },
  USA: { bureaucracy: 75, langBarrier: 15, costPressure: 70, months: '6–18', highlight: 'Visto necessário (sem cidadania UE)' }
};

function calcDifficulty(code) {
  const m = COUNTRY_GUIDE_META[code];
  const d = data[code] || EMBEDDED[code] || {};
  if (!m) {
    const lang = LANG_EASE[code] || 30;
    const job = JOB_ENTRY[code] || 50;
    return Math.round(100 - lang * 0.4 + job * 0.35 + (d.cost_living || 50) * 0.25);
  }
  const lang = 100 - (LANG_EASE[code] || 40);
  return Math.min(100, Math.round(
    m.bureaucracy * 0.25 + lang * 0.25 + m.costPressure * 0.2 +
    (JOB_ENTRY[code] || 50) * 0.2 + (100 - (d.immigration || 50)) * 0.1
  ));
}

function difficultyLabel(n) {
  if (n <= 30) return { text: 'Fácil', cls: 'diff-easy' };
  if (n <= 50) return { text: 'Moderado', cls: 'diff-mod' };
  if (n <= 70) return { text: 'Desafiador', cls: 'diff-hard' };
  return { text: 'Muito difícil', cls: 'diff-extreme' };
}

const ITALY_CITY_IMG = 'assets/cities/';

function cityThumb(src, name) {
  if (!src) return '';
  const fb = 'https://flagcdn.com/w40/it.png';
  return '<img class="city-thumb" src="' + src + '" alt="' + name + '" loading="lazy" decoding="async" data-fb="' + fb + '" onerror="cityImgError(this)">';
}

function cityImgError(img) {
  const fb = img.getAttribute('data-fb');
  if (!fb || img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = fb;
  img.classList.add('city-thumb-fallback');
}

const ITALY_PLAN = {
  cities: [
    { name: 'Milão', region: 'Norte', rent1br: '€800–1.400', rent2br: '€1.200–2.000', note: 'Emprego + tech; mais caro', img: ITALY_CITY_IMG + 'milano.jpg' },
    { name: 'Bolonha', region: 'Norte', rent1br: '€650–1.100', rent2br: '€900–1.500', note: 'Universidade, indústria, bom custo-benefício', img: ITALY_CITY_IMG + 'bologna.jpg' },
    { name: 'Turim', region: 'Norte', rent1br: '€550–950', rent2br: '€750–1.300', note: 'Automotivo, mais barato que Milão', img: ITALY_CITY_IMG + 'torino.jpg' },
    { name: 'Roma', region: 'Centro', rent1br: '€700–1.200', rent2br: '€1.000–1.700', note: 'Capital; burocracia mais lenta', img: ITALY_CITY_IMG + 'roma.jpg' },
    { name: 'Florença', region: 'Centro', rent1br: '€650–1.100', rent2br: '€900–1.500', note: 'Turismo, arte, inglês em hotéis', img: ITALY_CITY_IMG + 'firenze.jpg' },
    { name: 'Nápoles', region: 'Sul', rent1br: '€400–700', rent2br: '€550–950', note: 'Mais barato; menos vagas qualificadas', img: ITALY_CITY_IMG + 'napoli.jpg' },
    { name: 'Bari', region: 'Sul', rent1br: '€350–600', rent2br: '€500–850', note: 'Custo baixo; crescimento moderado', img: ITALY_CITY_IMG + 'bari.jpg' },
    { name: 'Palermo', region: 'Sul', rent1br: '€300–550', rent2br: '€450–750', note: 'Menor custo; economia mais lenta', img: ITALY_CITY_IMG + 'palermo.jpg' }
  ],
  monthlyBudget: [
    { item: 'Aluguel T2 (fora centro)', eur: '€600–1.000', usd: '$650–1.080' },
    { item: 'Condomínio + utilities', eur: '€120–200', usd: '$130–215' },
    { item: 'Alimentação casal', eur: '€400–550', usd: '$430–590' },
    { item: 'Transporte (2 passes)', eur: '€70–120', usd: '$75–130' },
    { item: 'Internet + celular', eur: '€40–60', usd: '$43–65' },
    { item: 'Saúde (SSN + extras)', eur: '€0–80', usd: '$0–85' },
    { item: 'Total estimado', eur: '€1.230–2.010', usd: '$1.330–2.170' }
  ],
  remoteWork: [
    { platform: 'Fiverr / Upwork', type: 'Freelance', income: '€500–3.000/mês', skills: 'Design, dev, tradução PT↔IT/EN, redação, vídeo' },
    { platform: 'Toptal / Contra', type: 'Freelance premium', income: '€2.000–6.000/mês', skills: 'Dev senior, UX, consultoria' },
    { platform: 'Remote OK / EU Remote', type: 'Emprego remoto UE', income: '€1.800–4.500/mês', skills: 'TI, CS, marketing digital' },
    { platform: 'Preply / iTalki', type: 'Aulas online', income: '€300–1.200/mês', skills: 'Português/inglês — imediato sem italiano' },
    { platform: 'LinkedIn + Indeed Italia', type: 'Local + híbrido', income: '€1.200–2.500/mês', skills: 'Após B1 italiano ou inglês em multinacional' }
  ],
  hustles: [
    { name: 'Tradução PT–IT–EN', effort: 'Baixo', start: 'Imediato', earn: '€15–40/h', note: 'Brasileiros bilíngues têm demanda em agências' },
    { name: 'VA / Assistente remoto', effort: 'Baixo', start: '1 semana', earn: '€800–1.500/mês', note: 'Fiverr, Belay, clientes EUA/EU' },
    { name: 'E-commerce / dropshipping', effort: 'Médio', start: '1 mês', earn: 'Variável', note: 'Shopify + fornecedores EU' },
    { name: 'Turismo / guia freelancer', effort: 'Médio', start: '2 meses', earn: '€50–150/dia', note: 'Roma, Florença, Veneza — português/espanhol' },
    { name: 'Babá / cuidador', effort: 'Médio', start: '1 mês', earn: '€600–1.000/mês', note: 'Demanda em famílias norte Itália' },
    { name: 'Delivery / Glovo', effort: 'Alto', start: 'Imediato', earn: '€800–1.200/mês', note: 'Ponte temporária; precisa residência' },
    { name: 'Social media / UGC', effort: 'Médio', start: '2 semanas', earn: '€200–800/mês', note: 'TikTok/Instagram para marcas italianas' },
    { name: 'Contabilidade freelance BR+IT', effort: 'Alto', start: '3 meses', earn: '€1.500+/mês', note: 'Se formação em contábeis/finanças' }
  ],
  timeline90: [
    { week: 'Semanas 1–2', tasks: ['Codice fiscale', 'Residenza anagrafica', 'Airbnb ou sublocação', 'Abrir conto con IBAN italiano (N26/Revolut → banco local)', 'Inscrição SSN (servizio sanitario)'] },
    { week: 'Semanas 3–4', tasks: ['Curso italiano A1 intensivo', 'Perfis Fiverr + Upwork ativos', 'Busca aluguel longo (Immobiliare.it, Idealista)', 'ENIC-NARIC reconhecimento diploma'] },
    { week: 'Mês 2', tasks: ['Contrato affitto', 'Primeiros clientes freelance', 'P.IVA forfettario se renda >€5k (consultar commercialista)', 'Rede expat Facebook/WhatsApp local'] },
    { week: 'Mês 3', tasks: ['Italiano A2', 'Renda estável (remoto + local)', 'Médico família', 'Planejamento familiar se aplicável'] }
  ],
  resources: [
    { label: 'Immobiliare.it', url: 'https://www.immobiliare.it' },
    { label: 'Idealista Italia', url: 'https://www.idealista.it' },
    { label: 'ENIC-NARIC Italia', url: 'https://www.cimea.it' },
    { label: 'INPS (SSN)', url: 'https://www.inps.it' },
    { label: 'Agenzia Entrate (fiscal)', url: 'https://www.agenziaentrate.gov.it' }
  ]
};

function renderGuidesOverview() {
  const el = document.getElementById('guidesOverview');
  if (!el) return;
  const europe = COUNTRIES.filter(c => c.region === 'europe' && COUNTRY_GUIDE_META[c.code]);
  const ranked = europe.map(c => {
    const diff = calcDifficulty(c.code);
    const meta = COUNTRY_GUIDE_META[c.code];
    const dl = difficultyLabel(diff);
    return { c, diff, dl, meta };
  }).sort((a, b) => a.diff - b.diff);

  let html = '<div class="table-wrap"><table><thead><tr><th>País</th><th>Dificuldade</th><th>Prazo est.</th><th>Destaque</th><th></th></tr></thead><tbody>';
  ranked.forEach(x => {
    html += '<tr><td>' + countryCell(x.c.code, 'sm', true) + '</td>';
    html += '<td><span class="diff-badge ' + x.dl.cls + '">' + x.diff + '/100 · ' + x.dl.text + '</span></td>';
    html += '<td>' + x.meta.months + '</td><td style="white-space:normal;max-width:220px;font-size:.78rem;color:var(--muted)">' + x.meta.highlight + '</td>';
    html += '<td><button class="btn btn-sm secondary" onclick="renderCountryGuide(\'' + x.c.code + '\')">Ver guia</button></td></tr>';
  });
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function renderCountryGuide(code) {
  const sel = document.getElementById('guideCountry');
  if (sel) sel.value = code;
  const c = getCountry(code);
  const gs = document.getElementById('guideSearch');
  if (gs && c) gs.value = c.name;
  const meta = COUNTRY_GUIDE_META[code];
  const diff = calcDifficulty(code);
  const dl = difficultyLabel(diff);
  const d = data[code] || EMBEDDED[code] || {};
  const el = document.getElementById('guideDetail');
  if (!el) return;

  if (!meta) {
    el.innerHTML = '<p class="muted-text">Guia detalhado em construção para ' + c.name + '. Use os passos genéricos abaixo.</p>';
    return;
  }

  let html = countryHeroCompact(code, meta.highlight, 'guideHeroCollapse');
  html += '<div class="guide-header anim-in">';
  html += countryCell(code, 'lg', true);
  html += '<span class="diff-badge ' + dl.cls + '">Dificuldade ' + diff + '/100 — ' + dl.text + '</span>';
  html += '<span class="guide-meta">Prazo: ' + meta.months + ' · Custo vida: ' + fmtNum(d.cost_living, 0) + ' · IDH: ' + fmtNum(d.hdi, 3) + '</span></div>';

  html += '<div class="grid grid-2" style="margin:1rem 0">';
  html += '<div class="card"><h3>Indicadores chave</h3>';
  html += '<ul class="guide-list"><li>Salário médio: $' + fmtNum(d.avg_salary, 0) + '/mês</li>';
  html += '<li>Aluguel (índice): ' + fmtNum(d.rent_index, 0) + '</li><li>Desemprego: ' + fmtNum(d.unemployment) + '%</li>';
  html += '<li>Facilidade idioma (PT): ' + fmtNum(LANG_EASE[code] || 0, 0) + '/100</li>';
  html += '<li>Reserva recomendada (casal 9m): $' + fmtNum(((d.cost_living || 50) * 35 + (d.rent_index || 20) * 18) * 9 * 2 * 0.85, 0) + '</li></ul></div>';
  html += '<div class="card"><h3>Documentos UE</h3><ul class="guide-list">';
  html += '<li>Passaporte / ID cidadania UE</li><li>Certidões traduzidas (apostila)</li>';
  html += '<li>Diploma + ENIC-NARIC</li><li>Comprovante meios financeiros</li>';
  html += '<li>Contrato aluguel ou domicílio</li></ul></div></div>';

  RELOC_STEPS_TEMPLATE.forEach(phase => {
    html += '<div class="step-phase"><h4>' + phase.phase + '</h4><ol class="step-list">';
    phase.items.forEach((item, i) => html += '<li><label class="step-check"><input type="checkbox" data-step="' + code + '-' + phase.phase + '-' + i + '" onchange="saveGuideStep(this)"><span>' + item + '</span></label></li>');
    html += '</ol></div>';
  });

  if (code === 'ITA') html += renderItalyPlan();
  el.innerHTML = html;
  loadGuideSteps();
}

function renderItalyPlan() {
  const p = ITALY_PLAN;
  let html = '<div class="italy-plan"><h3 class="accent-title">Plano completo — Morar na Itália</h3>';

  html += '<h4>Cidades e aluguel (2024/25)</h4><div class="table-wrap"><table><thead><tr><th>Cidade</th><th>Região</th><th>1 quarto</th><th>2 quartos</th><th>Nota</th></tr></thead><tbody>';
  p.cities.forEach(c => {
    const cityImg = cityThumb(c.img, c.name);
    html += '<tr><td><span class="city-cell">' + cityImg + '<strong>' + c.name + '</strong></span></td><td>' + c.region + '</td><td>' + c.rent1br + '</td><td>' + c.rent2br + '</td><td style="white-space:normal;font-size:.78rem">' + c.note + '</td></tr>';
  });
  html += '</tbody></table></div>';

  html += '<h4>Orçamento mensal casal</h4><div class="table-wrap"><table><thead><tr><th>Item</th><th>EUR</th><th>USD</th></tr></thead><tbody>';
  p.monthlyBudget.forEach(b => {
    html += '<tr><td>' + b.item + '</td><td>' + b.eur + '</td><td>' + b.usd + '</td></tr>';
  });
  html += '</tbody></table></div>';

  html += '<div class="grid grid-2"><div class="card"><h4>Trabalho remoto / online</h4><div class="table-wrap"><table><thead><tr><th>Plataforma</th><th>Tipo</th><th>Renda</th></tr></thead><tbody>';
  p.remoteWork.forEach(r => {
    html += '<tr><td><strong>' + r.platform + '</strong><br><span style="font-size:.72rem;color:var(--muted)">' + r.skills + '</span></td><td>' + r.type + '</td><td class="accent-num">' + r.income + '</td></tr>';
  });
  html += '</tbody></table></div></div>';

  html += '<div class="card"><h4>Hustles — renda rápida</h4><div class="table-wrap"><table><thead><tr><th>Atividade</th><th>Esforço</th><th>Início</th><th>Ganho</th></tr></thead><tbody>';
  p.hustles.forEach(h => {
    html += '<tr><td><strong>' + h.name + '</strong><br><span style="font-size:.72rem;color:var(--muted)">' + h.note + '</span></td><td>' + h.effort + '</td><td>' + h.start + '</td><td class="accent-num">' + h.earn + '</td></tr>';
  });
  html += '</tbody></table></div></div></div>';

  html += '<h4>Primeiros 90 dias</h4>';
  p.timeline90.forEach(t => {
    html += '<div class="step-phase"><h4>' + t.week + '</h4><ul class="guide-list">';
    t.tasks.forEach(task => html += '<li>' + task + '</li>');
    html += '</ul></div>';
  });

  html += '<h4>Links úteis</h4><div class="link-row">';
  p.resources.forEach(r => html += '<a href="' + r.url + '" target="_blank" rel="noopener" class="link-chip">' + r.label + '</a>');
  html += '</div></div>';
  return html;
}

function saveGuideStep(cb) {
  const key = 'worldpanel_steps';
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  saved[cb.dataset.step] = cb.checked;
  localStorage.setItem(key, JSON.stringify(saved));
}

function loadGuideSteps() {
  const saved = JSON.parse(localStorage.getItem('worldpanel_steps') || '{}');
  document.querySelectorAll('[data-step]').forEach(cb => {
    if (saved[cb.dataset.step]) cb.checked = true;
  });
}

function initGuidesTab() {
  const sel = document.getElementById('guideCountry');
  if (sel && !sel.options.length) {
    const codes = Object.keys(COUNTRY_GUIDE_META);
    sel.innerHTML = COUNTRIES.filter(c => codes.includes(c.code))
      .map(c => '<option value="' + c.code + '">' + countrySelectLabel(c.code) + '</option>').join('');
    sel.value = 'ITA';
  }
  initCountrySearch('guideSearch', 'guideCountry', function(code) { renderCountryGuide(code); });
  const gs = document.getElementById('guideSearch');
  if (gs && sel) gs.value = getCountry(sel.value)?.name || '';
  renderGuidesOverview();
  renderCountryGuide(sel ? sel.value : 'ITA');
}
