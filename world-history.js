/* WORLDPANEL — Histórico multi-indicador, correlação e análise */

const HIST_CHART_COLORS = typeof CHART_PALETTE !== 'undefined' ? CHART_PALETTE : ['#5b8fd4', '#3d9a6a', '#c9a227', '#c45c5c', '#9b7ec8', '#4db8a4', '#e07b53', '#8a8a8a'];
const HIST_LINE_DASHES = typeof CHART_LINE_DASHES !== 'undefined' ? CHART_LINE_DASHES : [[], [6, 4], [2, 3], [8, 4, 2, 4], [4, 4], [10, 5, 2, 5], [2, 6], [6, 6]];
const HIST_MAX_IND = 8;
const CORR_MAX_IND = 6;
let histSelected = new Set(['gdp_pc_ppp', 'inflation', 'unemployment']);
let corrSelected = new Set(['gdp_pc_ppp', 'inflation', 'unemployment']);

const HIST_WB_INDICATORS = INDICATORS.filter(i => i.wb);

function setHistFromURL(ids, mode) {
  if (ids && ids.length) histSelected = new Set(ids.slice(0, HIST_MAX_IND));
  if (mode && document.getElementById('histChartMode')) document.getElementById('histChartMode').value = mode;
}

function initHistoryTab() {
  const picker = document.getElementById('histIndPicker');
  if (!picker || picker.dataset.ready) return;
  picker.dataset.ready = '1';
  initCountrySearch('indSearch', 'indCountry', renderHistoryPanel);
  picker.innerHTML = buildIndPickerHtml(histSelected, HIST_MAX_IND, 'toggleHistInd');
  updateHistIndCount();
}

function toggleHistInd(cb) {
  const id = cb.value;
  if (cb.checked) {
    if (histSelected.size >= HIST_MAX_IND) {
      cb.checked = false;
      alert('Para manter o gráfico legível, selecione no máximo ' + HIST_MAX_IND + ' indicadores. Desmarque um antes de adicionar.');
      return;
    }
    histSelected.add(id);
    cb.parentElement.classList.add('on');
  } else {
    histSelected.delete(id);
    cb.parentElement.classList.remove('on');
  }
  if (!histSelected.size) {
    histSelected.add('gdp_pc_ppp');
    const first = document.querySelector('#histIndPicker input[value="gdp_pc_ppp"]');
    if (first) { first.checked = true; first.parentElement.classList.add('on'); }
  }
  updateHistIndCount();
  renderHistoryPanel();
  if (typeof saveSessionState === 'function') saveSessionState();
}

function updateHistIndCount() {
  const el = document.getElementById('histIndCount');
  if (el) el.textContent = histSelected.size + ' indicador' + (histSelected.size !== 1 ? 'es' : '') + ' no gráfico — alterações aplicam em tempo real';
}

function getHistSelected() {
  return [...histSelected].filter(id => getInd(id));
}

function getCorrSelected() {
  return [...corrSelected].filter(id => getInd(id));
}

function buildIndPickerHtml(selectedSet, maxInd, toggleFn) {
  let html = '';
  Object.entries(INDICATOR_CATS).forEach(([catId, cat]) => {
    const ids = cat.ids.filter(id => HIST_WB_INDICATORS.some(i => i.id === id));
    if (!ids.length) return;
    html += '<div class="hist-cat"><span class="hist-cat-label">' + cat.label + '</span><div class="hist-chips">';
    ids.forEach(id => {
      const ind = getInd(id);
      const on = selectedSet.has(id);
      html += '<label class="hist-chip' + (on ? ' on' : '') + '"><input type="checkbox" value="' + id + '"' + (on ? ' checked' : '') + ' onchange="' + toggleFn + '(this)"><span>' + ind.label + (typeof indTipHtml === 'function' ? indTipHtml(id) : '') + '</span></label>';
    });
    html += '</div></div>';
  });
  return html;
}

function toggleCorrInd(cb) {
  const id = cb.value;
  if (cb.checked) {
    if (corrSelected.size >= CORR_MAX_IND) {
      cb.checked = false;
      alert('Máximo de ' + CORR_MAX_IND + ' indicadores na matriz. Desmarque um antes de adicionar.');
      return;
    }
    corrSelected.add(id);
    cb.parentElement.classList.add('on');
  } else {
    corrSelected.delete(id);
    cb.parentElement.classList.remove('on');
  }
  if (!corrSelected.size) {
    corrSelected.add('gdp_pc_ppp');
    corrSelected.add('inflation');
    const box = document.getElementById('corrIndPicker');
    if (box) {
      box.querySelectorAll('input').forEach(inp => {
        const on = corrSelected.has(inp.value);
        inp.checked = on;
        inp.parentElement.classList.toggle('on', on);
      });
    }
  }
  renderCorrelationPanel(document.getElementById('indCountry')?.value);
}

