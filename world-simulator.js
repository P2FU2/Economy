/* WORLDPANEL — Simulador europeu: score transparente, delta BR, trade-offs, prontidão */

const EUROPE_COUNTRIES = () => COUNTRIES.filter(c => c.region === 'europe' && c.code !== 'RUS' && c.code !== 'GBR');

const SIM_TIMELINE_MONTHS = { lt6: 6, '6-12': 12, '1-2y': 24, '2-4y': 48, explore: 60 };

const RESERVE_MONTHS = 9;
const RESERVE_DISCOUNT = 0.85;

function getMergedSimProfile() {
  const fam = typeof getFamilyProfile === 'function' ? getFamilyProfile() : {};
  let expat = {};
  try { expat = typeof loadExpatProfile === 'function' ? loadExpatProfile() : {}; } catch (e) { /* noop */ }
  const p = { ...expat, ...fam };
  p.timelineMonths = SIM_TIMELINE_MONTHS[p.timeline] || p.timelineMonths || 12;
  if (!p.costSpUsd && p.household === 'couple') p.costSpUsd = 2800;
  if (!p.costSpUsd && p.household === 'solo') p.costSpUsd = 1800;
  return p;
}

function householdMult(profile) {
  const h = profile?.household || 'couple';
  if (h === 'solo') return 1;
  if (h === 'family') return 2.2;
  return 1.7;
}

function estMonthlyLivingHousehold(code, profile) {
  const base = (estMonthlyCost(code) + estRent(code)) * householdMult(profile) * RESERVE_DISCOUNT;
  return base;
}

function calcReserve9m(code, profile) {
  const monthly = estMonthlyLivingHousehold(code, profile);
  const total = monthly * RESERVE_MONTHS;
  return { monthly, total, months: RESERVE_MONTHS, explain: 'Reserva recomendada = ' + RESERVE_MONTHS + ' meses × custo mensal estimado ($' + fmtNum(monthly, 0) + '/mês para ' + (profile?.household === 'solo' ? 'individual' : profile?.household === 'family' ? 'família' : 'casal') + '). Não inclui visto nem passagem — só manutenção.' };
}

function scoreInterpretation(score) {
  if (score >= 80) return 'Muito recomendado para o seu perfil';
  if (score >= 65) return 'Recomendado com ressalvas';
  if (score >= 50) return 'Viável com preparação significativa';
  return 'Desafiador para o seu perfil agora';
}

function costIndexExplain(val, code) {
  const br = data.BRA?.cost_living || 32;
  const ratio = val / br;
  const pct = Math.round((ratio - 1) * 100);
  const dir = pct > 0 ? pct + '% acima do Brasil' : Math.abs(pct) + '% abaixo do Brasil';
  return 'Índice ' + fmtNum(val, 0) + '/100 (Nova York = 100). ' + dir + '. Aluguel 1BR est.: $' + fmtNum(estRent(code), 0) + '/mês.';
}

function passesMustHaveFilters(code, profile) {
  const must = profile?.mustHave || [];
  if (!must.length) return { pass: true, failed: [] };
  const d = data[code] || {};
  const br = data.BRA || {};
  const failed = [];
  if (must.includes('warm') && !(getExpatClimate(code).warm)) failed.push('Clima quente');
  if (must.includes('lowcost') && (d.cost_living || 50) > (br.cost_living || 32) * 1.15) failed.push('Custo baixo');
  if (must.includes('english') && (ENGLISH_JOBS[code] || ENGLISH_JOBS.default) < 55) failed.push('Inglês no dia a dia');
  if (must.includes('safety') && (d.safety || 50) < (br.safety || 43) + 15) failed.push('Alta segurança');
  if (must.includes('community') && (BRAZILIAN_COMMUNITY[code] ?? BRAZILIAN_COMMUNITY.default) < 40) failed.push('Comunidade brasileira');
  if (must.includes('healthcare') && (d.healthcare || 50) < 70) failed.push('Saúde pública forte');
  return { pass: !failed.length, failed };
}

