/* WORLDPANEL — Lógica da aplicação */

let data = {};
let history = {};
let activeCountries = new Set(COUNTRIES.map(c => c.code));
let refreshTimer = null;
let online = false;
let charts = {};
let currentTableCat = 'macro';
let histMinYear = null;
let histMaxYear = null;
let loading = false;

const WB_INDICATORS = INDICATORS.filter(i => i.wb);
const WB_DATE_RANGE = '1960:2025';

function initData() {
  data = {};
  COUNTRIES.forEach(c => {
    data[c.code] = { ...(EMBEDDED[c.code] || {}), eci: ECI_DATA[c.code] };
    computeDerived(c.code);
  });
}

function computeDerived(code) {
  const d = data[code];
  if (!d) return;
  const ppp = PPP_FACTOR[code] || 0.5;
  d.salary_ppp = (d.avg_salary || 0) * (1 / ppp);
  d.purchasing_power = ppp * 100;
  d.relocation_score = calcRelocationScore(code);
}

function calcRelocationScore(code, sector = 'sector_tech') {
  const d = data[code];
  if (!d) return 0;
  const salaryNorm = Math.min(100, ((d.avg_salary || 0) / 45));
  const costNorm = Math.max(0, 100 - (d.cost_living || 50));
  const sectorDemand = d[sector] || 50;
  const w = { salary: 0.25, cost: 0.2, safety: 0.15, happy: 0.15, sector: 0.15, immigr: 0.1 };
  return Math.round(
    salaryNorm * w.salary +
    costNorm * w.cost +
    (d.safety || 50) * w.safety +
    ((d.happiness || 5) * 10) * w.happy +
    sectorDemand * w.sector +
    (d.immigration || 50) * w.immigr
  );
}

function getCountry(code) { return COUNTRIES.find(c => c.code === code); }
function getActiveList() { return COUNTRIES.filter(c => activeCountries.has(c.code)); }