function syncCorrFromHist() {
  corrSelected = new Set([...histSelected].slice(0, CORR_MAX_IND));
  if (!corrSelected.size) corrSelected = new Set(['gdp_pc_ppp', 'inflation', 'unemployment']);
  renderHistoryPanel();
}

function alignHistSeries(code, indIds) {
  const yearSet = new Set();
  indIds.forEach(id => {
    getHistSeries(code, id).forEach(p => yearSet.add(p.year));
  });
  const years = [...yearSet].sort((a, b) => a - b);
  const series = indIds.map(id => {
    const map = Object.fromEntries(getHistSeries(code, id).map(p => [p.year, p.value]));
    return years.map(y => map[y] != null ? map[y] : null);
  });
  return { years, series };
}

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

function pairedValues(code, idA, idB) {
  const mapA = Object.fromEntries(getHistSeries(code, idA).map(p => [p.year, p.value]));
  const mapB = Object.fromEntries(getHistSeries(code, idB).map(p => [p.year, p.value]));
  const years = Object.keys(mapA)
    .filter(y => {
      const a = mapA[y], b = mapB[y];
      return b != null && a != null && !isNaN(a) && !isNaN(b);
    })
    .map(Number)
    .sort((a, b) => a - b);
  return {
    years,
    a: years.map(y => mapA[y]),
    b: years.map(y => mapB[y])
  };
}

function corrOverlapMeta(code, indIds) {
  if (indIds.length < 2) return { years: 0, min: null, max: null };
  let min = null, max = null, minCount = Infinity;
  for (let i = 0; i < indIds.length; i++) {
    for (let j = i + 1; j < indIds.length; j++) {
      const pair = pairedValues(code, indIds[i], indIds[j]);
      if (pair.years.length && pair.years.length < minCount) {
        minCount = pair.years.length;
        min = pair.years[0];
        max = pair.years[pair.years.length - 1];
      }
    }
  }
  if (minCount === Infinity) {
    const one = getHistSeries(code, indIds[0]);
    if (one.length) return { years: one.length, min: one[0].year, max: one[one.length - 1].year };
    return { years: 0, min: null, max: null };
  }
  return { years: minCount, min, max };
}

function normalizeSeries(values) {
  const first = values.find(v => v != null && v !== 0);
  if (first == null) return values.map(() => null);
  return values.map(v => v != null ? (v / first) * 100 : null);
}

function isHigherBetter(indId) {
  return ['gdp_pc', 'gdp_pc_ppp', 'gdp_growth', 'life_expectancy', 'exports', 'literacy', 'health_spend', 'edu_spend', 'internet', 'emp_services'].includes(indId);
}

function analyzeIndicatorChanges(code, indId) {
  const hist = getHistSeries(code, indId);
  const ind = getInd(indId);
  if (!hist || hist.length < 2) return [];
  const results = [];
  for (let i = 1; i < hist.length; i++) {
    const prev = hist[i - 1], curr = hist[i];
    if (prev.value == null || curr.value == null) continue;
    const delta = curr.value - prev.value;
    const pct = prev.value !== 0 ? (delta / Math.abs(prev.value)) * 100 : 0;
    const absPct = Math.abs(pct);
    const threshold = ['inflation', 'unemployment', 'gdp_growth', 'current_account'].includes(indId) ? 1.2 : 4;
    if (absPct < threshold && Math.abs(delta) < threshold * 0.5) continue;
    const higherBetter = isHigherBetter(indId);
    const improved = higherBetter ? delta > 0 : delta < 0;
    const events = getEventsForYear(code, curr.year, indId);
    const leader = getLeaderAtYear(code, curr.year);
    let cause = '';
    if (events.length) cause = events.map(e => e.title + ': ' + e.cause).join(' ');
    else if (leader) cause = 'Mandato ' + leader.name + ' — ' + (leader.measures[0] || '');
    else cause = improved ? 'Melhora estrutural ou conjuntura favorável.' : 'Pressão macroeconômica ou choque externo.';
    results.push({
      year: curr.year, indId, indLabel: ind.label,
      value: curr.value, prev: prev.value, delta, pct,
      improved, cause, events, leader
    });
  }
  return results;
}

