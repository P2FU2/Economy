/* WORLDPANEL — Decisão de expatriação: wizard, score, dashboard, export */

let expatWizardStep = 0;
let expatTargetCode = 'ITA';
let expatLastResult = null;
let expatCharts = {};

function openExpatDecision(code) {
  expatTargetCode = code || document.getElementById('indCountry')?.value || 'ITA';
  expatWizardStep = 0;
  expatLastResult = null;
  ensureExpatModal();
  renderExpatWizard();
  bindExpatChips();
  document.getElementById('expatModal').classList.add('open');
  document.body.classList.add('expat-modal-open');
}

function closeExpatModal() {
  const m = document.getElementById('expatModal');
  if (m) m.classList.remove('open');
  document.body.classList.remove('expat-modal-open');
  if (expatCharts.radar) { expatCharts.radar.destroy(); expatCharts.radar = null; }
}

function ensureExpatModal() {
  if (document.getElementById('expatModal')) return;
  const el = document.createElement('div');
  el.id = 'expatModal';
  el.className = 'expat-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'expatModalTitle');
  el.innerHTML =
    '<div class="expat-modal-backdrop" onclick="closeExpatModal()"></div>' +
    '<div class="expat-modal-panel">' +
    '<button type="button" class="expat-modal-close" onclick="closeExpatModal()" aria-label="Fechar">×</button>' +
    '<div id="expatModalContent"></div></div>';
  document.body.appendChild(el);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('expatModal')?.classList.contains('open')) closeExpatModal();
  });
}

function expatBtnHtml(code) {
  if (!getCountry(code)) return '';
  return '<button type="button" class="btn primary expat-cta" onclick="openExpatDecision(\'' + code + '\')">' +
    flagImg(code, 'xs') + ' Vale a pena morar aqui?</button>';
}

function renderExpatWizard() {
  const el = document.getElementById('expatModalContent');
  if (!el) return;
  const c = getCountry(expatTargetCode);
  const p = loadExpatProfile();

  if (expatLastResult) {
    renderExpatDashboard(expatLastResult);
    return;
  }

  const titles = ['Perfil pessoal', 'Perfil financeiro', 'Estilo de vida'];

  let html = '<div class="expat-wizard anim-in">';
  html += '<div class="expat-wizard-head">' + flagImg(expatTargetCode, 'md') +
    '<div><p class="expat-eyebrow">Análise personalizada · ' + (c?.name || expatTargetCode) + '</p>' +
    '<h2 id="expatModalTitle">' + titles[expatWizardStep] + '</h2>' +
    '<p class="muted-text">Passo ' + (expatWizardStep + 1) + ' de 3 · perfil salvo para outros países</p></div></div>';
  html += '<div class="expat-progress"><div style="width:' + ((expatWizardStep + 1) / 3 * 100) + '%"></div></div>';

  if (expatWizardStep === 0) html += renderExpatStep1(p);
  else if (expatWizardStep === 1) html += renderExpatStep2(p);
  else html += renderExpatStep3(p);

  html += '<div class="expat-wizard-nav">';
  html += expatWizardStep > 0
    ? '<button type="button" class="btn secondary" onclick="expatWizardPrev()">Anterior</button>'
    : '<span></span>';
  html += expatWizardStep < 2
    ? '<button type="button" class="btn primary" onclick="expatWizardNext()">Próximo</button>'
    : '<button type="button" class="btn primary" onclick="runExpatAnalysis()">Gerar análise</button>';
  html += '</div></div>';
  el.innerHTML = html;
}

function chipGroup(name, options, selected, multi) {
  return '<div class="expat-chips" data-field="' + name + '" data-multi="' + (multi ? '1' : '0') + '">' +
    options.map(o => {
      const on = multi ? (selected || []).includes(o.v) : selected === o.v;
      return '<button type="button" class="expat-chip' + (on ? ' on' : '') + '" data-value="' + o.v + '">' +
        (o.icon ? o.icon + ' ' : '') + o.l + '</button>';
    }).join('') + '</div>';
}