async function fetchWBBulk(indicator, countryCodes) {
  const codes = countryCodes.join(';');
  const url = `https://api.worldbank.org/v2/country/${codes}/indicator/${indicator}?format=json&per_page=20000&date=${WB_DATE_RANGE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API');
  const json = await res.json();
  if (!json[1]) return {};
  const byCountry = {};
  json[1].forEach(row => {
    if (row.value == null) return;
    const cc = row.countryiso3code;
    if (!byCountry[cc]) byCountry[cc] = [];
    byCountry[cc].push({ year: +row.date, value: row.value });
  });
  Object.keys(byCountry).forEach(cc => {
    byCountry[cc].sort((a, b) => a.year - b.year);
  });
  return byCountry;
}

function updateHistRange() {
  histMinYear = null;
  histMaxYear = null;
  Object.values(history).forEach(country => {
    Object.values(country).forEach(pts => {
      if (!Array.isArray(pts)) return;
      pts.forEach(p => {
        if (histMinYear === null || p.year < histMinYear) histMinYear = p.year;
        if (histMaxYear === null || p.year > histMaxYear) histMaxYear = p.year;
      });
    });
  });
}

async function loadLiveData(force = false) {
  if (loading && !force) return;
  loading = true;
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  const prog = document.getElementById('loadProgress');
  dot.className = 'status-dot loading';

  const active = getActiveList().map(c => c.code);
  let apiCalls = 0;
  let merged = 0;
  let fromCache = 0;

  if (typeof WorldDB !== 'undefined') {
    const restored = WorldDB.applyToApp(history, data);
    fromCache = restored.restored;
    mergeEmbeddedHistory(history);
    updateHistRange();
    txt.textContent = fromCache
      ? 'Cache local: ' + fromCache + ' séries · verificando atualizações...'
      : 'Buscando World Bank API (1960–2025)...';
  } else {
    txt.textContent = 'Buscando World Bank API (1960–2025)...';
  }

  const total = WB_INDICATORS.length;
  for (let i = 0; i < WB_INDICATORS.length; i++) {
    const ind = WB_INDICATORS[i];
    prog.style.width = ((i / total) * 100) + '%';

    const need = typeof WorldDB !== 'undefined'
      ? WorldDB.needsIndicatorFetch(history, ind.id, active)
      : { fetch: true, codes: active };

    if (!force && !need.fetch) continue;

    try {
      const byCountry = await fetchWBBulk(ind.wb, active);
      apiCalls++;
      for (const code of active) {
        if (!history[code]) history[code] = {};
        const pts = byCountry[code];
        if (pts && pts.length) {
          if (typeof WorldDB !== 'undefined') {
            WorldDB.mergeIndicator(history, ind.id, { [code]: pts });
          } else {
            history[code][ind.id] = pts;
          }
          const series = history[code][ind.id];
          data[code][ind.id] = series[series.length - 1].value;
          merged++;
        }
      }
      await new Promise(r => setTimeout(r, 100));
    } catch (_) { /* mantém cache/embutido */ }
  }

  if (typeof WorldDB !== 'undefined') {
    WorldDB.save(history, { apiCalls, merged, fromCache });
    renderDBStats();
  }

  updateHistRange();
  mergeEmbeddedHistory(history);
  active.forEach(code => computeDerived(code));
  prog.style.width = '100%';
  loading = false;
  online = merged > 0 || fromCache > 0;
  dot.className = 'status-dot' + (online ? '' : ' offline');
  const db = typeof WorldDB !== 'undefined' ? WorldDB.stats() : null;
  txt.textContent = online
    ? (apiCalls ? 'API: ' + apiCalls + ' chamadas · ' : 'Cache · ') + (db ? db.points + ' pontos históricos' : merged + ' séries')
    : 'Offline — cache/embutido (precisa internet para API)';
  document.getElementById('lastUpdate').textContent = '· ' + new Date().toLocaleString('pt-BR');
  document.getElementById('histRange').textContent = histMinYear
    ? '· Histórico: ' + histMinYear + '–' + histMaxYear + ' (' + (histMaxYear - histMinYear) + ' anos)'
    : '';
  renderAll();
  if (typeof runAllFormulas === 'function') runAllFormulas();
  setTimeout(() => { prog.style.width = '0%'; }, 2000);
}

function renderKPIs() {
  const active = getActiveList();
  const avg = key => {
    const vals = active.map(c => data[c.code]?.[key]).filter(v => v != null && !isNaN(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const kpis = [
    { label: 'Países Ativos', val: active.length, sub: `${COUNTRIES.filter(c => c.region === 'europe').length} na Europa` },
    { label: 'IDH Médio', val: fmtNum(avg('hdi'), 3), sub: 'PNUD' },
    { label: 'Felicidade Média', val: fmtNum(avg('happiness'), 2) + '/10', sub: 'World Happiness Report' },
    { label: 'Expectativa Vida', val: fmtNum(avg('life_expectancy'), 1) + ' anos', sub: 'World Bank API' },
    { label: 'PIB pc PPP Médio', val: '$' + fmtNum(avg('gdp_pc_ppp'), 0), sub: 'Ajustado paridade' },
    { label: 'Desemprego Médio', val: fmtNum(avg('unemployment')) + '%', sub: 'Taxa oficial' }
  ];
  document.getElementById('kpiCards').innerHTML = kpis.map(k =>
    `<div class="card flag-card"><h3>${k.label}</h3><div class="kpi">${k.val}<small>${k.sub}</small></div></div>`
  ).join('');
  renderFlagStrip();
}

function renderFlagStrip() {
  const el = document.getElementById('flagStrip');
  if (!el) return;
  el.innerHTML = getActiveList().map(c =>
    '<span title="' + c.name + '">' + flagImg(c.code, 'xs') + '</span>'
  ).join('');
}

function renderTableCatTabs() {
  document.getElementById('tableCatTabs').innerHTML = Object.entries(INDICATOR_CATS).map(([id, cat]) =>
    `<button class="btn secondary ${currentTableCat === id ? 'active' : ''}" onclick="setTableCat('${id}')">${cat.label}</button>`
  ).join('');
}

function setTableCat(cat) {
  currentTableCat = cat;
  renderTableCatTabs();
  renderTable();
}

function renderTable() {
  const cat = INDICATOR_CATS[currentTableCat];
  const inds = cat.ids.map(id => getInd(id)).filter(Boolean);
  document.getElementById('tableTitle').textContent = `Tabela — ${cat.label} (${getActiveList().length} países)`;
  const cols = inds.map(i => `<th>${i.label}</th>`).join('');
  const rows = getActiveList().map(c => {
    const d = data[c.code] || {};
    const cells = inds.map(i => `<td>${i.fmt(d[i.id])}</td>`).join('');
    return `<tr><td>${countryCell(c.code, 'sm', true)}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('mainTable').innerHTML = `<table><thead><tr><th>País</th>${cols}</tr></thead><tbody>${rows}</tbody></table>`;
}

