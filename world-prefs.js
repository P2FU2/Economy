/* WORLDPANEL — Preferências, watchlist, anotações, exportações, tema */

const PREFS_KEY = 'worldpanel_prefs_v1';
const ANNOT_KEY = 'worldpanel_annotations_v1';

const IND_TIPS = {
  gdp_pc: 'Produto Interno Bruto dividido pela população, em dólares nominais. Mede riqueza média, não distribuição.',
  gdp_pc_ppp: 'PIB per capita ajustado por paridade de poder de compra — melhor para comparar padrão de vida real.',
  gdp_growth: 'Variação anual do PIB. Negativo indica recessão.',
  inflation: 'Variação anual do Índice de Preços ao Consumidor (IPC). World Bank.',
  unemployment: 'Percentual da força de trabalho sem emprego. Definição varia por país.',
  gini: 'Índice de Gini (0=igualdade, 100=desigualdade máxima). Quanto menor, mais igualitário.',
  hdi: 'Índice de Desenvolvimento Humano (PNUD): expectativa de vida, educação e renda.',
  happiness: 'World Happiness Report (ONU): bem-estar subjetivo 0–10.',
  life_expectancy: 'Anos de vida ao nascer. World Bank / OMS.',
  gov_debt: 'Dívida bruta do governo geral em % do PIB.',
  exports: 'Exportações de bens e serviços como % do PIB.',
  cost_living: 'Índice relativo a Nova York=100. Fonte embutida Numbeo-style.',
  relocation_score: 'Score composto: salário, custo, segurança, felicidade, setor e imigração.',
  literacy: 'Taxa de alfabetização adulta. Série UNESCO embutida quando API incompleta.',
  health_spend: 'Gastos totais em saúde como % do PIB.',
  rent_index: 'Índice de aluguel relativo a NYC=100.',
  avg_salary: 'Salário líquido médio mensal estimado (USD). Dado embutido.',
  misery: 'Misery Index = inflação + desemprego (soma simplificada).'
};

function getIndTip(id) {
  return IND_TIPS[id] || (getInd(id) ? 'Indicador: ' + getInd(id).label + '. Fonte World Bank ou dados embutidos 2023/24.' : '');
}

function indTipHtml(id) {
  const tip = getIndTip(id);
  if (!tip) return '';
  return ' <span class="ind-tip" tabindex="0" aria-label="' + tip.replace(/"/g, '') + '">?</span>';
}

const UserPrefs = {
  load() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : { favorites: [], watchlist: [], theme: 'dark', defaultTab: 'overview' };
    } catch (e) {
      return { favorites: [], watchlist: [], theme: 'dark', defaultTab: 'overview', lastCountry: 'BRA', histIndicators: null, histMode: 'multi', tableCat: 'macro', lastTab: 'overview' };
    }
  },
  save(p) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  },
  get() { return this.load(); },
  toggleFavorite(code) {
    const p = this.load();
    const i = p.favorites.indexOf(code);
    if (i >= 0) p.favorites.splice(i, 1); else p.favorites.push(code);
    this.save(p);
    return p.favorites.includes(code);
  },
  isFavorite(code) {
    return this.load().favorites.includes(code);
  },
  addWatch(item) {
    const p = this.load();
    p.watchlist = p.watchlist || [];
    item.id = item.id || Date.now();
    p.watchlist.push(item);
    this.save(p);
    return p.watchlist;
  },
  removeWatch(id) {
    const p = this.load();
    p.watchlist = (p.watchlist || []).filter(w => w.id !== id);
    this.save(p);
    return p.watchlist;
  }
};

const ChartNotes = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(ANNOT_KEY) || '{}');
    } catch (e) { return {}; }
  },
  save(notes) {
    localStorage.setItem(ANNOT_KEY, JSON.stringify(notes));
  },
  key(code, year) { return code + '|' + year; },
  get(code, year) {
    return this.load()[this.key(code, year)] || '';
  },
  set(code, year, text) {
    const n = this.load();
    const k = this.key(code, year);
    if (text && text.trim()) n[k] = text.trim();
    else delete n[k];
    this.save(n);
  },
  forCountry(code) {
    const n = this.load();
    return Object.entries(n).filter(([k]) => k.startsWith(code + '|')).map(([k, text]) => ({
      year: +k.split('|')[1], text
    })).sort((a, b) => b.year - a.year);
  }
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  const p = UserPrefs.load();
  p.theme = theme;
  UserPrefs.save(p);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'light' ? '◐ Escuro' : '◑ Claro';
}

function initTheme() {
  applyTheme(UserPrefs.load().theme || 'dark');
}