function renderExpatStep1(p) {
  return '<div class="expat-fields">' +
    '<label>P1 · Composição familiar</label>' + chipGroup('household', [
      { v: 'solo', l: 'Individual', icon: '👤' }, { v: 'couple', l: 'Casal', icon: '👫' }, { v: 'family', l: 'Família c/ filhos', icon: '👨‍👩‍👧' }
    ], p.household) +
    '<label>P2 · Cidadania europeia</label>' + chipGroup('euCitizen', [
      { v: 'yes', l: 'Sim — UE', icon: '🇪🇺' }, { v: 'no', l: 'Não', icon: '🌎' }
    ], p.euCitizen ? 'yes' : 'no') +
    '<label>P3 · Idioma local hoje</label>' + chipGroup('langLevel', [
      { v: 'none', l: 'Nenhum' }, { v: 'basic', l: 'Básico' }, { v: 'intermediate', l: 'Intermediário' }, { v: 'advanced', l: 'Avançado' }
    ], p.langLevel) +
    '<label>P4 · Motivação principal</label>' + chipGroup('goal', [
      { v: 'family', l: 'Família', icon: '🏠' }, { v: 'career', l: 'Carreira', icon: '📈' }, { v: 'study', l: 'Estudos', icon: '🎓' },
      { v: 'retire', l: 'Aposentadoria', icon: '☀️' }, { v: 'lifestyle', l: 'Estilo de vida', icon: '🌴' }, { v: 'tax', l: 'Fiscal', icon: '📊' }
    ], p.goal) + '</div>';
}

function renderExpatStep2(p) {
  return '<div class="expat-fields">' +
    '<label>P5 · Renda mensal líquida estimada</label>' +
    '<div class="form-row"><input type="number" id="expatIncome" value="' + (p.monthlyIncome || 3500) + '" min="0" step="100" style="width:120px">' +
    chipGroup('incomeCurrency', [{ v: 'USD', l: 'USD' }, { v: 'BRL', l: 'BRL' }, { v: 'EUR', l: 'EUR' }], p.incomeCurrency || 'USD') + '</div>' +
    '<label>P6 · Reserva financeira (USD equivalente)</label>' +
    '<input type="number" id="expatReserve" value="' + (p.reserve || 20000) + '" min="0" step="500" style="width:140px">' +
    '<label>P7 · Tipo de renda</label>' + chipGroup('incomeType', [
      { v: 'remote', l: 'Remota', icon: '💻' }, { v: 'local', l: 'Emprego local', icon: '🏢' },
      { v: 'entrepreneur', l: 'Empresário', icon: '🚀' }, { v: 'clt_br', l: 'CLT Brasil', icon: '📋' }, { v: 'mixed', l: 'Mista', icon: '🔀' }
    ], p.incomeType) +
    '<label>P8 · Setor</label><select id="expatSector">' +
    ['sector_tech|Tecnologia', 'sector_health|Saúde', 'sector_finance|Finanças', 'sector_construction|Engenharia', 'sector_hospitality|Turismo']
      .map(s => { const [v, l] = s.split('|'); return '<option value="' + v + '"' + (p.sector === v ? ' selected' : '') + '>' + l + '</option>'; }).join('') +
    '</select>' +
    '<label>P9 · Tolerância a risco</label>' +
    '<input type="range" id="expatRisk" min="1" max="5" value="' + (p.riskTolerance || 3) + '" oninput="document.getElementById(\'expatRiskVal\').textContent=this.value">' +
    '<span id="expatRiskVal" class="accent-num">' + (p.riskTolerance || 3) + '</span>/5</div>';
}

