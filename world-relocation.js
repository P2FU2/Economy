/* WORLDPANEL — Tela 3: Ranking para Morar (salário, imposto, sobra mensal) */

const RELOC_IMMIG_TOOLTIP = 'Facilidade de imigração para brasileiros: 100 = muito fácil, 0 = muito difícil. Considera vistos disponíveis, prazo e custo.';

let relocRowsCache = [];
let relocSortCol = 'score';
let relocSortDir = 'desc';
let relocSelectedCode = null;

function getRelocProfile() {
  return typeof getMergedSimProfile === 'function' ? getMergedSimProfile() : { household: 'solo', incomeType: 'remote', monthlyIncome: 2500 };
}

function getRelocTaxRate(code, profile) {
  profile = profile || getRelocProfile();
  const burden = (data[code]?.tax_burden || 30) / 100;
  const tax = typeof getExpatTax === 'function' ? getExpatTax(code) : null;
  if (tax?.special && (profile.incomeType === 'entrepreneur' || profile.incomeType === 'remote')) {
    return Math.min(burden, tax.special.rate || tax.foreignRate || burden);
  }
  if (tax && (profile.incomeType === 'remote' || profile.incomeType === 'clt_br' || profile.incomeType === 'passive')) {
    return Math.min(burden, tax.foreignRate || burden);
  }
  return burden;
}

function estRelocMonthlyCost(code, profile) {
  profile = profile || getRelocProfile();
  if (typeof estMonthlyLivingHousehold === 'function') {
    return estMonthlyLivingHousehold(code, profile);
  }
  return estMonthlyCost(code) + estRent(code);
}

function calcRelocMetrics(code, salary, profile) {
  profile = profile || getRelocProfile();
  const d = data[code] || {};
  const ppp = PPP_FACTOR[code] || 0.5;
  const brPpp = PPP_FACTOR.BRA || 0.55;
  const equivSalary = salary * (ppp / brPpp);
  const taxRate = getRelocTaxRate(code, profile);
  const taxPct = Math.round(taxRate * 100);
  const netSalary = equivSalary * (1 - taxRate);
  const monthlyCost = estRelocMonthlyCost(code, profile);
  const surplus = netSalary - monthlyCost;
  return { equivSalary, netSalary, taxRate, taxPct, monthlyCost, surplus, d };
}

function calcRelocationScoreV2(code, sector, metrics) {
  const d = data[code] || {};
  if (!d || !metrics) return calcRelocationScore(code, sector);
  const ratio = metrics.monthlyCost > 0 ? metrics.netSalary / metrics.monthlyCost : 0;
  let financeNorm = Math.min(100, Math.max(0, ratio * 40));
  if (metrics.surplus < 0) financeNorm = Math.max(0, financeNorm + metrics.surplus / 200);
  const costNorm = Math.max(0, 100 - (d.cost_living || 50));
  const sectorDemand = d[sector] || 50;
  const w = { finance: 0.32, cost: 0.08, safety: 0.12, happy: 0.10, sector: 0.22, immigr: 0.08, surplus: 0.08 };
  return Math.round(
    financeNorm * w.finance +
    costNorm * w.cost +
    (d.safety || 50) * w.safety +
    ((d.happiness || 5) * 10) * w.happy +
    sectorDemand * w.sector +
    (d.immigration || 50) * w.immigr +
    Math.min(100, Math.max(0, 50 + metrics.surplus / 150)) * w.surplus
  );
}

function buildRelocRows(salary, sector) {
  const profile = getRelocProfile();
  return getActiveList().map(c => {
    const m = calcRelocMetrics(c.code, salary, profile);
    const score = calcRelocationScoreV2(c.code, sector, m);
    return {
      c,
      d: m.d,
      score,
      sectorVal: m.d[sector] || 0,
      equivSalary: m.equivSalary,
      netSalary: m.netSalary,
      taxPct: m.taxPct,
      monthlyCost: m.monthlyCost,
      surplus: m.surplus
    };
  });
}