function barGradient(ctx, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

function makeBarChart(canvasId, key, label, color, limit = 15, asc = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  const ctx2d = canvas.getContext('2d');
  let active = getActiveList().slice().sort((a, b) => {
    const va = data[a.code]?.[key] ?? (asc ? 999 : -999);
    const vb = data[b.code]?.[key] ?? (asc ? 999 : -999);
    return asc ? va - vb : vb - va;
  }).slice(0, limit);
  const grad = barGradient(ctx2d, color, color + '55');
  charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: active.map(c => c.name),
      datasets: [{
        label, data: active.map(c => data[c.code]?.[key]),
        backgroundColor: grad,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: chartOpts(false)
  });
}

function chartOpts(legend = true) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: legend, labels: { color: '#8a8a8a', font: { size: 11, family: "'Inter','Segoe UI',sans-serif" }, padding: 14 } },
      tooltip: {
        backgroundColor: '#1a1a1a',
        borderColor: '#3a3a3a',
        borderWidth: 1,
        titleColor: '#ececec',
        bodyColor: '#8a8a8a',
        padding: 10,
        cornerRadius: 6
      }
    },
    scales: {
      x: { ticks: { color: '#8a8a8a', font: { size: 9 } }, grid: { display: false } },
      y: { ticks: { color: '#8a8a8a' }, grid: { color: 'rgba(46,46,46,0.5)', drawBorder: false }, border: { display: false } }
    }
  };
}

function renderOverviewCharts() {
  makeBarChart('chartGdp', 'gdp_pc_ppp', 'PIB PPP', '#5b8fd4');
  makeBarChart('chartHdi', 'hdi', 'IDH', '#3d9a6a', 15);
  makeBarChart('chartHappy', 'happiness', 'Felicidade', '#c9a227');
  makeBarChart('chartLife', 'life_expectancy', 'Anos', '#9b7ec8');
}