function renderExpatStep3(p) {
  return '<div class="expat-fields">' +
    '<label>P10 · Prioridades (até 3)</label>' + chipGroup('priorities', [
      { v: 'safety', l: 'Segurança' }, { v: 'healthcare', l: 'Saúde' }, { v: 'cost', l: 'Custo baixo' },
      { v: 'climate', l: 'Clima quente' }, { v: 'culture', l: 'Cultura' }, { v: 'nature', l: 'Natureza' }, { v: 'nightlife', l: 'Vida urbana' }
    ], p.priorities || ['safety', 'healthcare', 'cost'], true) +
    '<label>P11 · Horizonte para mudar</label>' + chipGroup('timelineMonths', [
      { v: '3', l: '3 meses' }, { v: '6', l: '6 meses' }, { v: '12', l: '1 ano' }, { v: '24', l: '2 anos' }, { v: '36', l: '3+ anos' }
    ], String(p.timelineMonths || 12)) +
    '<label>P12 · Compromisso com idioma</label>' + chipGroup('langCommitment', [
      { v: 'low', l: 'Mínimo' }, { v: 'moderate', l: 'Moderado' }, { v: 'high', l: 'Fluência' }
    ], p.langCommitment) +
    '<label>P13 · Cidade-alvo (opcional)</label>' +
    '<input type="text" id="expatCity" placeholder="Milano, Lisboa, Barcelona…" value="' + (p.targetCity || '') + '" style="max-width:280px;width:100%"></div>';
}

function readExpatWizardProfile() {
  const p = loadExpatProfile();
  document.querySelectorAll('.expat-chips').forEach(group => {
    const field = group.dataset.field;
    const multi = group.dataset.multi === '1';
    const active = [...group.querySelectorAll('.expat-chip.on')].map(b => b.dataset.value);
    if (multi) p[field] = active.slice(0, 3);
    else if (active[0] !== undefined) {
      if (field === 'euCitizen') p.euCitizen = active[0] === 'yes';
      else if (field === 'timelineMonths') p.timelineMonths = +active[0];
      else p[field] = active[0];
    }
  });
  const inc = document.getElementById('expatIncome');
  if (inc) p.monthlyIncome = +inc.value || 0;
  const res = document.getElementById('expatReserve');
  if (res) p.reserve = +res.value || 0;
  const sec = document.getElementById('expatSector');
  if (sec) p.sector = sec.value;
  const risk = document.getElementById('expatRisk');
  if (risk) p.riskTolerance = +risk.value;
  const city = document.getElementById('expatCity');
  if (city) p.targetCity = city.value.trim();
  p.motivations = [p.goal || 'family'];
  saveExpatProfile(p);
  return p;
}

function bindExpatChips() {
  document.querySelectorAll('.expat-chip').forEach(btn => {
    btn.onclick = () => {
      const group = btn.closest('.expat-chips');
      const multi = group.dataset.multi === '1';
      if (multi) {
        btn.classList.toggle('on');
        if (group.querySelectorAll('.expat-chip.on').length > 3) btn.classList.remove('on');
      } else {
        group.querySelectorAll('.expat-chip').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
      }
    };
  });
}

function expatWizardNext() {
  readExpatWizardProfile();
  expatWizardStep++;
  renderExpatWizard();
  bindExpatChips();
}

function expatWizardPrev() {
  readExpatWizardProfile();
  expatWizardStep--;
  renderExpatWizard();
  bindExpatChips();
}