const RELOC_COL_KEYS = {
  rank: { sort: null },
  country: { sort: 'name', get: r => r.c.name.toLowerCase() },
  score: { sort: 'score', get: r => r.score },
  avgSalary: { sort: 'avgSalary', get: r => r.d.avg_salary || 0 },
  equivSalary: { sort: 'equivSalary', get: r => r.equivSalary },
  netSalary: { sort: 'netSalary', get: r => r.netSalary },
  surplus: { sort: 'surplus', get: r => r.surplus },
  cost: { sort: 'cost', get: r => r.d.cost_living || 0 },
  rent: { sort: 'rent', get: r => estRent(r.c.code) },
  sector: { sort: 'sector', get: r => r.sectorVal },
  safety: { sort: 'safety', get: r => r.d.safety || 0 },
  happy: { sort: 'happy', get: r => r.d.happiness || 0 },
  immigr: { sort: 'immigr', get: r => r.d.immigration || 0 },
  tax: { sort: 'tax', get: r => r.taxPct }
};

function sortRelocRows(rows, col, dir) {
  const cfg = RELOC_COL_KEYS[col];
  if (!cfg || !cfg.get) return rows.slice();
  const mul = dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const va = cfg.get(a);
    const vb = cfg.get(b);
    if (typeof va === 'string') return va.localeCompare(vb) * mul;
    return (va - vb) * mul;
  });
}

function sortRelocTable(col) {
  if (relocSortCol === col) relocSortDir = relocSortDir === 'asc' ? 'desc' : 'asc';
  else { relocSortCol = col; relocSortDir = col === 'country' ? 'asc' : 'desc'; }
  renderRelocationTable(relocRowsCache);
}