function calcFamilyEUScoreBreakdown(code, profile) {
  profile = profile || getMergedSimProfile();
  const d = data[code] || {};
  const lang = LANG_EASE[code] || 30;
  const jobEase = 100 - (JOB_ENTRY[code] || 50);
  const costIdx = d.cost_living || 50;
  const costScore = Math.max(0, 100 - costIdx);
  const unempScore = Math.max(0, 100 - (d.unemployment || 5) * 8);
  const overall = calcFamilyEUScore(code, profile);
  const fin = getFinancialViability(code, profile);
  const brCost = profile.costSpUsd || estMonthlyLivingHousehold('BRA', profile);
  const destCost = estMonthlyLivingHousehold(code, profile);
  const costDelta = destCost - brCost;
  const costDeltaTxt = costDelta > 0
    ? '$' + fmtNum(costDelta, 0) + '/mês a mais que seu custo em SP'
    : '$' + fmtNum(Math.abs(costDelta), 0) + '/mês a menos que SP';

  return {
    overall,
    interpretation: scoreInterpretation(overall),
    dims: [
      {
        id: 'lang', label: 'Idioma', score: lang,
        explain: lang >= 70
          ? 'Proximidade alta com português — autonomia em ~' + langMonthsToB1(profile, code) + ' meses com estudo ativo.'
          : 'Barreira moderada/alta — planeje ' + langMonthsToB1(profile, code) + '+ meses até autonomia no dia a dia.'
      },
      {
        id: 'job', label: 'Emprego', score: jobEase,
        explain: 'Facilidade de entrada no mercado: ' + fmtNum(jobEase, 0) + '/100. Desemprego local ' + fmtNum(d.unemployment) + '%. Inglês profissional: ' + fmtNum(ENGLISH_JOBS[code] || ENGLISH_JOBS.default, 0) + '%.'
      },
      {
        id: 'cost', label: 'Custo', score: costScore,
        explain: costIndexExplain(costIdx, code) + ' Para seu perfil: ~$' + fmtNum(destCost, 0) + '/mês (' + costDeltaTxt + ').'
      },
      {
        id: 'health', label: 'Saúde', score: d.healthcare || 50,
        explain: 'Sistema público score ' + fmtNum(d.healthcare, 0) + '/100. Gasto saúde ' + fmtNum(d.health_spend) + '% PIB.'
      },
      {
        id: 'finance', label: 'Financeiro', score: fin.score,
        explain: fin.explain
      }
    ]
  };
}

function getFinancialViability(code, profile) {
  profile = profile || getMergedSimProfile();
  const monthly = estMonthlyLivingHousehold(code, profile);
  const net = typeof netMonthlyIncome === 'function' ? netMonthlyIncome(code, profile) : incomeInUsd(profile);
  const ratio = monthly ? net / monthly : 0;
  const reserve = profile.reserve || 0;
  const monthsCover = monthly ? reserve / monthly : 0;
  let score = 50;
  if (ratio >= 1.5) score += 25;
  else if (ratio >= 1.1) score += 15;
  else if (ratio >= 0.85) score += 5;
  else score -= 20;
  if (monthsCover >= 12) score += 20;
  else if (monthsCover >= 9) score += 12;
  else if (monthsCover >= 6) score += 5;
  else score -= 15;
  if (profile.incomeCurrency === 'BRL') score -= 8;
  score = Math.round(Math.max(0, Math.min(100, score)));
  const ratioLabel = ratio >= 1.3 ? 'confortável' : ratio >= 1.0 ? 'equilibrado' : ratio >= 0.75 ? 'apertado' : 'insuficiente';
  let explain = 'Renda líquida est. $' + fmtNum(net, 0) + '/mês cobre ' + fmtNum(ratio, 1) + '× o custo ($' + fmtNum(monthly, 0) + '/mês) — ' + ratioLabel + '.';
  explain += ' Reserva: ' + fmtNum(monthsCover, 1) + ' meses de runway' + (monthsCover >= 12 ? ' (ideal).' : monthsCover >= 9 ? ' (ok, ideal 12+).' : ' (abaixo do recomendado).');
  if (profile.incomeCurrency === 'BRL') explain += ' Renda em BRL — exposta a risco cambial (~20% de variação possível).';
  if (profile.incomeCurrency === 'EUR') explain += ' Renda em EUR — sem risco cambial na zona euro (vantagem).';
  return { score, ratio, net, monthly, monthsCover, reserve, explain, ratioLabel };
}