function calcExpatScores(code, profile) {
  const d = data[code] || {};
  const city = profile.targetCity;
  const monthlyLiving = estMonthlyLiving(code, city);
  const netInc = netMonthlyIncome(code, profile);
  const monthsCover = monthsReserveCovers(code, profile, city);
  const visaPath = pickBestVisaPath(code, profile);
  const tax = getExpatTax(code);
  const climate = getExpatClimate(code);
  const bureaucracy = IMMIG_BUREAUCRACY[code] ?? 6;
  const sectorDemand = d[profile.sector] || 50;

  let entry = visaPath.fit || 50;
  entry -= Math.max(0, bureaucracy - 5) * 4;
  if (visaPath.costUsd && profile.reserve && visaPath.costUsd > profile.reserve * 0.2) entry -= 15;
  if (visaPath.months > profile.timelineMonths) entry -= Math.min(25, (visaPath.months - profile.timelineMonths) * 4);
  else entry += 8;
  entry = Math.round(Math.max(5, Math.min(100, entry)));

  const incomeRatio = monthlyLiving > 0 ? netInc / monthlyLiving : 0;
  let cost = incomeRatio >= 1.3 ? 90 : incomeRatio >= 1.0 ? 75 : incomeRatio >= 0.85 ? 55 : incomeRatio >= 0.65 ? 35 : 15;
  if (monthsCover >= 12) cost += 10; else if (monthsCover < 6) cost -= 15;
  if (profile.incomeCurrency === 'BRL') cost -= 8;
  cost = Math.round(Math.max(5, Math.min(100, cost)));

  let quality = (d.hdi || 0.7) * 45 + (d.happiness || 5) * 5 + (d.safety || 50) * 0.25 + (d.healthcare || 50) * 0.2;
  if (profile.priorities?.includes('climate') && climate.warm) quality += 8;
  if (profile.priorities?.includes('safety') && (d.safety || 0) >= 70) quality += 5;
  quality = Math.round(Math.max(5, Math.min(100, quality)));

  let work = sectorDemand * 0.5 + (100 - (JOB_ENTRY[code] || 50)) * 0.25 + Math.max(0, 100 - (d.unemployment || 8) * 6) * 0.15;
  work += (BUSINESS_EASE[code] ?? BUSINESS_EASE.default) * 0.1;
  if (profile.incomeType === 'remote') work += (d.internet || 80) * 0.08;
  if (profile.incomeType === 'local' && (JOB_ENTRY[code] || 50) > 55) work -= 12;
  work = Math.round(Math.max(5, Math.min(100, work)));

  let integration = (LANG_EASE[code] || 30) * 0.45 + (ENGLISH_JOBS[code] || ENGLISH_JOBS.default) * 0.35;
  if (profile.langCommitment === 'high') integration += 10;
  if (profile.langLevel === 'advanced') integration += 15;
  integration = Math.round(Math.max(5, Math.min(100, integration)));

  const dims = { entry, cost, quality, work, integration };
  const weights = EXPAT_MOTIVATION_WEIGHTS[profile.goal] || EXPAT_MOTIVATION_WEIGHTS.family;
  let overall = 0;
  Object.keys(weights).forEach(k => { overall += (dims[k] || 0) * weights[k]; });

  const langMonths = langMonthsToB1(profile, code);
  const reversibility = calcReversibilityScore(code, profile);
  const alerts = buildExpatAlerts(code, profile, { monthlyLiving, netInc, monthsCover, visaPath, incomeRatio, langMonths, reversibility });
  const timeline = buildExpatTimeline(code, profile, visaPath);
  const alternatives = findExpatAlternatives(code, profile, Math.round(overall), dims);

  return {
    code, profile, dims, overall: Math.round(overall), visaPath, monthlyLiving, netInc, monthsCover, incomeRatio,
    tax, climate, reversibility, alerts, timeline, alternatives, city: city || 'média nacional'
  };
}