function renderQualityTab() {
  const inds = ['hdi', 'happiness', 'life_expectancy', 'gini', 'health_spend', 'edu_spend', 'internet', 'qol_index', 'safety', 'healthcare'];
  const cols = inds.map(id => getInd(id)).filter(Boolean);
  const rows = getActiveList().slice().sort((a, b) => (data[b.code]?.hdi || 0) - (data[a.code]?.hdi || 0)).map(c => {
    const d = data[c.code] || {};
    return `<tr><td>${countryCell(c.code, 'sm', true)}</td>${cols.map(i => `<td>${i.fmt(d[i.id])}</td>`).join('')}</tr>`;
  }).join('');
  document.getElementById('qualityTable').innerHTML =
    `<table><thead><tr><th>País</th>${cols.map(i => `<th>${i.label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  makeBarChart('chartQHdi', 'hdi', 'IDH', '#3d9a6a');
  makeBarChart('chartQHappy', 'happiness', 'Felicidade', '#c9a227');
  makeBarChart('chartQGini', 'gini', 'Gini', '#c45c5c', 15, true);
  makeBarChart('chartQHealth', 'health_spend', 'Saúde %PIB', '#5b8fd4');
}

function renderRelocation() {
  const sector = document.getElementById('relocSector').value;
  const salary = +document.getElementById('relocSalary').value || 2500;
  const active = getActiveList().map(c => {
    const d = data[c.code];
    const ppp = PPP_FACTOR[c.code] || 0.5;
    const equivSalary = salary * (ppp / (PPP_FACTOR.BRA || 0.55));
    const realPower = equivSalary / ((d.cost_living || 50) / 100);
    const score = calcRelocationScore(c.code, sector);
    return { c, d, equivSalary, realPower, score, sectorVal: d[sector] || 0 };
  }).sort((a, b) => b.score - a.score);

  const top = active[0];
  document.getElementById('relocKpis').innerHTML = [
    { label: 'Melhor Destino', val: top ? countryCell(top.c.code, 'md') : '—', sub: 'Score ' + (top?.score || 0) },
    { label: 'Seu Salário Equivalente', val: top ? '$' + fmtNum(top.equivSalary, 0) : '—', sub: 'Ajustado PPP' },
    { label: 'Poder de Compra Real', val: top ? '$' + fmtNum(top.realPower, 0) : '—', sub: 'Após custo de vida' },
    { label: 'Demanda Setorial', val: top ? fmtNum(top.sectorVal, 0) + '/100' : '—', sub: document.getElementById('relocSector').selectedOptions[0].text }
  ].map(k => `<div class="card reloc-card"><h3>${k.label}</h3><div class="kpi" style="font-size:1.3rem">${k.val}<small>${k.sub}</small></div></div>`).join('');

  const rows = active.map((x, i) => `<tr>
    <td>${i + 1}</td>
    <td>${countryCell(x.c.code, 'sm', true)}</td>
    <td><strong>${x.score}</strong><div class="score-bar"><div style="width:${x.score}%"></div></div></td>
    <td>$${fmtNum(x.d.avg_salary, 0)}</td>
    <td>$${fmtNum(x.equivSalary, 0)}</td>
    <td>${fmtNum(x.d.cost_living, 0)}</td>
    <td>${fmtNum(x.d.rent_index, 0)}</td>
    <td>${fmtNum(x.sectorVal, 0)}</td>
    <td>${fmtNum(x.d.safety, 0)}</td>
    <td>${fmtNum(x.d.happiness, 2)}</td>
    <td>${fmtNum(x.d.immigration, 0)}</td>
    <td>${fmtNum(x.d.tax_burden)}%</td>
  </tr>`).join('');

  document.getElementById('relocTable').innerHTML = `<table><thead><tr>
    <th>#</th><th>País</th><th>Score</th><th>Salário Médio</th><th>Seu Salário PPP</th>
    <th>Custo Vida</th><th>Aluguel</th><th>Demanda</th><th>Segurança</th><th>Felicidade</th><th>Imigração</th><th>Impostos</th>
  </tr></thead><tbody>${rows}</tbody></table>`;

  const top10 = active.slice(0, 10);
  const ctx = document.getElementById('chartReloc');
  if (charts.reloc) charts.reloc.destroy();
  charts.reloc = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(x => x.c.name),
      datasets: [{ label: 'Score Mudança', data: top10.map(x => x.score), backgroundColor: '#9b7ec8', borderRadius: 4 }]
    },
    options: chartOpts(false)
  });

  if (top) {
    document.getElementById('relocDetail').innerHTML = `
      <div class="compare-header">${flagImg(top.c.code, 'lg')}<h3>Análise — ${top.c.name}</h3></div>
      <p style="margin:.5rem 0;font-size:.9rem">Com salário de <strong>$${fmtNum(salary, 0)}/mês</strong>, seu poder de compra equivalente seria <strong>$${fmtNum(top.equivSalary, 0)}</strong> (PPP).</p>
      <p style="font-size:.9rem">Após custo de vida (índice ${fmtNum(top.d.cost_living, 0)}), poder real estimado: <strong>$${fmtNum(top.realPower, 0)}/mês</strong>.</p>
      <p style="font-size:.85rem;color:var(--muted);margin-top:.75rem">IDH: ${fmtNum(top.d.hdi, 3)} · Felicidade: ${fmtNum(top.d.happiness, 2)} · Desemprego: ${fmtNum(top.d.unemployment)}% · Saúde: ${fmtNum(top.d.healthcare, 0)}/100</p>
      <p style="font-size:.85rem;color:var(--muted)">Emprego: Serviços ${fmtNum(top.d.emp_services)}% · Indústria ${fmtNum(top.d.emp_industry)}% · Demanda ${document.getElementById('relocSector').selectedOptions[0].text}: ${fmtNum(top.sectorVal, 0)}/100</p>
    `;
  }
}

function renderIndicatorDetail() {
  if (typeof renderHistoryPanel === 'function') renderHistoryPanel();
}

function stats(vals) {
  const n = vals.length;
  if (!n) return {};
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  const sorted = [...vals].sort((a, b) => a - b);
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return { mean, median, std: Math.sqrt(variance) };
}

