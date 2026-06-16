/* WORLDPANEL — Comparar países no mesmo indicador */

const CMP_MAX_COUNTRIES = 6;
let cmpSelected = new Set(['BRA', 'ITA', 'PRT', 'DEU']);

function initCompareTab() {
  const picker = document.getElementById('cmpCountryPicker');
  const indSel = document.getElementById('cmpIndicator');
  if (indSel && !indSel.options.length) {
    indSel.innerHTML = INDICATORS.filter(i => i.wb).map(i =>
      '<option value="' + i.id + '">' + i.label + '</option>'
    ).join('');
    indSel.value = 'gdp_pc_ppp';
  }
  if (!picker || picker.dataset.ready) return;
  picker.dataset.ready = '1';
  renderCmpCountryPicker();
}

function renderCmpCountryPicker() {
  const picker = document.getElementById('cmpCountryPicker');
  if (!picker) return;
  let html = '<div class="hist-chips">';
  getActiveList().forEach(c => {
    const on = cmpSelected.has(c.code);
    html += '<label class="hist-chip' + (on ? ' on' : '') + '">' + flagImg(c.code, 'xs') +
      '<input type="checkbox" value="' + c.code + '"' + (on ? ' checked' : '') + ' onchange="toggleCmpCountry(this)">' +
      '<span>' + c.name + '</span></label>';
  });
  html += '</div>';
  picker.innerHTML = html;
}

function toggleCmpCountry(cb) {
  const code = cb.value;
  if (cb.checked) {
    if (cmpSelected.size >= CMP_MAX_COUNTRIES) {
      cb.checked = false;
      alert('Máximo de ' + CMP_MAX_COUNTRIES + ' países.');
      return;
    }
    cmpSelected.add(code);
    cb.parentElement.classList.add('on');
  } else {
    cmpSelected.delete(code);
    cb.parentElement.classList.remove('on');
  }
  if (!cmpSelected.size) {
    cmpSelected.add('BRA');
    renderCmpCountryPicker();
  }
  renderCompare();
}