function buildExpatAlerts(code, profile, ctx) {
  const d = data[code] || {};
  const alerts = [];
  if (profile.incomeCurrency === 'BRL') {
    alerts.push({ level: 'warn', text: 'Renda em BRL — exposição cambial alta. Desvalorização de 20% reduz poder de compra significativamente.' });
  }
  if (ctx.incomeRatio < 0.85) {
    alerts.push({ level: 'danger', text: 'Renda líquida cobre menos de 85% do custo de vida — inviável sem ajuste.' });
  } else if (ctx.incomeRatio < 1.0) {
    alerts.push({ level: 'warn', text: 'Margem financeira apertada — considere cidade mais barata ou mais reserva.' });
  }
  if (ctx.monthsCover < 6) {
    alerts.push({ level: 'danger', text: 'Reserva cobre menos de 6 meses — risco elevado antes de estabilizar.' });
  }
  if (ctx.visaPath.costUsd > (profile.reserve || 0) * 0.2) {
    alerts.push({ level: 'warn', text: 'Custo do visto >20% da reserva — planeje financiamento separado.' });
  }
  if ((LANG_EASE[code] || 30) < 50 && profile.langLevel === 'none' && profile.langCommitment !== 'high') {
    alerts.push({ level: 'warn', text: 'Sem idioma local, empregabilidade limitada nos primeiros ' + ctx.langMonths + ' meses.' });
  }
  if ((d.unemployment || 0) > 10 && profile.incomeType === 'local') {
    alerts.push({ level: 'warn', text: 'Desemprego ' + fmtNum(d.unemployment) + '% — mercado local competitivo.' });
  }
  const tax = getExpatTax(code);
  if (tax.special) alerts.push({ level: 'info', text: tax.special.name + ' — ' + (tax.special.note || '') });
  if (!alerts.length) alerts.push({ level: 'ok', text: 'Perfil alinhado ao destino — nenhum alerta crítico.' });
  return alerts;
}

function buildExpatTimeline(code, profile, visaPath) {
  const m = profile.timelineMonths || 12;
  const pathMonths = visaPath.months || 6;
  const steps = [
    { month: 0, who: 'Você', cost: 200, text: 'Documentos: certidões, apostilas, traduções juramentadas' },
    { month: 1, who: 'Você', cost: 500, text: 'Conta internacional, seguro saúde, reserva +3 meses' }
  ];
  if (!profile.euCitizen) {
    steps.push({ month: 2, who: 'Consulado', cost: Math.round((visaPath.costUsd || 2000) * 0.5), text: visaPath.label + ' — ' + (visaPath.next || 'protocolar visto') });
    steps.push({ month: 2 + Math.floor(pathMonths / 2), who: 'Aguardar', cost: 0, text: 'Aprovação (~' + pathMonths + ' meses). Reservar alojamento temporário.' });
  } else {
    steps.push({ month: 1, who: 'Você', cost: 400, text: 'Registro UE: NIF/codice fiscale + residência + saúde pública' });
  }
  steps.push({ month: Math.min(m, pathMonths + 1), who: 'Você', cost: estRent(code), text: 'Chegada: aluguel, registro, conta bancária local' });
  if (profile.langLevel !== 'advanced') {
    steps.push({ month: Math.min(m, pathMonths + 2), who: 'Você', cost: 300, text: 'Curso idioma (B1 em ~' + langMonthsToB1(profile, code) + ' meses)' });
  }
  if (profile.incomeType === 'local') {
    steps.push({ month: Math.min(m, pathMonths + 3), who: 'Você', cost: 0, text: 'ENIC-NARIC + candidaturas ' + (getInd(profile.sector)?.label || '') });
  }
  return steps.sort((a, b) => a.month - b.month);
}

function findExpatAlternatives(code, profile, overall, dims) {
  return COUNTRIES.filter(c => c.code !== code && c.region === 'europe' && c.code !== 'RUS' && c.code !== 'GBR')
    .map(c => { const r = calcExpatScores(c.code, profile); return { code: c.code, name: c.name, overall: r.overall, dims: r.dims }; })
    .sort((a, b) => b.overall - a.overall)
    .filter(s => s.overall >= overall - 8)
    .slice(0, 3);
}

function runExpatAnalysis() {
  readExpatWizardProfile();
  expatLastResult = calcExpatScores(expatTargetCode, loadExpatProfile());
  renderExpatDashboard(expatLastResult);
}

function runExpatAnalysisFromProfile() {
  expatLastResult = calcExpatScores(expatTargetCode, loadExpatProfile());
  renderExpatDashboard(expatLastResult);
}