function generateConclusions() {
  const active = getActiveList();
  const byHappy = active.map(c => ({ c, v: data[c.code]?.happiness || 0 })).sort((a, b) => b.v - a.v);
  const byHdi = active.map(c => ({ c, v: data[c.code]?.hdi || 0 })).sort((a, b) => b.v - a.v);
  const byReloc = active.map(c => ({ c, v: data[c.code]?.relocation_score || 0 })).sort((a, b) => b.v - a.v);
  const misery = active.map(c => ({ c, v: (data[c.code]?.inflation || 0) + (data[c.code]?.unemployment || 0) })).sort((a, b) => b.v - a.v);
  const hdiStats = stats(active.map(c => data[c.code]?.hdi).filter(Boolean));

  document.getElementById('conclusionsContent').innerHTML = `
    <div class="conclusion-block"><h4>Estatísticas Globais</h4>
      <p>IDH — Média: ${fmtNum(hdiStats.mean, 3)} · Mediana: ${fmtNum(hdiStats.median, 3)} · ${active.length} países</p>
      <p>Histórico API: ${histMinYear ? `${histMinYear}–${histMaxYear}` : 'carregando...'} · Fonte: ${online ? 'World Bank ao vivo' : 'embutido'}</p></div>
    <div class="conclusion-block"><h4>Top Felicidade (ONU)</h4>
      ${byHappy.slice(0, 5).map(x => countryTag(x.c.code, x.c.name + ': ' + fmtNum(x.v, 2), 'up')).join('')}</div>
    <div class="conclusion-block"><h4>Top IDH (PNUD)</h4>
      ${byHdi.slice(0, 5).map(x => countryTag(x.c.code, x.c.name + ': ' + fmtNum(x.v, 3), 'up')).join('')}</div>
    <div class="conclusion-block"><h4>Melhores para Mudar</h4>
      ${byReloc.slice(0, 5).map(x => countryTag(x.c.code, x.c.name + ': ' + fmtNum(x.v, 0) + '/100', 'neutral')).join('')}
      <p style="font-size:.85rem;margin-top:.5rem">Score combina salário, custo de vida, segurança, felicidade, demanda setorial e facilidade de imigração.</p></div>
    <div class="conclusion-block"><h4>Maior Misery Index</h4>
      ${misery.slice(0, 3).map(x => countryTag(x.c.code, x.c.name + ': ' + fmtNum(x.v), 'down')).join('')}</div>
    <div class="conclusion-block"><h4>Casal UE — Formar família</h4>
      <p style="font-size:.88rem">Com ensino superior, pouco idioma e passaporte europeu, o ranking pondera <em>idioma + emprego inicial + custo + saúde</em>. Veja análise completa na aba <strong>Mudança</strong> e guias na aba <strong>Guias País</strong>.</p>
      ${(() => {
        const eu = COUNTRIES.filter(c => c.region === 'europe' && c.code !== 'RUS' && c.code !== 'GBR');
        const top = eu.map(c => ({ c, s: calcFamilyEUScore(c.code) })).sort((a, b) => b.s - a.s).slice(0, 5);
        return top.map(x => countryTag(x.c.code, x.c.name + ': ' + x.s + '/100', 'up')).join('');
      })()}
    </div>
    <div class="conclusion-block"><h4>Para quem quer morar no exterior</h4>
      <ul style="font-size:.88rem;padding-left:1.2rem">
        <li><strong>Europa Norte</strong> (FIN, DNK, NOR): felicidade e IDH altos, mas custo de vida elevado.</li>
        <li><strong>Portugal/Espanha</strong>: bom equilíbrio custo-benefício; com cidadania UE trabalham desde o dia 1.</li>
        <li><strong>Irlanda</strong>: inglês + tech, mas aluguel caro — precisa reserva maior.</li>
        <li><strong>Polônia/Tcheca</strong>: custo baixo na UE, mas barreira de idioma maior.</li>
        <li>Use as fórmulas 8–10 (fluxo de caixa, moradia, reserva) antes de decidir.</li>
      </ul></div>
  `;
}