function renderCompare() {
  initCompareTab();
  const indId = document.getElementById('cmpIndicator').value;
  const ind = getInd(indId);
  const codes = [...cmpSelected].filter(c => getCountry(c));
  const viewMode = document.getElementById('cmpViewMode')?.value || 'chart';
  if (!ind || !codes.length) {
    const el = document.getElementById('cmpTable');
    if (el) el.innerHTML = typeof emptyStateHtml === 'function'
      ? emptyStateHtml('Selecione países', 'Marque até 6 países acima para comparar o mesmo indicador.', null, null) : '';
    return;
  }

  const splitEl = document.getElementById('cmpSplit');
  const chartCard = document.getElementById('cmpChartCard');
  if (viewMode === 'split' && codes.length === 2 && splitEl) {
    if (chartCard) chartCard.style.display = 'none';
    splitEl.style.display = 'grid';
    renderCompareSplit(codes[0], codes[1], indId, ind);
  } else {
    if (chartCard) chartCard.style.display = '';
    if (splitEl) splitEl.style.display = 'none';
  }

  const titleEl = document.getElementById('cmpChartTitle');
  if (titleEl) titleEl.textContent = ind.label + ' — ' + codes.length + ' países';

  const yearSet = new Set();
  codes.forEach(code => {
    const hist = getHistSeries(code, indId);
    hist.forEach(p => yearSet.add(p.year));
  });
  const years = [...yearSet].sort((a, b) => a - b);

  const datasets = codes.map((code, i) => {
    const c = getCountry(code);
    const map = Object.fromEntries(getHistSeries(code, indId).map(p => [p.year, p.value]));
    const color = HIST_CHART_COLORS[i % HIST_CHART_COLORS.length];
    return {
      label: c.name,
      data: years.map(y => map[y] != null ? map[y] : null),
      borderColor: color,
      backgroundColor: color + '18',
      fill: false,
      tension: 0.2,
      spanGaps: true,
      borderWidth: 2,
      pointRadius: years.length > 50 ? 0 : 2,
      pointHoverRadius: 5
    };
  });

  const ctx = document.getElementById('chartCompare');
  if (ctx) {
    if (charts.compare) charts.compare.destroy();
    if (years.length) {
      charts.compare = new Chart(ctx, {
        type: 'line',
        data: { labels: years, datasets },
        options: {
          ...chartOpts(true, true, 'x'),
          interaction: { intersect: false, mode: 'index' },
          scales: {
            x: { ticks: { color: '#8a8a8a', maxTicksLimit: 18 }, grid: { color: 'rgba(46,46,46,0.4)' } },
            y: { ticks: { color: '#8a8a8a' }, grid: { color: 'rgba(46,46,46,0.5)' } }
          }
        }
      });
    }
  }

  let tableHtml = '<div class="table-wrap"><table><thead><tr><th>País</th><th>Atual</th><th>Período</th><th>Min</th><th>Max</th><th>Variação</th></tr></thead><tbody>';
  codes.forEach(code => {
    const hist = getHistSeries(code, indId);
    const c = getCountry(code);
    const cur = data[code]?.[indId];
    if (!hist.length) {
      tableHtml += '<tr><td>' + countryCell(code, 'sm', true) + '</td><td colspan="5" class="muted-text">Sem histórico API</td></tr>';
      return;
    }
    const vals = hist.map(p => p.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const first = hist[0], last = hist[hist.length - 1];
    const chg = first.value ? ((last.value - first.value) / Math.abs(first.value) * 100) : 0;
    tableHtml += '<tr><td>' + countryCell(code, 'sm', true) + '</td>';
    tableHtml += '<td><strong>' + ind.fmt(cur) + '</strong></td>';
    tableHtml += '<td>' + first.year + '–' + last.year + '</td>';
    tableHtml += '<td>' + ind.fmt(min) + '</td><td>' + ind.fmt(max) + '</td>';
    tableHtml += '<td class="accent-num">' + (chg > 0 ? '+' : '') + fmtNum(chg) + '%</td></tr>';
  });
  tableHtml += '</tbody></table></div>';
  const tbl = document.getElementById('cmpTable');
  if (tbl) {
    let toolbar = '<div class="chart-toolbar"><button type="button" class="btn btn-sm secondary" onclick="exportChartPng(\'chartCompare\',\'comparar\')">PNG</button>';
    toolbar += '<button type="button" class="btn btn-sm secondary" onclick="exportCmpTableCsv()">CSV</button></div>';
    tbl.innerHTML = toolbar + '<h3 style="margin-bottom:.75rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Resumo comparativo' +
      (typeof indTipHtml === 'function' ? indTipHtml(indId) : '') + '</h3>' + tableHtml;
  }

  const snap = document.getElementById('cmpSnapshot');
  if (snap) {
    snap.innerHTML = codes.map(code => {
      const c = getCountry(code);
      return '<div class="card" style="padding:.85rem"><div class="compare-header">' + flagImg(code, 'md') +
        '<div><h3 style="font-size:.9rem">' + c.name + '</h3><span class="kpi" style="font-size:1.2rem">' + ind.fmt(data[code]?.[indId]) + '</span></div></div></div>';
    }).join('');
  }
}

function renderCompareSplit(codeA, codeB, indId, ind) {
  const el = document.getElementById('cmpSplit');
  if (!el) return;
  const ca = getCountry(codeA), cb = getCountry(codeB);
  const da = data[codeA] || {}, db = data[codeB] || {};
  const ha = getHistSeries(codeA, indId), hb = getHistSeries(codeB, indId);
  const metrics = [
    { label: 'Valor atual', a: ind.fmt(da[indId]), b: ind.fmt(db[indId]) },
    { label: 'Período', a: ha.length ? ha[0].year + '–' + ha[ha.length - 1].year : '—', b: hb.length ? hb[0].year + '–' + hb[hb.length - 1].year : '—' },
    { label: 'IDH', a: fmtNum(da.hdi, 3), b: fmtNum(db.hdi, 3) },
    { label: 'Felicidade', a: fmtNum(da.happiness, 2), b: fmtNum(db.happiness, 2) },
    { label: 'Custo vida', a: fmtNum(da.cost_living, 0), b: fmtNum(db.cost_living, 0) },
    { label: 'Desemprego', a: fmtNum(da.unemployment) + '%', b: fmtNum(db.unemployment) + '%' }
  ];
  let html = '<div class="split-col card"><div class="compare-header">' + flagImg(codeA, 'lg') + '<h3>' + ca.name + '</h3></div><table class="split-table">';
  metrics.forEach(m => { html += '<tr><th>' + m.label + '</th><td><strong>' + m.a + '</strong></td></tr>'; });
  html += '</table></div>';
  html += '<div class="split-vs" aria-hidden="true">vs</div>';
  html += '<div class="split-col card"><div class="compare-header">' + flagImg(codeB, 'lg') + '<h3>' + cb.name + '</h3></div><table class="split-table">';
  metrics.forEach(m => { html += '<tr><th>' + m.label + '</th><td><strong>' + m.b + '</strong></td></tr>'; });
  html += '</table></div>';
  el.innerHTML = html;
}

function exportCmpTableCsv() {
  const table = document.getElementById('cmpTable')?.querySelector('table');
  if (table && typeof exportTableCsv === 'function') exportTableCsv(table, 'comparar.csv');
}