function renderExpatDashboard(result) {
  const el = document.getElementById('expatModalContent');
  if (!el) return;
  const c = getCountry(result.code);
  const finLabel = result.incomeRatio >= 1.15 ? 'confortável' : result.incomeRatio >= 0.95 ? 'equilibrado' : result.incomeRatio >= 0.75 ? 'apertado' : 'inviável';

  let html = '<div class="expat-dashboard anim-in">';
  html += '<div class="expat-score-hero">' + flagImg(result.code, 'lg') +
    '<div><p class="expat-eyebrow">Decisão personalizada</p>' +
    '<h2 id="expatModalTitle">' + c.name + ' · <span class="accent-num">' + result.overall + '/100</span></h2>' +
    '<p class="muted-text">' + result.city + '</p></div></div>';

  html += '<div class="expat-score-grid">';
  EXPAT_DIMENSIONS.forEach(dim => {
    html += '<div class="expat-dim-card"><span>' + dim.icon + '</span><small>' + dim.label + '</small><strong>' + (result.dims[dim.id] || 0) + '</strong></div>';
  });
  html += '</div>';

  html += '<div class="grid grid-2"><div class="card"><h3 class="section-head"><span>Financeiro</span>Viabilidade</h3>';
  html += '<p style="font-size:.88rem">Reserva <strong>$' + fmtNum(result.profile.reserve, 0) + '</strong> → <strong>' + fmtNum(result.monthsCover, 1) + ' meses</strong> (~$' + fmtNum(result.monthlyLiving, 0) + '/mês em ' + result.city + ').</p>';
  html += '<p style="font-size:.88rem;margin-top:.5rem">Renda líquida $' + fmtNum(result.netInc, 0) + ' = <strong>' + fmtNum(result.incomeRatio * 100, 0) + '%</strong> do custo — <span class="tag ' + (finLabel === 'confortável' ? 'up' : finLabel === 'inviável' ? 'down' : 'neutral') + '">' + finLabel + '</span></p></div>';
  html += '<div class="card"><h3 class="section-head"><span>Entrada</span>Caminho viável</h3>';
  html += '<p style="font-size:.88rem"><strong>' + result.visaPath.label + '</strong><br>' + result.visaPath.reason + '</p>';
  html += '<ul class="guide-list"><li>Prazo: <strong>' + result.visaPath.months + ' meses</strong></li>';
  html += '<li>Custo: <strong>$' + fmtNum(result.visaPath.costUsd, 0) + '</strong></li>';
  html += '<li>' + (result.visaPath.next || '') + '</li></ul></div></div>';

  html += '<div class="card" style="margin-top:1rem"><h3 class="section-head"><span>Radar</span>5 dimensões</h3>';
  html += '<div class="chart-box" style="height:260px"><canvas id="expatRadar"></canvas></div></div>';

  html += '<div class="card" style="margin-top:1rem"><h3 class="section-head"><span>Riscos</span>Alertas</h3>';
  result.alerts.forEach(a => {
    html += '<p class="expat-alert" style="font-size:.82rem;margin:.35rem 0">' + (a.level === 'danger' || a.level === 'warn' ? '⚠️ ' : 'ℹ️ ') + a.text + '</p>';
  });
  html += '<p class="muted-text" style="font-size:.75rem;margin-top:.5rem">Reversão: ' + result.reversibility + '/100</p></div>';

  if (result.alternatives.length) {
    html += '<div class="card" style="margin-top:1rem"><h3 class="section-head"><span>Alternativas</span>Comparar destinos</h3><div class="table-wrap"><table><thead><tr><th>País</th><th>Score</th><th>Entrada</th><th>Custo</th><th>Qualidade</th><th></th></tr></thead><tbody>';
    result.alternatives.forEach(alt => {
      html += '<tr><td>' + countryCell(alt.code, 'sm', true) + '</td><td><strong>' + alt.overall + '</strong></td>';
      html += '<td>' + alt.dims.entry + '</td><td>' + alt.dims.cost + '</td><td>' + alt.dims.quality + '</td>';
      html += '<td><button type="button" class="btn btn-sm secondary" onclick="expatTargetCode=\'' + alt.code + '\';runExpatAnalysisFromProfile()">Ver</button></td></tr>';
    });
    html += '</tbody></table></div></div>';
  }

  html += '<div class="card" style="margin-top:1rem"><h3 class="section-head"><span>Timeline</span>Passo a passo</h3>';
  result.timeline.forEach(s => {
    html += '<div class="expat-timeline-item"><span class="tl-month">M+' + s.month + '</span><div><strong style="font-size:.85rem">' + s.text + '</strong>';
    html += '<span class="muted-text" style="font-size:.72rem;display:block">' + s.who + (s.cost ? ' · ~$' + fmtNum(s.cost, 0) : '') + '</span></div></div>';
  });
  html += '</div>';

  html += '<div class="expat-actions"><button type="button" class="btn primary" onclick="exportExpatToPlanner()">Adicionar ao Planejamento</button>';
  html += '<button type="button" class="btn secondary" onclick="exportExpatPdf()">PDF</button>';
  html += '<button type="button" class="btn secondary" onclick="expatLastResult=null;expatWizardStep=0;renderExpatWizard();bindExpatChips()">Refazer</button>';
  html += '<button type="button" class="btn secondary" onclick="closeExpatModal()">Fechar</button></div></div>';

  el.innerHTML = html;
  renderExpatRadar(result);
}