function getBrazilDelta(code, profile) {
  profile = profile || getMergedSimProfile();
  const br = data.BRA || {};
  const d = data[code] || {};
  const brCost = profile.costSpUsd || estMonthlyLivingHousehold('BRA', profile);
  const destCost = estMonthlyLivingHousehold(code, profile);
  const brNet = typeof netMonthlyIncome === 'function' ? netMonthlyIncome('BRA', profile) : incomeInUsd(profile);
  const destNet = typeof netMonthlyIncome === 'function' ? netMonthlyIncome(code, profile) : incomeInUsd(profile);
  return [
    { label: 'Custo mensal', br: '$' + fmtNum(brCost, 0), dest: '$' + fmtNum(destCost, 0), delta: (destCost - brCost), fmt: v => (v > 0 ? '+' : '') + '$' + fmtNum(v, 0) },
    { label: 'Segurança', br: fmtNum(br.safety, 0), dest: fmtNum(d.safety, 0), delta: (d.safety || 0) - (br.safety || 0), fmt: v => (v > 0 ? '+' : '') + fmtNum(v, 0) },
    { label: 'Saúde pública', br: fmtNum(br.healthcare, 0), dest: fmtNum(d.healthcare, 0), delta: (d.healthcare || 0) - (br.healthcare || 0), fmt: v => (v > 0 ? '+' : '') + fmtNum(v, 0) },
    { label: 'Felicidade', br: fmtNum(br.happiness, 2), dest: fmtNum(d.happiness, 2), delta: (d.happiness || 0) - (br.happiness || 0), fmt: v => (v > 0 ? '+' : '') + fmtNum(v, 2) },
    { label: 'Renda líquida est.', br: '$' + fmtNum(brNet, 0), dest: '$' + fmtNum(destNet, 0), delta: destNet - brNet, fmt: v => (v > 0 ? '+' : '') + '$' + fmtNum(v, 0) },
    { label: 'Desemprego', br: fmtNum(br.unemployment) + '%', dest: fmtNum(d.unemployment) + '%', delta: (br.unemployment || 0) - (d.unemployment || 0), fmt: v => (v > 0 ? '−' + fmtNum(v, 1) + ' pp (melhor)' : '+' + fmtNum(Math.abs(v), 1) + ' pp') }
  ];
}

function getExpatVerdict(code, profile) {
  profile = profile || getMergedSimProfile();
  const filter = passesMustHaveFilters(code, profile);
  const breakdown = calcFamilyEUScoreBreakdown(code, profile);
  const fin = getFinancialViability(code, profile);
  const visa = typeof pickBestVisaPath === 'function' ? pickBestVisaPath(code, profile) : null;
  const gaps = [];

  if (!filter.pass) {
    return {
      level: 'red',
      icon: '🔴',
      label: 'Não recomendado para o seu perfil agora',
      line: 'Falha nos filtros eliminatórios: ' + filter.failed.join(', ') + '.',
      gaps: filter.failed
    };
  }
  if (fin.ratio < 0.75) gaps.push('renda insuficiente vs. custo de vida');
  if (fin.monthsCover < 6) gaps.push('reserva abaixo de 6 meses');
  if (visa && visa.months > profile.timelineMonths) gaps.push('visto demora ' + visa.months + 'm (seu prazo: ' + profile.timelineMonths + 'm)');
  if (breakdown.overall < 50) gaps.push('score geral baixo');

  if (breakdown.overall >= 75 && fin.ratio >= 1.1 && fin.monthsCover >= 9 && gaps.length === 0) {
    return {
      level: 'green',
      icon: '🟢',
      label: 'Faz sentido ir agora',
      line: 'Score alto, financeiro viável e caminho de entrada compatível com seu prazo.',
      gaps: []
    };
  }
  if (breakdown.overall >= 50 && fin.ratio >= 0.85) {
    const main = gaps[0] || 'preparação em idioma, reserva ou visto';
    return {
      level: 'yellow',
      icon: '🟡',
      label: 'Faz sentido com preparação',
      line: 'Viável, mas principal gap: ' + main + '.',
      gaps
    };
  }
  return {
    level: 'red',
    icon: '🔴',
    label: 'Não recomendado para o seu perfil agora',
    line: gaps.length ? 'Motivos: ' + gaps.join('; ') + '.' : 'Score ou viabilidade financeira abaixo do mínimo.',
    gaps
  };
}

