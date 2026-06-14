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
  if (!ind || !codes.length) return;

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
          ...chartOpts(true),
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
  if (tbl) tbl.innerHTML = '<h3 style="margin-bottom:.75rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Resumo comparativo</h3>' + tableHtml;

  const snap = document.getElementById('cmpSnapshot');
  if (snap) {
    snap.innerHTML = codes.map(code => {
      const c = getCountry(code);
      return '<div class="card" style="padding:.85rem"><div class="compare-header">' + flagImg(code, 'md') +
        '<div><h3 style="font-size:.9rem">' + c.name + '</h3><span class="kpi" style="font-size:1.2rem">' + ind.fmt(data[code]?.[indId]) + '</span></div></div></div>';
    }).join('');
  }
}