function eventYearsForChart(code, indIds, years) {
  const set = new Set();
  indIds.forEach(id => {
    (HIST_EVENTS[code] || []).forEach(e => {
      if (e.indicators && e.indicators.some(i => indIds.includes(i)) && years.includes(e.year)) set.add(e.year);
    });
  });
  return set;
}

function renderHistoryPanel() {
  initHistoryTab();
  const code = document.getElementById('indCountry').value;
  const mode = document.getElementById('histChartMode')?.value || 'multi';
  const c = getCountry(code);
  const indIds = getHistSelected();
  if (!c || !indIds.length) return;

  const hasAnyHist = indIds.some(id => getHistSeries(code, id).length > 1);
  if (!hasAnyHist) {
    document.getElementById('histInfo').innerHTML = '';
    document.getElementById('indDetail').innerHTML = typeof emptyStateHtml === 'function'
      ? emptyStateHtml('Sem dados históricos', 'Selecione outro país ou vá em Config → Atualizar agora para buscar séries da API World Bank.', 'Atualizar dados', 'config')
      : '<p class="muted-text">Sem dados — atualize em Config.</p>';
    document.getElementById('chartHistory')?.getContext?.('2d');
    if (charts.history) { charts.history.destroy(); charts.history = null; }
    document.getElementById('histLegend').innerHTML = '';
    renderCorrelationPanel(code);
    document.getElementById('histChanges').innerHTML = typeof emptyStateHtml === 'function'
      ? emptyStateHtml('Aguardando dados', 'As mudanças significativas aparecem quando houver série histórica com 2+ anos.', null, null) : '';
    renderLeadersPanel(code);
    if (typeof renderChartNotesPanel === 'function') renderChartNotesPanel(code);
    return;
  }
  let infoTxt = indIds.length + ' indicador(es) · passe o mouse nos pontos destacados para ver eventos e anotações';
  if (indIds.includes('literacy')) {
    const lit = getHistSeries(code, 'literacy');
    if (lit.length >= 4) infoTxt += ' · Alfabetização: série UNESCO 1970–2018 (censos a cada ~10 anos)';
  }
  document.getElementById('histInfo').textContent = infoTxt;

  let detailHtml = '<div class="compare-header">' + flagImg(code, 'lg') + '<h3>' + c.name + '</h3>' + (typeof favoriteBtnHtml === 'function' ? favoriteBtnHtml(code) : '') + '</div>';
  detailHtml += '<div class="hist-kpi-grid">';
  indIds.forEach((id, i) => {
    const ind = getInd(id);
    const val = data[code]?.[id];
    const hist = getHistSeries(code, id);
    const pts = hist?.length || 0;
    detailHtml += '<div class="hist-kpi-item" style="border-left:3px solid ' + HIST_CHART_COLORS[i % HIST_CHART_COLORS.length] + '">';
    detailHtml += '<span class="hist-kpi-label">' + ind.label + (typeof indTipHtml === 'function' ? indTipHtml(id) : '') + (typeof formulaLinkForInd === 'function' ? formulaLinkForInd(id) : '') + '</span>';
    detailHtml += '<span class="hist-kpi-val">' + ind.fmt(val) + '</span>';
    detailHtml += '<span class="hist-kpi-sub">' + (pts > 1 ? pts + ' pts (' + hist[0].year + '–' + hist[hist.length - 1].year + ')' : 'valor atual') + '</span></div>';
  });
  detailHtml += '</div>';
  document.getElementById('indDetail').innerHTML = detailHtml;

  renderHistoryChart(code, indIds, mode);
  renderCorrelationPanel(code);
  renderChangesPanel(code, indIds);
  renderLeadersPanel(code);
  if (typeof renderChartNotesPanel === 'function') renderChartNotesPanel(code);
  if (typeof updateURLState === 'function') updateURLState();
}