function filterTradeoffsByProfile(code, profile) {
  const base = getCountryTradeoffs(code);
  profile = profile || getMergedSimProfile();
  let gains = base.pros ? resolveTradeoffList(base.pros, profile) : [...(base.gains || [])];
  let losses = base.cons ? resolveTradeoffList(base.cons, profile) : [...(base.losses || [])];
  if (!gains.length && base.gains) gains = [...base.gains];
  if (!losses.length && base.losses) losses = [...base.losses];
  if (profile.incomeCurrency === 'BRL' && !losses.some(l => l.includes('BRL'))) {
    losses.push('Renda em BRL: queda de 20% no câmbio = queda de 20% no poder de compra na Europa');
  }
  if (profile.incomeType === 'entrepreneur' || profile.incomeType === 'remote') {
    const tax = getExpatTax(code);
    if (tax.special && !gains.some(g => g.includes(tax.special.name))) {
      gains.push('Regime especial: ' + tax.special.name + ' — ' + tax.special.note);
    }
  }
  if (profile.incomeType === 'clt_br') {
    losses.push('CLT no Brasil: perder emprego local = perder renda ao mudar sem oferta no destino');
  }
  if ((profile.langLevel === 'none' || profile.langLevel === 'basic') && !losses.some(l => l.includes('Idioma'))) {
    losses.push('Idioma atual ' + (profile.langLevel === 'none' ? 'zero' : 'básico') + ': autonomia em ~' + langMonthsToB1(profile, code) + ' meses');
  }
  if (profile.citizenshipPath === 'ita_ancestry' && code === 'ITA' && !gains.some(g => g.includes('ascendência'))) {
    gains.unshift('Ascendência italiana: caminho de cidadania UE via processo judicial (12–24 meses)');
  }
  return { gains: gains.slice(0, 7), losses: losses.slice(0, 7) };
}

function getReadinessChecklist(code, profile) {
  profile = profile || getMergedSimProfile();
  const fin = getFinancialViability(code, profile);
  const visa = typeof pickBestVisaPath === 'function' ? pickBestVisaPath(code, profile) : null;
  const items = [
    { ok: fin.monthsCover >= 12, label: 'Reserva para 12+ meses no destino', miss: 'reserva financeira (ideal 12+ meses, tem ' + fmtNum(fin.monthsCover, 1) + ')' },
    { ok: visa && visa.months <= profile.timelineMonths, label: 'Visto viável no prazo declarado', miss: 'ajustar prazo ou caminho de visto' },
    { ok: fin.ratio >= 1.3, label: 'Renda cobre custo com margem (≥1,3×)', miss: 'aumentar renda ou reduzir custo destino' },
    { ok: !!profile.visitedCountry, label: 'Já visitou o país', miss: 'visitar o país antes de decidir (recomendado)' },
    { ok: !!profile.healthPlan, label: 'Plano de saúde para a transição', miss: 'definir seguro saúde para os primeiros meses' },
    { ok: !!profile.legalContact, label: 'Contador/advogado no destino identificado', miss: 'identificar profissional legal/fiscal local' },
    { ok: profile.costSpUsd > 0, label: 'Sabe o custo de vida real (SP informado)', miss: 'informar gasto mensal em SP' },
    { ok: !!(profile.targetCity && profile.targetCity.trim()), label: 'Cidade específica definida (não só país)', miss: 'definir cidade alvo, não só o país' }
  ];
  const done = items.filter(i => i.ok).length;
  const missing = items.filter(i => !i.ok).map(i => i.miss);
  return { pct: Math.round(done / items.length * 100), items, missing };
}

function getSensitivityScenarios(code, profile) {
  profile = profile || getMergedSimProfile();
  const base = getFinancialViability(code, profile);
  const pessimistProfile = { ...profile };
  if (pessimistProfile.incomeCurrency === 'BRL') pessimistProfile.monthlyIncome = pessimistProfile.monthlyIncome * 0.75;
  else pessimistProfile.monthlyIncome = pessimistProfile.monthlyIncome * 0.9;
  const pFin = getFinancialViability(code, pessimistProfile);
  const pRatio = pFin.net / (pFin.monthly * 1.1);
  const optimistProfile = { ...profile, incomeType: 'local', monthlyIncome: profile.monthlyIncome * 1.15 };
  const oFin = getFinancialViability(code, optimistProfile);
  const pLabel = pRatio >= 1.3 ? 'confortável' : pRatio >= 1.0 ? 'equilibrado' : pRatio >= 0.75 ? 'apertado' : 'insuficiente';
  return {
    pessimist: { ratio: pRatio, label: pLabel, note: 'BRL −25% ou renda −10%, custo +10%' },
    base: { ratio: base.ratio, label: base.ratioLabel, note: 'Suas premissas atuais' },
    optimist: { ratio: oFin.ratio, label: oFin.ratioLabel, note: 'Renda local +15% em 12 meses' }
  };
}