function exportReport() {
  generateConclusions();
  const lines = ['WORLDPANEL — Relatório Global', '='.repeat(55), `Gerado: ${new Date().toLocaleString('pt-BR')}`, `Países: ${getActiveList().length} · Histórico: ${histMinYear || '?'}-${histMaxYear || '?'}`, ''];
  getActiveList().forEach(c => {
    const d = data[c.code] || {};
    lines.push(`${c.name} (${c.code})`);
    ['hdi', 'happiness', 'gdp_pc_ppp', 'avg_salary', 'cost_living', 'unemployment', 'life_expectancy', 'relocation_score'].forEach(k => {
      const ind = getInd(k);
      if (ind) lines.push(`  ${ind.label}: ${ind.fmt(d[k])}`);
    });
    lines.push('');
  });
  lines.push(document.getElementById('conclusionsContent').innerText);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `worldpanel_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
}

function populateSelects() {
  const opts = COUNTRIES.map(c => `<option value="${c.code}">${countrySelectLabel(c.code)}</option>`).join('');
  const indEl = document.getElementById('indCountry');
  if (indEl) indEl.innerHTML = opts;
}

function renderDBStats() {
  const el = document.getElementById('dbStats');
  if (!el || typeof WorldDB === 'undefined') return;
  const s = WorldDB.stats();
  el.innerHTML = '<p style="font-size:.85rem;margin:.25rem 0"><strong>Cache local:</strong> ' + s.points.toLocaleString('pt-BR') + ' pontos · ' + s.series + ' séries · ' + s.countries + ' países</p>' +
    '<p style="font-size:.82rem;color:var(--muted)">Período: ' + s.range + ' · ' + s.sizeKB + ' KB · Salvo: ' + (s.savedAt ? new Date(s.savedAt).toLocaleString('pt-BR') : '—') + '</p>';
}

function clearLocalDB() {
  if (typeof WorldDB !== 'undefined') WorldDB.clear();
  history = {};
  histMinYear = histMaxYear = null;
  initData();
  renderDBStats();
  loadLiveData(true);
}

function renderCountryToggles() {
  const regions = { europe: 'Europa', americas: 'Américas', asia: 'Ásia', africa: 'África', oceania: 'Oceania' };
  let html = '';
  Object.entries(regions).forEach(([reg, label]) => {
    const list = COUNTRIES.filter(c => c.region === reg);
    if (!list.length) return;
    html += `<div class="region-label">${label}</div><div class="config-list">`;
    html += list.map(c =>
      `<label class="country-cell"><input type="checkbox" ${activeCountries.has(c.code) ? 'checked' : ''} onchange="toggleCountry('${c.code}', this.checked)"> ${flagImg(c.code, 'xs')} ${c.name}</label>`
    ).join('');
    html += '</div>';
  });
  document.getElementById('countryToggles').innerHTML = html;
  document.getElementById('countryCount').textContent = activeCountries.size;
}

function toggleCountry(code, on) {
  if (on) activeCountries.add(code); else activeCountries.delete(code);
  document.getElementById('countryCount').textContent = activeCountries.size;
  getActiveList().forEach(c => computeDerived(c.code));
  renderAll();
}

function toggleRegion(region, on) {
  COUNTRIES.filter(c => c.region === region).forEach(c => on ? activeCountries.add(c.code) : activeCountries.delete(c.code));
  renderCountryToggles();
  renderAll();
}

function toggleAllCountries(on) {
  COUNTRIES.forEach(c => on ? activeCountries.add(c.code) : activeCountries.delete(c.code));
  renderCountryToggles();
  renderAll();
}

function applyConfig() {
  const sec = +document.getElementById('refreshInterval').value || 120;
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => loadLiveData(), sec * 1000);
}

function renderAll() {
  renderKPIs();
  renderTableCatTabs();
  renderTable();
  renderOverviewCharts();
  renderQualityTab();
}

document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'compare') { initCompareTab(); renderCompare(); }
    if (btn.dataset.tab === 'indicators') { initHistoryTab(); renderHistoryPanel(); }
    if (btn.dataset.tab === 'relocation') { renderRelocation(); renderFamilyProfile(); }
    if (btn.dataset.tab === 'quality') renderQualityTab();
    if (btn.dataset.tab === 'formulas') {
      if (typeof buildFormulas === 'function' && !document.getElementById('fMiseryCountry')) buildFormulas();
      if (typeof runAllFormulas === 'function') runAllFormulas();
    }
    if (btn.dataset.tab === 'config') renderDBStats();
    if (btn.dataset.tab === 'guides' && typeof initGuidesTab === 'function') initGuidesTab();
    if (btn.dataset.tab === 'planner' && typeof initPlannerTab === 'function') initPlannerTab();
  });
});

initData();
mergeEmbeddedHistory(history);
if (typeof buildFormulas === 'function') buildFormulas();
populateSelects();
renderCountryToggles();
renderAll();
if (typeof runAllFormulas === 'function') runAllFormulas();
renderDBStats();
loadLiveData();
applyConfig();