function renderHistoryChart(code, indIds, mode) {
  const ctx = document.getElementById('chartHistory');
  if (!ctx) return;
  if (charts.history) charts.history.destroy();

  const titleEl = document.getElementById('histChartTitle');
  if (titleEl) {
    titleEl.textContent = mode === 'correlation' && indIds.length === 2
      ? 'Correlação — dispersão'
      : mode === 'normalized' ? 'Histórico — índice base 100' : 'Histórico — até 8 séries';
  }

  if (mode === 'correlation' && indIds.length >= 2) {
    const a = indIds[0], b = indIds[1];
    const pair = pairedValues(code, a, b);
    const r = pearson(pair.a, pair.b);
    const indA = getInd(a), indB = getInd(b);
    if (pair.years.length < 3) {
      document.getElementById('histLegend').innerHTML = '<p class="muted-text">Dados insuficientes para correlação entre ' + indA.label + ' e ' + indB.label + '</p>';
      return;
    }
    const eventYears = eventYearsForChart(code, [a, b], pair.years);
    charts.history = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'r = ' + (r != null ? fmtNum(r, 3) : '—'),
          data: pair.years.map((y, i) => ({ x: pair.a[i], y: pair.b[i], year: y })),
          backgroundColor: pair.years.map(y => eventYears.has(y) ? '#c9a227' : '#5b8fd4'),
          pointRadius: pair.years.map(y => eventYears.has(y) ? 8 : 5),
          pointHoverRadius: 10
        }]
      },
      options: {
        ...chartOpts(false),
        plugins: {
          ...chartOpts(false).plugins,
          tooltip: {
            ...chartOpts(false).plugins.tooltip,
            callbacks: {
              label: (ctx) => {
                const y = ctx.raw.year;
                const ev = getEventsForYear(code, y);
                let lines = [y + ': ' + indA.label + '=' + fmtNum(ctx.raw.x) + ', ' + indB.label + '=' + fmtNum(ctx.raw.y)];
                ev.forEach(e => lines.push(e.title));
                return lines;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: indA.label, color: '#8a8a8a' }, ticks: { color: '#8a8a8a' }, grid: { color: 'rgba(46,46,46,0.5)' } },
          y: { title: { display: true, text: indB.label, color: '#8a8a8a' }, ticks: { color: '#8a8a8a' }, grid: { color: 'rgba(46,46,46,0.5)' } }
        }
      }
    });
    const strength = r == null ? '—' : Math.abs(r) > 0.7 ? 'forte' : Math.abs(r) > 0.4 ? 'moderada' : 'fraca';
    const dir = r > 0 ? 'positiva' : 'negativa';
    document.getElementById('histLegend').innerHTML = '<p class="muted-text">Correlação de Pearson: <strong class="accent-num">' + fmtNum(r, 3) + '</strong> (' + strength + ' ' + dir + ') · ' + pair.years.length + ' anos em comum · pontos dourados = eventos históricos</p>';
    return;
  }

  const { years, series } = alignHistSeries(code, indIds);
  if (!years.length) {
    document.getElementById('histLegend').innerHTML = '<p class="muted-text">Sem série histórica para os indicadores selecionados.</p>';
    return;
  }

  const eventYears = eventYearsForChart(code, indIds, years);
  const noteYears = new Set();
  if (typeof ChartNotes !== 'undefined') {
    ChartNotes.forCountry(code).forEach(n => { if (years.includes(n.year)) noteYears.add(n.year); });
  }
  const datasets = indIds.map((id, i) => {
    let vals = series[i];
    if (mode === 'normalized') vals = normalizeSeries(vals);
    const ind = getInd(id);
    return {
      label: mode === 'normalized' ? ind.label + ' (índice)' : ind.label,
      data: vals,
      borderColor: HIST_CHART_COLORS[i % HIST_CHART_COLORS.length],
      backgroundColor: HIST_CHART_COLORS[i % HIST_CHART_COLORS.length] + '22',
      fill: false,
      tension: 0.2,
      spanGaps: true,
      borderWidth: 2,
      borderDash: HIST_LINE_DASHES[i % HIST_LINE_DASHES.length],
      pointRadius: years.map(y => (eventYears.has(y) || noteYears.has(y)) ? 7 : (years.length > 50 ? 0 : 3)),
      pointBackgroundColor: years.map(y => noteYears.has(y) ? '#9b7ec8' : (eventYears.has(y) ? '#c9a227' : HIST_CHART_COLORS[i % HIST_CHART_COLORS.length])),
      pointBorderColor: years.map(y => eventYears.has(y) ? '#ececec' : HIST_CHART_COLORS[i % HIST_CHART_COLORS.length]),
      pointHoverRadius: 8
    };
  });

  charts.history = new Chart(ctx, {
    type: 'line',
    data: { labels: years, datasets },
    options: {
      ...chartOpts(indIds.length > 1),
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        ...chartOpts(indIds.length > 1).plugins,
        tooltip: {
          ...chartOpts(false).plugins.tooltip,
          callbacks: {
            afterBody: (items) => {
              if (!items.length) return [];
              const year = +items[0].label;
              const ev = getEventsForYear(code, year);
              const leader = getLeaderAtYear(code, year);
              const note = typeof ChartNotes !== 'undefined' ? ChartNotes.get(code, year) : '';
              const lines = [];
              if (leader) lines.push('Governante: ' + leader.name);
              if (note) lines.push('📝 ' + note);
              ev.forEach(e => lines.push('▸ ' + e.title));
              return lines;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#8a8a8a', maxTicksLimit: 20, font: { size: 10 } }, grid: { color: 'rgba(46,46,46,0.4)' } },
        y: { ticks: { color: '#8a8a8a' }, grid: { color: 'rgba(46,46,46,0.5)' }, border: { display: false } }
      }
    }
  });
  document.getElementById('histLegend').innerHTML = '<p class="muted-text">Pontos <span style="color:var(--c-amber)">●</span> dourados = eventos · <span style="color:var(--c-purple)">●</span> roxos = suas anotações · linhas tracejadas distinguem séries para daltonismo</p>';
  const c = getCountry(code);
  const range = years.length ? years[0] + '–' + years[years.length - 1] : '';
  if (typeof setChartAria === 'function') {
    setChartAria('chartHistory', 'Gráfico histórico — ' + (c?.name || code) + ' ' + range + ' — ' + indIds.map(id => getInd(id).label).join(', '));
  }
}

function renderCorrelationPanel(code) {
  const el = document.getElementById('histCorrelation');
  if (!el) return;
  const indIds = getCorrSelected();
  let html = '<h3>Matriz de correlação (Pearson)</h3>';
  html += '<p class="muted-text" style="margin-bottom:.5rem">Selecione os indicadores da matriz (independente do gráfico). Máx. ' + CORR_MAX_IND + '.</p>';
  html += '<div class="corr-picker-toolbar"><button type="button" class="btn btn-sm secondary" onclick="syncCorrFromHist()">Usar mesmos do gráfico</button>';
  html += '<span class="muted-text" style="font-size:.72rem">' + indIds.length + ' selecionado(s)</span></div>';
  html += '<div id="corrIndPicker" class="hist-picker corr-picker">' + buildIndPickerHtml(corrSelected, CORR_MAX_IND, 'toggleCorrInd') + '</div>';

  if (indIds.length < 2) {
    html += '<p class="muted-text" style="margin-top:.75rem">Selecione 2 ou mais indicadores para calcular a matriz.</p>';
    el.innerHTML = html;
    return;
  }

  const overlap = corrOverlapMeta(code, indIds);
  const dbStats = typeof WorldDB !== 'undefined' ? WorldDB.stats() : null;
  const stale = typeof WorldDB !== 'undefined' && WorldDB.isStale();
  let dataLine = '';
  if (overlap.min != null) {
    dataLine = 'Período em comum: <strong>' + overlap.min + '–' + overlap.max + '</strong> · ' + overlap.years + ' anos';
  } else {
    dataLine = 'Dados insuficientes — vá em <strong>Config → Atualizar agora</strong>';
  }
  if (dbStats?.savedAt) {
    dataLine += ' · Cache: ' + new Date(dbStats.savedAt).toLocaleString('pt-BR');
    if (stale) dataLine += ' <span class="tag down" style="margin-left:.25rem">desatualizado</span>';
  }
  html += '<p class="muted-text corr-data-meta" style="margin-top:.65rem">' + dataLine + '</p>';

  html += '<div class="table-wrap"><table class="corr-table"><thead><tr><th></th>';
  indIds.forEach(id => html += '<th>' + getInd(id).label.split(' ').slice(0, 2).join(' ') + '</th>');
  html += '</tr></thead><tbody>';
  indIds.forEach((idA, i) => {
    html += '<tr><th>' + getInd(idA).label.split(' ').slice(0, 3).join(' ') + '</th>';
    indIds.forEach((idB, j) => {
      if (i === j) html += '<td class="corr-diag">1</td>';
      else if (j < i) html += '<td class="corr-mirror">—</td>';
      else {
        const pair = pairedValues(code, idA, idB);
        const r = pearson(pair.a, pair.b);
        const cls = r == null ? '' : Math.abs(r) > 0.7 ? 'corr-strong' : Math.abs(r) > 0.4 ? 'corr-mid' : 'corr-weak';
        const title = pair.years.length ? pair.years[0] + '–' + pair.years[pair.years.length - 1] + ' (' + pair.years.length + 'a)' : '';
        html += '<td class="' + cls + '"' + (title ? ' title="' + title + '"' : '') + '>' + (r != null ? fmtNum(r, 2) : '—') + '</td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<p class="muted-text" style="margin-top:.5rem">Modo <strong>Correlação</strong> no gráfico usa os indicadores do filtro superior. Verde/forte |&gt;0,7| · Azul moderado · Cinza fraco. Passe o mouse nas células para ver o período.</p>';
  el.innerHTML = html;
}

function renderChangesPanel(code, indIds) {
  const el = document.getElementById('histChanges');
  if (!el) return;
  let all = [];
  indIds.forEach(id => all.push(...analyzeIndicatorChanges(code, id)));
  all = all
    .sort((a, b) => b.year - a.year || Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 20);
  if (!all.length) {
    el.innerHTML = '<h3>Mudanças significativas por ano</h3><p class="muted-text">Sem variações relevantes ou dados insuficientes.</p>';
    return;
  }
  let html = '<h3>Mudanças significativas — causas por ano</h3><div class="table-wrap" style="max-height:320px"><table><thead><tr><th>Ano</th><th>Indicador</th><th>Var.</th><th>Tend.</th><th>Causa provável</th></tr></thead><tbody>';
  all.forEach(ch => {
    const tagCls = ch.improved ? 'up' : 'down';
    const tagTxt = ch.improved ? 'Melhora' : 'Piora';
    html += '<tr><td><strong>' + ch.year + '</strong></td><td style="white-space:normal;font-size:.78rem">' + ch.indLabel + '</td>';
    html += '<td class="accent-num">' + (ch.pct > 0 ? '+' : '') + fmtNum(ch.pct) + '%</td>';
    html += '<td><span class="tag ' + tagCls + '">' + tagTxt + '</span></td>';
    html += '<td style="white-space:normal;font-size:.78rem;color:var(--muted)">' + ch.cause + '</td></tr>';
  });
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function renderLeadersPanel(code) {
  const el = document.getElementById('histLeaders');
  if (!el) return;
  const list = LEADERS[code];
  if (!list || !list.length) {
    el.innerHTML = '<p class="muted-text">Governantes em catalogação para ' + (getCountry(code)?.name || code) + '. Dados completos: Brasil, EUA, Itália, Espanha, Portugal, Alemanha, França, Reino Unido, Argentina, México, Chile, Colômbia, Japão, Índia, China.</p>';
    return;
  }
  let html = '<div class="leader-timeline">';
  [...list].sort((a, b) => b.to - a.to || b.from - a.from).forEach((l, i) => {
    const ex = getLeaderExtra(code, l.name);
    const measures = (ex && ex.measures) ? ex.measures.concat(l.measures) : l.measures;
    const consequences = (ex && ex.consequences) ? ex.consequences.concat(l.consequences) : l.consequences;
    html += '<div class="leader-card anim-in" style="animation-delay:' + (i * 0.04) + 's">';
    html += '<div class="leader-head-row">' + leaderPhotoHtml(code, l.name);
    html += '<div class="leader-head"><span class="leader-term">' + l.from + '–' + l.to + '</span>';
    html += '<strong>' + l.name + '</strong> <span class="leader-role">' + l.role + '</span></div></div>';
    html += '<div class="leader-body"><div class="leader-col"><span class="leader-label">Principais medidas</span><ul>';
    measures.forEach(m => html += '<li>' + m + '</li>');
    html += '</ul></div><div class="leader-col"><span class="leader-label">Consequências</span><ul>';
    consequences.forEach(m => html += '<li>' + m + '</li>');
    html += '</ul></div></div>';
    const decrees = (ex && ex.decrees) || l.decrees;
    if (decrees && decrees.length) {
      html += '<div class="leader-decrees"><span class="leader-label">Decretos / leis</span><div class="link-row">';
      decrees.forEach(d => html += '<a href="' + d.url + '" target="_blank" rel="noopener" class="link-chip">' + d.title + '</a>');
      html += '</div></div>';
    }
    html += renderMinistriesHtml(code, l.name);
    html += '</div>';
  });
  html += '</div>';
  const evCount = (HIST_EVENTS[code] || []).length;
  if (evCount) html += '<p class="muted-text" style="margin-top:.75rem">' + evCount + ' eventos econômicos mapeados para este país (aparecem no gráfico).</p>';
  el.innerHTML = html;
  prefetchLeaderPhotos(code);
}

function renderIndicatorDetail() {
  renderHistoryPanel();
}