function buildCountryAnalysisHtml(code, profile) {
  profile = profile || getMergedSimProfile();
  const c = getCountry(code);
  if (!c) return '';
  const breakdown = calcFamilyEUScoreBreakdown(code, profile);
  const verdict = getExpatVerdict(code, profile);
  const delta = getBrazilDelta(code, profile);
  const trade = filterTradeoffsByProfile(code, profile);
  const reserve = calcReserve9m(code, profile);
  const readiness = getReadinessChecklist(code, profile);
  const sens = getSensitivityScenarios(code, profile);
  const phases = getAdaptationPhases(code);
  const rev = calcReversibilityScore(code, profile);
  const visa = typeof pickBestVisaPath === 'function' ? pickBestVisaPath(code, profile) : null;
  const fin = getFinancialViability(code, profile);

  let h = '<div class="sim-analysis">';
  h += '<div class="sim-verdict sim-verdict-' + verdict.level + '">' + verdict.icon + ' <strong>' + verdict.label + '</strong>';
  h += '<p>' + verdict.line + '</p></div>';

  h += '<div class="sim-score-head"><span class="sim-score-num">' + breakdown.overall + '/100</span>';
  h += '<span class="sim-score-label">' + breakdown.interpretation + '</span></div>';

  h += '<div class="sim-breakdown">';
  breakdown.dims.forEach(d => {
    h += '<div class="sim-dim"><strong>' + d.label + ': ' + d.score + '/100</strong><p>' + d.explain + '</p></div>';
  });
  h += '</div>';

  h += '<div class="sim-section"><h4>Delta vs. Brasil (SP)</h4><div class="table-wrap"><table class="sim-delta-table"><thead><tr><th>Indicador</th><th>Você hoje (BR)</th><th>' + c.name + '</th><th>Δ</th></tr></thead><tbody>';
  delta.forEach(row => {
    const cls = row.delta > 0 && row.label.includes('Custo') ? 'sim-delta-bad' : row.delta < 0 && row.label.includes('Custo') ? 'sim-delta-good' : row.delta > 0 ? 'sim-delta-good' : row.delta < 0 ? 'sim-delta-bad' : '';
    h += '<tr><td>' + row.label + '</td><td>' + row.br + '</td><td>' + row.dest + '</td><td class="' + cls + '">' + row.fmt(row.delta) + '</td></tr>';
  });
  h += '</tbody></table></div></div>';

  h += '<div class="sim-tradeoffs"><div class="sim-gains"><h4>O que você ganha</h4><ul>';
  trade.gains.forEach(g => { h += '<li>' + g + '</li>'; });
  h += '</ul></div><div class="sim-losses"><h4>O que você perde / piora</h4><ul>';
  trade.losses.forEach(l => { h += '<li>' + l + '</li>'; });
  h += '</ul></div></div>';

  h += '<div class="sim-section"><h4>Viabilidade financeira</h4><p class="muted-text" style="font-size:.85rem">' + fin.explain + '</p>';
  h += '<p class="muted-text" style="font-size:.82rem;margin-top:.35rem">' + reserve.explain + ' Total: <strong>$' + fmtNum(reserve.total, 0) + '</strong>.</p></div>';

  if (visa) {
    h += '<div class="sim-section"><h4>Caminho de entrada</h4><p style="font-size:.85rem"><strong>' + visa.label + '</strong> — prazo ~' + visa.months + ' meses, custo est. $' + fmtNum(visa.costUsd, 0);
    if (visa.minIncome) h += ', renda mín. $' + fmtNum(visa.minIncome, 0) + '/mês';
    h += '.<br><span class="muted-text">' + (visa.next || visa.reason || '') + '</span></p></div>';
  }

  h += '<div class="sim-section"><h4>Curva de adaptação (24 meses)</h4><div class="sim-timeline">';
  phases.forEach(ph => {
    h += '<div class="sim-phase"><span class="sim-phase-range">' + ph.range + '</span><strong>' + ph.title + '</strong><p>' + ph.desc + '</p></div>';
  });
  h += '</div></div>';

  h += '<div class="sim-section"><h4>Reversibilidade: ' + rev + '/100</h4><p class="muted-text" style="font-size:.82rem">Quão fácil voltar se não der certo — voo ~' + (FLIGHT_HOURS_BR[code] ?? FLIGHT_HOURS_BR.default) + 'h, comunidade BR ' + (BRAZILIAN_COMMUNITY[code] ?? BRAZILIAN_COMMUNITY.default) + 'k.</p></div>';

  h += '<div class="sim-section"><h4>Análise de sensibilidade</h4><div class="sim-sensitivity">';
  h += '<div>📉 Pessimista: ' + fmtNum(sens.pessimist.ratio, 1) + '× (' + sens.pessimist.label + ')</div>';
  h += '<div>📊 Base: ' + fmtNum(sens.base.ratio, 1) + '× (' + sens.base.label + ')</div>';
  h += '<div>📈 Otimista: ' + fmtNum(sens.optimist.ratio, 1) + '× (' + sens.optimist.label + ')</div>';
  h += '</div><p class="muted-text" style="font-size:.78rem;margin-top:.4rem">No cenário pessimista, margem ' + (sens.pessimist.ratio >= 1 ? 'ainda ok' : 'crítica — reforce reserva ou renda') + '.</p></div>';

  h += '<div class="sim-readiness"><h4>Prontidão para decidir: ' + readiness.pct + '%</h4><ul class="sim-checklist">';
  readiness.items.forEach(i => {
    h += '<li class="' + (i.ok ? 'ok' : 'miss') + '">' + (i.ok ? '[sim]' : '[pendente]') + ' ' + i.label + '</li>';
  });
  h += '</ul>';
  if (readiness.missing.length) h += '<p class="muted-text" style="font-size:.8rem">O que falta: ' + readiness.missing.slice(0, 3).join(', ') + '.</p>';
  h += '<p class="muted-text" style="font-size:.75rem;margin-top:.35rem">Meta-decisão: você está ' + readiness.pct + '% pronto para tomar essa decisão com segurança.</p>';
  h += '</div>';

  h += '<div class="sim-actions"><button type="button" class="btn secondary" onclick="openExpatDecision(\'' + code + '\')">Análise completa (visto, fiscal, PDF)</button>';
  h += ' <button type="button" class="btn" onclick="exportSimToPlanner(\'' + code + '\')">Enviar ao Planejamento</button></div>';
  h += '</div>';
  return h;
}