function renderExpatRadar(result) {
  const canvas = document.getElementById('expatRadar');
  if (!canvas || typeof Chart === 'undefined') return;
  if (expatCharts.radar) expatCharts.radar.destroy();
  expatCharts.radar = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: EXPAT_DIMENSIONS.map(d => d.label),
      datasets: [{ data: EXPAT_DIMENSIONS.map(d => result.dims[d.id] || 0), borderColor: '#3d9a6a', backgroundColor: 'rgba(61,154,106,0.2)', borderWidth: 2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: '#9a9a9a' }, grid: { color: 'rgba(46,46,46,0.4)' }, pointLabels: { color: '#ececec', font: { size: 10 } } } },
      plugins: { legend: { display: false } }
    }
  });
}

function exportExpatToPlanner() {
  if (!expatLastResult || typeof Planner === 'undefined') return;
  const r = expatLastResult;
  const s = Planner.get();
  s.target = r.code;
  s.budget = '$' + fmtNum(r.profile.reserve, 0);
  const dl = new Date();
  dl.setMonth(dl.getMonth() + (r.profile.timelineMonths || 12));
  s.deadline = dl.toISOString().slice(0, 10);
  s.notes = (s.notes ? s.notes + '\n\n' : '') + 'Análise Expat ' + getCountry(r.code).name + ' ' + r.overall + '/100\n' + r.visaPath.label;
  s.tasks = r.timeline.map((t, i) => ({
    id: 'expat_' + Date.now() + '_' + i, text: 'M+' + t.month + ': ' + t.text, done: false, phase: i < 2 ? 'prep' : 'arrival'
  })).concat(s.tasks || []);
  Planner.save(s);
  closeExpatModal();
  switchTab('planner');
  if (typeof initPlannerTab === 'function') initPlannerTab();
}

function exportExpatPdf() {
  if (!expatLastResult || !window.jspdf?.jsPDF) return;
  const r = expatLastResult;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 18;
  const line = (t, sz) => {
    doc.setFontSize(sz || 10);
    doc.splitTextToSize(String(t), 175).forEach(l => { if (y > 275) { doc.addPage(); y = 18; } doc.text(l, 15, y); y += 5; });
  };
  line('Decisao Expat — ' + getCountry(r.code).name + ' ' + r.overall + '/100', 14);
  EXPAT_DIMENSIONS.forEach(d => line(d.label + ': ' + r.dims[d.id], 10));
  r.timeline.forEach(s => line('M+' + s.month + ' ' + s.text, 9));
  doc.save('expat-' + r.code + '.pdf');
}

function initExpatModule() {
  ensureExpatModal();
}