function relocTh(col, label, title) {
  const active = relocSortCol === col;
  const arrow = active ? (relocSortDir === 'asc' ? ' ▲' : ' ▼') : '';
  const tip = title ? ' title="' + title.replace(/"/g, '&quot;') + '"' : '';
  return '<th class="sortable-th' + (active ? ' sort-active' : '') + '" onclick="sortRelocTable(\'' + col + '\')"' + tip + '>' + label + arrow + '</th>';
}

function renderRelocationKpis(rows, salary, sector) {
  const sorted = sortRelocRows(rows, 'score', 'desc');
  const top = sorted[0];
  const second = sorted[1];
  const el = document.getElementById('relocKpis');
  if (!el || !top) { if (el) el.innerHTML = ''; return; }

  let taxInsight = '';
  const byScore = sortRelocRows(rows, 'score', 'desc');
  const byNet = sortRelocRows(rows, 'netSalary', 'desc').slice(0, 5);
  const bestNet = byNet[0];
  if (bestNet && bestNet.c.code !== top.c.code) {
    const diff = bestNet.netSalary - top.netSalary;
    taxInsight = top.c.name + ' lidera o score geral, mas ' + bestNet.c.name + ' deixa mais líquido ($' + fmtNum(bestNet.netSalary, 0) + '/mês vs $' + fmtNum(top.netSalary, 0) + ' — +' + fmtNum(diff, 0) + '). Imposto: ' + top.taxPct + '% vs ' + bestNet.taxPct + '%.';
  } else if (second && top.taxPct > second.taxPct + 5) {
    taxInsight = second.c.name + ' cobra ' + second.taxPct + '% vs ' + top.taxPct + '% em ' + top.c.name + ' — diferença de $' + fmtNum(top.equivSalary * (top.taxPct - second.taxPct) / 100, 0) + '/mês em imposto sobre o PPP.';
  }

  el.innerHTML = [
    { label: 'Melhor destino', val: countryCell(top.c.code, 'md'), sub: 'Score ' + top.score + ' (pós-imposto e custo)' },
    { label: 'Salário PPP equivalente', val: '$' + fmtNum(top.equivSalary, 0), sub: 'Seu $' + fmtNum(salary, 0) + ' ajustado ao país' },
    { label: 'Renda líquida (pós-imposto)', val: '$' + fmtNum(top.netSalary, 0), sub: 'Alíquota est. ' + top.taxPct + '% · imposto −$' + fmtNum(top.equivSalary - top.netSalary, 0) },
    { label: 'Sobra mensal', val: '$' + fmtNum(top.surplus, 0), sub: 'Líquido $' + fmtNum(top.netSalary, 0) + ' − custo $' + fmtNum(top.monthlyCost, 0) }
  ].map(k => '<div class="card reloc-card"><h3>' + k.label + '</h3><div class="kpi" style="font-size:1.2rem">' + k.val + '<small>' + k.sub + '</small></div></div>').join('') +
    (taxInsight ? '<div class="card reloc-card reloc-tax-insight" style="grid-column:1/-1"><h3>Trade-off de imposto</h3><p style="font-size:.85rem;margin:0">' + taxInsight + ' Compare a coluna <strong>Renda líquida</strong> na tabela.</p></div>' : '');
}

function renderRelocationTable(rows) {
  relocRowsCache = rows;
  const sorted = sortRelocRows(rows, relocSortCol, relocSortDir);
  const tbody = sorted.map((x, i) => {
    const sel = relocSelectedCode === x.c.code ? ' class="sim-row-active"' : '';
    return '<tr data-reloc-code="' + x.c.code + '"' + sel + ' onclick="selectRelocCountry(\'' + x.c.code + '\')">' +
      '<td>' + (i + 1) + '</td>' +
      '<td>' + countryCell(x.c.code, 'sm', true) + '</td>' +
      '<td><strong>' + x.score + '</strong><div class="score-bar"><div style="width:' + x.score + '%"></div></div></td>' +
      '<td>$' + fmtNum(x.d.avg_salary, 0) + '</td>' +
      '<td>$' + fmtNum(x.equivSalary, 0) + '</td>' +
      '<td><strong>$' + fmtNum(x.netSalary, 0) + '</strong><div style="font-size:.65rem;color:var(--muted)">' + x.taxPct + '% IR</div></td>' +
      '<td class="' + (x.surplus >= 0 ? 'sim-delta-good' : 'sim-delta-bad') + '">$' + fmtNum(x.surplus, 0) + '</td>' +
      '<td>' + fmtNum(x.d.cost_living, 0) + '</td>' +
      '<td>$' + fmtNum(estRent(x.c.code), 0) + '</td>' +
      '<td>' + fmtNum(x.sectorVal, 0) + '</td>' +
      '<td>' + fmtNum(x.d.safety, 0) + '</td>' +
      '<td>' + fmtNum(x.d.happiness, 2) + '</td>' +
      '<td>' + fmtNum(x.d.immigration, 0) + '</td>' +
      '<td>' + x.taxPct + '%</td></tr>';
  }).join('');

  document.getElementById('relocTable').innerHTML = '<table id="relocDataTable"><thead><tr>' +
    '<th>#</th>' + relocTh('country', 'País') +
    relocTh('score', 'Score') +
    relocTh('avgSalary', 'Sal. médio') +
    relocTh('equivSalary', 'Salário PPP', 'Seu salário convertido pelo fator PPP do país') +
    relocTh('netSalary', 'Renda líquida', 'Salário PPP após imposto estimado sobre renda estrangeira') +
    relocTh('surplus', 'Sobra/mês', 'Renda líquida − custo mensal estimado (aluguel + vida)') +
    relocTh('cost', 'Custo (NYC=100)', 'Índice de custo de vida — Nova York = 100') +
    relocTh('rent', 'Aluguel 1BR', '1BR centro capital, USD, Numbeo 2024') +
    relocTh('sector', 'Demanda') +
    relocTh('safety', 'Segurança') +
    relocTh('happy', 'Felicidade') +
    relocTh('immigr', 'Imigração', RELOC_IMMIG_TOOLTIP) +
    relocTh('tax', 'Impostos', 'Alíquota efetiva estimada sobre renda (remota/estrangeira)') +
    '</tr></thead><tbody>' + tbody + '</tbody></table>';
}

function selectRelocCountry(code) {
  relocSelectedCode = code;
  renderRelocationTable(relocRowsCache);
  renderRelocDetail(code);
}

function renderRelocDetail(code) {
  const el = document.getElementById('relocDetail');
  if (!el) return;
  const salary = +document.getElementById('relocSalary')?.value || 2500;
  const sector = document.getElementById('relocSector')?.value || 'sector_tech';
  const profile = getRelocProfile();
  const row = relocRowsCache.find(r => r.c.code === code);
  if (!row) return;
  const c = row.c;
  const m = calcRelocMetrics(code, salary, profile);
  const trade = typeof filterTradeoffsByProfile === 'function' ? filterTradeoffsByProfile(code, profile) : { gains: [], losses: [] };
  const phases = typeof getAdaptationPhases === 'function' ? getAdaptationPhases(code) : [];
  const readiness = typeof getReadinessChecklist === 'function' ? getReadinessChecklist(code, profile) : null;
  const sectorLabel = document.getElementById('relocSector')?.selectedOptions[0]?.text || 'TI';

  let h = '<div class="compare-header">' + flagImg(code, 'lg') + '<h3>Análise — ' + c.name + '</h3></div>';
  h += '<p style="margin:.5rem 0;font-size:.88rem">Com <strong>$' + fmtNum(salary, 0) + '/mês</strong> em ' + sectorLabel + ':</p>';
  h += '<ul style="font-size:.85rem;line-height:1.6;padding-left:1.1rem;margin:.5rem 0">';
  h += '<li>Salário PPP: <strong>$' + fmtNum(m.equivSalary, 0) + '</strong></li>';
  h += '<li>Após imposto (' + m.taxPct + '%): <strong>$' + fmtNum(m.netSalary, 0) + '</strong></li>';
  h += '<li>Custo mensal est.: <strong>$' + fmtNum(m.monthlyCost, 0) + '</strong> (vida + aluguel 1BR)</li>';
  h += '<li><strong>Sobra mensal: $' + fmtNum(m.surplus, 0) + '</strong></li>';
  h += '</ul>';

  h += '<div class="sim-tradeoffs" style="margin-top:1rem"><div class="sim-gains"><h4>O que você ganha</h4><ul>';
  trade.gains.forEach(g => { h += '<li>' + g + '</li>'; });
  h += '</ul></div><div class="sim-losses"><h4>O que você perde / piora</h4><ul>';
  trade.losses.forEach(l => { h += '<li>' + l + '</li>'; });
  h += '</ul></div></div>';

  if (phases.length) {
    h += '<div class="sim-section"><h4>Curva de adaptação (24 meses)</h4><div class="sim-timeline sim-timeline-4col">';
    phases.forEach(ph => {
      h += '<div class="sim-phase"><span class="sim-phase-range">' + ph.range + '</span><strong>' + ph.title + '</strong><p>' + ph.desc + '</p></div>';
    });
    h += '</div></div>';
  }

  if (readiness) {
    h += '<div class="sim-readiness"><h4>Prontidão para decidir: ' + readiness.pct + '%</h4><ul class="sim-checklist">';
    readiness.items.forEach(i => {
      h += '<li class="' + (i.ok ? 'ok' : 'miss') + '">' + (i.ok ? '[sim]' : '[pendente]') + ' ' + i.label + '</li>';
    });
    h += '</ul>';
    if (readiness.missing.length) {
      h += '<p class="muted-text" style="font-size:.8rem">O que falta: ' + readiness.missing.slice(0, 4).join(', ') + '.</p>';
    }
    h += '</div>';
  }

  h += '<p style="font-size:.82rem;color:var(--muted);margin-top:.75rem">IDH ' + fmtNum(row.d.hdi, 3) + ' · Desemprego ' + fmtNum(row.d.unemployment) + '% · Imigração ' + fmtNum(row.d.immigration, 0) + '/100</p>';
  el.innerHTML = h;
}

function renderRelocationChart(rows) {
  const sorted = sortRelocRows(rows, 'score', 'desc');
  const top10 = sorted.slice(0, 10);
  const ctx = document.getElementById('chartReloc');
  if (!ctx) return;
  if (charts.reloc) charts.reloc.destroy();
  charts.reloc = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(x => x.c.name),
      datasets: [{ label: 'Score (pós-imposto)', data: top10.map(x => x.score), backgroundColor: '#9b7ec8', borderRadius: 4 }]
    },
    options: chartOpts(false)
  });
}