function exportSimToPlanner(code) {
  const c = getCountry(code);
  if (!c) return;
  const profile = getMergedSimProfile();
  const verdict = getExpatVerdict(code, profile);
  const visa = typeof pickBestVisaPath === 'function' ? pickBestVisaPath(code, profile) : null;
  try {
    if (typeof saveMeta === 'function') {
      const sel = document.getElementById('plannerTarget');
      if (sel) { sel.value = code; saveMeta(); }
    }
    const notes = document.getElementById('plannerNotes');
    if (notes) {
      const block = '\n\n--- Simulador ' + new Date().toLocaleDateString('pt-BR') + ' ---\n' +
        c.name + ': ' + verdict.label + '\n' +
        (visa ? 'Visto: ' + visa.label + ' (~' + visa.months + 'm)\n' : '') +
        'Reserva 9m: $' + fmtNum(calcReserve9m(code, profile).total, 0) + '\n';
      if (!notes.value.includes('Simulador')) notes.value += block;
    }
    if (typeof switchTab === 'function') switchTab('planner');
  } catch (e) { console.warn(e); }
}

function initEuropeFamilySearch() {
  const input = document.getElementById('familySearch');
  if (input) {
    input.dataset.poolFilter = 'europe';
    input._countrySearchPool = EUROPE_COUNTRIES();
  }
  initCountrySearch('familySearch', null, focusFamilyCountryByCode, { pool: EUROPE_COUNTRIES() });
}