function toggleTheme() {
  const cur = UserPrefs.load().theme || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

function favoriteBtnHtml(code) {
  const on = UserPrefs.isFavorite(code);
  return '<button type="button" class="fav-btn' + (on ? ' on' : '') + '" onclick="toggleFavoriteCountry(\'' + code + '\')" aria-label="' + (on ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '" title="Favorito">★</button>';
}

function toggleFavoriteCountry(code) {
  UserPrefs.toggleFavorite(code);
  document.querySelectorAll('.fav-btn[data-code="' + code + '"]').forEach(b => b.classList.toggle('on', UserPrefs.isFavorite(code)));
  if (typeof renderFavoritesBar === 'function') renderFavoritesBar();
  if (typeof renderWatchlistPanel === 'function') renderWatchlistPanel();
  const detail = document.getElementById('indDetail');
  if (detail && document.getElementById('indCountry')?.value === code && typeof renderHistoryPanel === 'function') renderHistoryPanel();
}

function renderFavoritesBar() {
  const el = document.getElementById('favoritesBar');
  if (!el) return;
  const favs = UserPrefs.load().favorites.filter(c => getCountry(c));
  if (!favs.length) {
    el.innerHTML = '';
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  let html = '<span class="fav-label">Favoritos:</span>';
  favs.forEach(code => {
    const c = getCountry(code);
    html += '<button type="button" class="fav-chip" onclick="quickOpenCountry(\'' + code + '\')">' + flagImg(code, 'xs') + c.name + '</button>';
  });
  el.innerHTML = html;
}

function quickOpenCountry(code) {
  switchTab('indicators', { country: code });
}

function emptyStateHtml(title, desc, ctaLabel, ctaTab) {
  return '<div class="empty-state" role="status">' +
    '<div class="empty-icon" aria-hidden="true">◇</div>' +
    '<strong>' + title + '</strong>' +
    '<p>' + desc + '</p>' +
    (ctaLabel && ctaTab ? '<button type="button" class="btn primary" onclick="switchTab(\'' + ctaTab + '\')">' + ctaLabel + '</button>' : '') +
    '</div>';
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportTableCsv(tableEl, filename) {
  if (!tableEl) return;
  const rows = [];
  tableEl.querySelectorAll('tr').forEach(tr => {
    const cells = [...tr.querySelectorAll('th,td')].map(td => '"' + (td.innerText || '').replace(/"/g, '""') + '"');
    if (cells.length) rows.push(cells.join(','));
  });
  downloadBlob(rows.join('\n'), filename || 'dados.csv', 'text/csv;charset=utf-8');
}

function exportMainTableCsv() {
  const wrap = document.getElementById('mainTable');
  const table = wrap?.querySelector('table');
  exportTableCsv(table, 'worldpanel-tabela-' + new Date().toISOString().slice(0, 10) + '.csv');
}

function exportReportCsv() {
  if (typeof generateConclusions === 'function') generateConclusions();
  const lines = ['País,Código,IDH,Felicidade,PIB PPP,Salário,Custo Vida,Desemprego,Score Mudança'];
  getActiveList().forEach(c => {
    const d = data[c.code] || {};
    lines.push([
      '"' + c.name + '"', c.code,
      d.hdi ?? '', d.happiness ?? '', d.gdp_pc_ppp ?? '', d.avg_salary ?? '',
      d.cost_living ?? '', d.unemployment ?? '', d.relocation_score ?? ''
    ].join(','));
  });
  downloadBlob(lines.join('\n'), 'worldpanel-relatorio.csv', 'text/csv;charset=utf-8');
}

function exportPlannerJson() {
  if (typeof Planner === 'undefined') return;
  const s = Planner.get();
  downloadBlob(JSON.stringify(s, null, 2), 'planejamento.json', 'application/json');
}

function exportPlannerCsv() {
  if (typeof Planner === 'undefined') return;
  const s = Planner.get();
  const c = getCountry(s.target);
  const lines = ['campo,valor', 'destino,' + (c ? c.name : s.target), 'orcamento,' + (s.budget || ''), 'meta,' + (s.deadline || '')];
  lines.push('tarefa,status,fase');
  (s.tasks || []).forEach(t => lines.push('"' + t.text.replace(/"/g, '""') + '",' + (t.done ? 'feito' : 'pendente') + ',' + (t.phase || '')));
  downloadBlob(lines.join('\n'), 'planejamento.csv', 'text/csv;charset=utf-8');
}

function checkWatchlistAlerts() {
  const list = UserPrefs.load().watchlist || [];
  const alerts = [];
  list.forEach(w => {
    const val = data[w.code]?.[w.indId];
    if (val == null) return;
    const th = +w.threshold;
    const hit = w.op === '>' ? val > th : w.op === '<' ? val < th : w.op === '>=' ? val >= th : val <= th;
    if (hit) alerts.push({ ...w, val });
  });
  return alerts;
}

function renderWatchlistPanel() {
  const el = document.getElementById('watchlistPanel');
  if (!el) return;
  const p = UserPrefs.load();
  const alerts = checkWatchlistAlerts();
  let html = '<h3 class="section-head"><span>Monitoramento</span>Watchlist e alertas</h3>';
  if (alerts.length) {
    html += '<div class="alert-banner" role="alert">';
    alerts.forEach(a => {
      const ind = getInd(a.indId);
      html += '<div class="alert-item">' + flagImg(a.code, 'xs') + ' <strong>' + (getCountry(a.code)?.name || a.code) + '</strong> — ' +
        (ind?.label || a.indId) + ' = ' + (ind ? ind.fmt(a.val) : a.val) + ' ' + (a.op || '>') + ' ' + a.threshold +
        (a.label ? ' · ' + a.label : '') + '</div>';
    });
    html += '</div>';
  }
  html += '<div class="form-row" style="margin-top:.75rem">';
  html += '<label>País</label><select id="wlCountry">' + getActiveList().map(c => '<option value="' + c.code + '">' + c.name + '</option>').join('') + '</select>';
  html += '<label>Indicador</label><select id="wlIndicator">' + INDICATORS.map(i => '<option value="' + i.id + '">' + i.label + '</option>').join('') + '</select>';
  html += '<label>Condição</label><select id="wlOp"><option value=">">&gt;</option><option value="<">&lt;</option><option value=">=">&gt;=</option><option value="<=">&lt;=</option></select>';
  html += '<label>Limite</label><input type="number" id="wlThreshold" step="0.1" style="width:90px" placeholder="0.55">';
  html += '<input type="text" id="wlLabel" placeholder="Rótulo (opcional)" style="min-width:140px">';
  html += '<button type="button" class="btn btn-sm primary" onclick="addWatchlistItem()">Adicionar</button></div>';
  html += '<div class="watch-list" style="margin-top:.75rem">';
  (p.watchlist || []).forEach(w => {
    const ind = getInd(w.indId);
    const val = data[w.code]?.[w.indId];
    html += '<div class="watch-item"><span>' + flagImg(w.code, 'xs') + ' ' + (getCountry(w.code)?.name || w.code) + ' · ' + (ind?.label || w.indId) + ' ' + w.op + ' ' + w.threshold;
    if (val != null) html += ' <em>(atual: ' + ind.fmt(val) + ')</em>';
    html += '</span><button type="button" class="task-del" onclick="removeWatchlistItem(' + w.id + ')" aria-label="Remover">×</button></div>';
  });
  if (!(p.watchlist || []).length) html += '<p class="muted-text">Nenhum alerta configurado. Ex.: Gini Brasil &gt; 50</p>';
  html += '</div>';
  html += '<div style="margin-top:1rem"><h4 style="font-size:.72rem;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Países favoritos</h4><div class="hist-chips">';
  UserPrefs.load().favorites.forEach(code => {
    if (!getCountry(code)) return;
    html += '<span class="hist-chip on">' + flagImg(code, 'xs') + getCountry(code).name +
      ' <button type="button" class="task-del" style="font-size:.85rem" onclick="toggleFavoriteCountry(\'' + code + '\');renderWatchlistPanel()">×</button></span>';
  });
  if (!UserPrefs.load().favorites.length) html += '<span class="muted-text" style="font-size:.78rem">Clique ★ no histórico de um país para favoritar</span>';
  html += '</div></div>';
  el.innerHTML = html;
}

function addWatchlistItem() {
  const code = document.getElementById('wlCountry')?.value;
  const indId = document.getElementById('wlIndicator')?.value;
  const op = document.getElementById('wlOp')?.value || '>';
  const threshold = +document.getElementById('wlThreshold')?.value;
  const label = document.getElementById('wlLabel')?.value || '';
  if (!code || !indId || isNaN(threshold)) { alert('Preencha país, indicador e limite numérico.'); return; }
  UserPrefs.addWatch({ code, indId, op, threshold, label });
  renderWatchlistPanel();
  renderAlertBanner();
}

function removeWatchlistItem(id) {
  UserPrefs.removeWatch(id);
  renderWatchlistPanel();
  renderAlertBanner();
}

function renderAlertBanner() {
  const el = document.getElementById('alertBanner');
  if (!el) return;
  const alerts = checkWatchlistAlerts();
  if (!alerts.length) { el.innerHTML = ''; el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = '<div class="alert-banner compact" role="alert">' +
    alerts.map(a => flagImg(a.code, 'xs') + ' ' + (getCountry(a.code)?.name || a.code) + ': ' + (a.label || getInd(a.indId)?.label)).join(' · ') +
    ' <button type="button" class="btn btn-sm secondary" onclick="switchTab(\'config\')">Ver watchlist</button></div>';
}

function renderChartNotesPanel(code) {
  const el = document.getElementById('histNotes');
  if (!el) return;
  const notes = ChartNotes.forCountry(code);
  let html = '<h3 class="section-head"><span>Suas anotações</span>Notas por ano</h3>';
  html += '<div class="form-row"><label>Ano</label><input type="number" id="noteYear" min="1960" max="2030" style="width:90px" placeholder="2022">';
  html += '<input type="text" id="noteText" placeholder="Ex: eleição, crise cambial…" style="flex:1;min-width:160px">';
  html += '<button type="button" class="btn btn-sm primary" onclick="saveChartNote(\'' + code + '\')">Salvar</button></div>';
  if (!notes.length) {
    html += emptyStateHtml('Sem anotações', 'Registre contexto em anos específicos — aparecem no gráfico como referência.', null, null);
  } else {
    html += '<ul class="notes-list">';
    notes.forEach(n => {
      html += '<li><strong>' + n.year + '</strong> — ' + n.text +
        ' <button type="button" class="task-del" onclick="deleteChartNote(\'' + code + '\',' + n.year + ')">×</button></li>';
    });
    html += '</ul>';
  }
  el.innerHTML = html;
}

function saveChartNote(code) {
  const year = +document.getElementById('noteYear')?.value;
  const text = document.getElementById('noteText')?.value || '';
  if (!year || !text.trim()) return;
  ChartNotes.set(code, year, text);
  renderChartNotesPanel(code);
  if (typeof renderHistoryPanel === 'function') renderHistoryPanel();
}

function deleteChartNote(code, year) {
  ChartNotes.set(code, year, '');
  renderChartNotesPanel(code);
  if (typeof renderHistoryPanel === 'function') renderHistoryPanel();
}

function formulaLinkForInd(indId) {
  const map = {
    inflation: 'fMiseryCountry', unemployment: 'fMiseryCountry', gdp_growth: 'fCAGRCountry',
    gdp_pc_ppp: 'fPPPSal', cost_living: 'fCOLFrom', rent_index: 'fHousingCountry',
    gini: 'fGiniCountry', relocation_score: 'fReserveCountry'
  };
  const fid = map[indId];
  if (!fid) return '';
  return ' <a href="#" class="link-chip" style="font-size:.68rem;padding:.15rem .4rem" onclick="switchTab(\'formulas\');setTimeout(function(){var e=document.getElementById(\'' + fid + '\');if(e)e.scrollIntoView({behavior:\'smooth\',block:\'center\'});},300);return false">Ver fórmula</a>';
}

function initUXExtended() {
  initTheme();
  renderFavoritesBar();
  renderAlertBanner();
  restoreSessionState();
}

function saveSessionState() {
  const p = UserPrefs.load();
  const country = document.getElementById('indCountry')?.value;
  if (country) p.lastCountry = country;
  const mode = document.getElementById('histChartMode')?.value;
  if (mode) p.histMode = mode;
  if (typeof getHistSelected === 'function') {
    const ids = getHistSelected();
    if (ids.length) p.histIndicators = ids;
  }
  if (typeof currentTableCat !== 'undefined') p.tableCat = currentTableCat;
  if (typeof activeTab !== 'undefined') p.lastTab = activeTab;
  UserPrefs.save(p);
}

function restoreSessionState() {
  if (new URLSearchParams(location.search).get('tab')) return;
  const p = UserPrefs.load();
  if (p.tableCat && typeof setTableCat === 'function') setTableCat(p.tableCat);
  if (p.histMode && document.getElementById('histChartMode')) document.getElementById('histChartMode').value = p.histMode;
  if (p.histIndicators && typeof setHistFromURL === 'function') setHistFromURL(p.histIndicators, p.histMode);
  const code = p.lastCountry || 'BRA';
  const sel = document.getElementById('indCountry');
  const search = document.getElementById('indSearch');
  const c = getCountry(code);
  if (sel && c) sel.value = c.code;
  if (search && c) search.value = c.name;
}