function getEntryBadge(code, profile) {
  profile = profile || getMergedSimProfile();
  if (profile.euCitizen || profile.citizenshipPath === 'eu_citizen') {
    return { label: 'Direto UE', cls: 'sim-badge-green', months: 1 };
  }
  if (profile.citizenshipPath === 'ita_ancestry' && code === 'ITA') {
    return { label: 'Cidadania', cls: 'sim-badge-amber', months: 18 };
  }
  const visa = typeof pickBestVisaPath === 'function' ? pickBestVisaPath(code, profile) : null;
  if (!visa) return { label: '—', cls: '', months: 99 };
  const short = {
    'Visto D7 (renda passiva)': 'D7',
    'Visto D8 (nômade digital)': 'D8',
    'Visto de eleitor (renda passiva)': 'Eleitor',
    'Visto nômade digital': 'Nômade',
    'Visto teletrabalho': 'Teletrabalho',
    'Visado no lucrativo': 'No lucrativo',
    'Nulla osta / trabalho': 'Trabalho',
    'Visto de trabalho': 'Trabalho',
    'Cidadania / residência UE': 'Direto UE'
  };
  const label = short[visa.label] || (visa.label.length > 12 ? visa.label.split(' ')[1] || visa.label.slice(0, 10) : visa.label);
  const ok = visa.months <= (profile.timelineMonths || 12);
  return { label, cls: ok ? 'sim-badge-green' : 'sim-badge-amber', months: visa.months, full: visa.label };
}

function getTaxPct(code, profile) {
  profile = profile || getMergedSimProfile();
  if (typeof effectiveTaxRate !== 'function') return (data[code]?.tax_burden || 30);
  return Math.round(effectiveTaxRate(code, profile) * 100);
}

function getVisaTimelineWarning(code, profile) {
  profile = profile || getMergedSimProfile();
  const badge = getEntryBadge(code, profile);
  const months = badge.months;
  const prazo = profile.timelineMonths || 12;
  if (months > prazo) {
    return { level: 'warn', icon: '⚠️', text: 'Prazo visto ~' + months + 'm excede sua meta de ' + prazo + 'm — considere outro caminho ou estender prazo.' };
  }
  if (months >= prazo * 0.75 && months <= prazo) {
    return { level: 'caution', icon: '⚡', text: 'Prazo visto ~' + months + 'm no limite da sua meta (' + prazo + 'm) — margem apertada.' };
  }
  return null;
}

function getCurrencyAdvantage(profile, code) {
  profile = profile || getMergedSimProfile();
  if (profile.incomeCurrency === 'EUR') {
    return { show: true, text: 'Sem risco cambial', detail: 'Renda em EUR — vantagem na zona euro, sem exposição BRL→EUR.' };
  }
  if (profile.incomeCurrency === 'BRL') {
    return { show: true, text: 'Risco cambial BRL', detail: 'Renda em BRL — queda de 20% no câmbio reduz poder de compra na Europa proporcionalmente.', cls: 'sim-badge-amber' };
  }
  return { show: false };
}

function buildTop3CardExtras(code, profile) {
  const trade = filterTradeoffsByProfile(code, profile);
  const visaWarn = getVisaTimelineWarning(code, profile);
  const curBadge = getCurrencyAdvantage(profile, code);
  let h = '';
  if (curBadge.show && profile.incomeCurrency === 'EUR') {
    h += '<span class="sim-badge sim-badge-green">' + curBadge.text + '</span> ';
  } else if (curBadge.show && profile.incomeCurrency === 'BRL') {
    h += '<span class="sim-badge sim-badge-amber">' + curBadge.text + '</span> ';
  }
  if (visaWarn) {
    h += '<div class="sim-inline-alert sim-inline-' + visaWarn.level + '">' + visaWarn.icon + ' ' + visaWarn.text + '</div>';
  }
  h += '<details class="sim-card-tradeoffs"><summary>Ver trade-offs</summary>';
  h += '<div class="sim-mini-trade"><strong>Ganha:</strong><ul>';
  trade.gains.slice(0, 3).forEach(g => { h += '<li>' + g + '</li>'; });
  h += '</ul><strong>Perde:</strong><ul>';
  trade.losses.slice(0, 3).forEach(l => { h += '<li>' + l + '</li>'; });
  h += '</ul></div></details>';
  return h;
}
