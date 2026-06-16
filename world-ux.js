/* WORLDPANEL — UX: navegação agrupada, mobile, hero, deep linking, perfil */

const NAV_GROUPS = [
  { id: 'explore', label: 'Explorar', tabs: [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'indicators', label: 'Histórico' },
    { id: 'compare', label: 'Comparar' }
  ]},
  { id: 'countries', label: 'Países', tabs: [
    { id: 'quality', label: 'Qualidade' },
    { id: 'guides', label: 'Guias País' },
    { id: 'relocation', label: 'Mudança' }
  ]},
  { id: 'tools', label: 'Ferramentas', tabs: [
    { id: 'formulas', label: 'Fórmulas' },
    { id: 'conclusions', label: 'Análise' },
    { id: 'planner', label: 'Planejamento' }
  ]},
  { id: 'settings', label: 'Sistema', tabs: [
    { id: 'config', label: 'Configurações' }
  ]}
];

const FAMILY_PROFILE_KEY = 'worldpanel_family_profile';
const HERO_DISMISS_KEY = 'worldpanel_hero_dismissed';

let activeTab = 'overview';

const DEFAULT_FAMILY_PROFILE = {
  household: 'couple',
  age: 30,
  education: 'superior',
  euCitizen: true,
  goal: 'family'
};

function getFamilyProfile() {
  try {
    const raw = localStorage.getItem(FAMILY_PROFILE_KEY);
    return raw ? { ...DEFAULT_FAMILY_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_FAMILY_PROFILE };
  } catch (e) {
    return { ...DEFAULT_FAMILY_PROFILE };
  }
}

function saveFamilyProfileFromForm() {
  const p = {
    household: document.getElementById('fpHousehold')?.value || 'couple',
    age: +(document.getElementById('fpAge')?.value) || 30,
    education: document.getElementById('fpEducation')?.value || 'superior',
    euCitizen: document.getElementById('fpEuCitizen')?.value === 'yes',
    goal: document.getElementById('fpGoal')?.value || 'family'
  };
  localStorage.setItem(FAMILY_PROFILE_KEY, JSON.stringify(p));
  updateFamilyProfileSummary();
  if (typeof renderFamilyProfile === 'function') renderFamilyProfile();
  return p;
}

function familyProfileLabel(p) {
  p = p || getFamilyProfile();
  const hh = p.household === 'solo' ? 'Individual' : 'Casal';
  const edu = { superior: 'Superior', medio: 'Médio', pos: 'Pós-graduação' }[p.education] || 'Superior';
  const goal = { family: 'Formar família', career: 'Carreira', study: 'Estudos', retire: 'Aposentadoria' }[p.goal] || 'Família';
  const eu = p.euCitizen ? 'Cidadania UE' : 'Sem cidadania UE';
  return hh + ' · ' + p.age + ' anos · ' + edu + ' · ' + eu + ' · ' + goal;
}

function updateFamilyProfileSummary() {
  const el = document.getElementById('familyProfileSummary');
  if (el) el.textContent = familyProfileLabel();
}

function initFamilyProfileForm() {
  const p = getFamilyProfile();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('fpHousehold', p.household);
  set('fpAge', p.age);
  set('fpEducation', p.education);
  set('fpEuCitizen', p.euCitizen ? 'yes' : 'no');
  set('fpGoal', p.goal);
  updateFamilyProfileSummary();
}

function buildMainNav() {
  const nav = document.getElementById('mainNav');
  if (!nav || nav.dataset.built) return;
  nav.dataset.built = '1';
  let html = '<div class="nav-inner">';
  NAV_GROUPS.forEach(g => {
    html += '<div class="nav-group" data-group="' + g.id + '">';
    html += '<button type="button" class="nav-group-btn" aria-haspopup="true" aria-expanded="false">' + g.label + '<span class="nav-chevron" aria-hidden="true">▾</span></button>';
    html += '<div class="nav-dropdown" role="menu">';
    g.tabs.forEach(t => {
      const active = t.id === activeTab ? ' active' : '';
      html += '<button type="button" class="nav-tab' + active + '" role="menuitem" data-tab="' + t.id + '" aria-current="' + (active ? 'page' : 'false') + '">' + t.label + '</button>';
    });
    html += '</div></div>';
  });
  html += '</div>';
  nav.innerHTML = html;

  nav.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  nav.querySelectorAll('.nav-group-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = btn.closest('.nav-group');
      const open = group.classList.contains('open');
      nav.querySelectorAll('.nav-group').forEach(g => {
        g.classList.remove('open');
        g.querySelector('.nav-group-btn')?.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        group.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', () => {
    nav.querySelectorAll('.nav-group').forEach(g => {
      g.classList.remove('open');
      g.querySelector('.nav-group-btn')?.setAttribute('aria-expanded', 'false');
    });
  });
}

function onTabActivate(tabId) {
  if (tabId === 'compare' && typeof initCompareTab === 'function') { initCompareTab(); if (typeof renderCompare === 'function') renderCompare(); }
  if (tabId === 'indicators' && typeof initHistoryTab === 'function') { initHistoryTab(); if (typeof renderHistoryPanel === 'function') renderHistoryPanel(); }
  if (tabId === 'relocation') {
    initFamilyProfileForm();
    if (typeof renderRelocation === 'function') renderRelocation();
    if (typeof renderFamilyProfile === 'function') renderFamilyProfile();
  }
  if (tabId === 'quality' && typeof renderQualityTab === 'function') renderQualityTab();
  if (tabId === 'formulas') {
    if (typeof buildFormulas === 'function' && !document.getElementById('fMiseryCountry')) buildFormulas();
    if (typeof runAllFormulas === 'function') runAllFormulas();
  }
  if (tabId === 'config') {
    if (typeof renderDBStats === 'function') renderDBStats();
    if (typeof renderWatchlistPanel === 'function') renderWatchlistPanel();
  }
  if (tabId === 'guides' && typeof initGuidesTab === 'function') initGuidesTab();
  if (tabId === 'planner' && typeof initPlannerTab === 'function') initPlannerTab();
  if (tabId === 'overview') dismissHeroIfNeeded();
  if (typeof renderFavoritesBar === 'function') renderFavoritesBar();
  if (typeof renderAlertBanner === 'function') renderAlertBanner();
}

function switchTab(tabId, opts) {
  opts = opts || {};
  activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(b => {
    const on = b.dataset.tab === tabId;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.add('active');
  NAV_GROUPS.forEach(g => {
    const has = g.tabs.some(t => t.id === tabId);
    const groupEl = document.querySelector('.nav-group[data-group="' + g.id + '"]');
    if (groupEl) groupEl.classList.toggle('has-active', has);
  });
  if (opts.country) {
    const sel = document.getElementById('indCountry');
    if (sel) sel.value = opts.country;
    const gs = document.getElementById('guideSearch');
    const gsel = document.getElementById('guideCountry');
    if (gsel && getCountry(opts.country)) {
      gsel.value = opts.country;
      if (gs) gs.value = getCountry(opts.country).name;
    }
  }
  onTabActivate(tabId);
  updateURLState();
  closeMobileNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateURLState() {
  const params = new URLSearchParams();
  if (activeTab && activeTab !== 'overview') params.set('tab', activeTab);
  const country = document.getElementById('indCountry')?.value;
  if (country && (activeTab === 'indicators' || activeTab === 'guides')) params.set('country', country);
  const q = params.toString();
  const url = q ? ('?' + q) : (location.pathname || 'index.html');
  try { history.replaceState({ tab: activeTab, country }, '', url); } catch (e) { /* file:// */ }
}

function applyURLState() {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  const country = params.get('country');
  const valid = NAV_GROUPS.some(g => g.tabs.some(t => t.id === tab));
  if (valid) switchTab(tab, { country: country || undefined, skipUrl: true });
  else if (country && document.getElementById('indCountry')) {
    document.getElementById('indCountry').value = country;
  }
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  if (overlay) overlay.addEventListener('click', closeMobileNav);
}

function closeMobileNav() {
  document.body.classList.remove('nav-open');
  const toggle = document.getElementById('navToggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function renderWelcomeHero() {
  const el = document.getElementById('welcomeHero');
  if (!el) return;
  if (localStorage.getItem(HERO_DISMISS_KEY)) {
    el.classList.add('hidden');
    return;
  }
  el.innerHTML =
    '<div class="welcome-inner anim-in">' +
    '<div class="welcome-copy">' +
    '<p class="welcome-eyebrow">Painel econômico global</p>' +
    '<h2>Compare indicadores de <span class="accent-num">41 países</span> desde 1960 — em segundos</h2>' +
    '<p class="welcome-desc">Para quem planeja mudar de país, pesquisa macro ou quer entender onde a economia vai melhorar. Dados World Bank + IDH, felicidade e simulador de expatriação.</p>' +
    '<div class="welcome-ctas">' +
    '<button type="button" class="btn primary" onclick="switchTab(\'indicators\')">Explorar histórico</button>' +
    '<button type="button" class="btn" onclick="switchTab(\'relocation\')">Simular mudança</button>' +
    '<button type="button" class="btn secondary" onclick="dismissWelcomeHero()">Pular introdução</button>' +
    '</div></div>' +
    '<div class="welcome-cards">' +
    '<div class="welcome-card"><strong>Histórico 1960–2025</strong><span>Até 8 indicadores, governantes e eventos por ano</span></div>' +
    '<div class="welcome-card"><strong>Guias &amp; Itália</strong><span>Passo a passo UE, cidades, aluguel e renda remota</span></div>' +
    '<div class="welcome-card"><strong>Simulador expat</strong><span>Ranking europeu personalizado ao seu perfil</span></div>' +
    '</div>' +
    '<button type="button" class="welcome-close" onclick="dismissWelcomeHero()" aria-label="Fechar introdução">×</button>' +
    '</div>';
}

function dismissWelcomeHero() {
  localStorage.setItem(HERO_DISMISS_KEY, '1');
  const el = document.getElementById('welcomeHero');
  if (el) el.classList.add('hidden');
}

function dismissHeroIfNeeded() {
  /* hero only on overview */
}

function setAppLoading(on, detail) {
  document.body.classList.toggle('app-loading', !!on);
  const bar = document.getElementById('headerProgress');
  const txt = document.getElementById('statusText');
  if (bar) bar.classList.toggle('active', !!on);
  if (txt && detail) txt.textContent = detail;
}

function setLoadProgress(pct, label) {
  const bar = document.getElementById('headerProgress');
  const fill = document.getElementById('headerProgressFill');
  const txt = document.getElementById('statusText');
  if (fill) fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  if (bar) bar.classList.add('active');
  if (txt && label) txt.textContent = label;
}

function finishLoadProgress() {
  const bar = document.getElementById('headerProgress');
  const fill = document.getElementById('headerProgressFill');
  if (fill) fill.style.width = '100%';
  setTimeout(() => {
    if (bar) bar.classList.remove('active');
    if (fill) fill.style.width = '0%';
    document.body.classList.remove('app-loading');
  }, 600);
}

function renderOverviewSkeleton() {
  const kpi = document.getElementById('kpiCards');
  if (!kpi || kpi.children.length) return;
  let html = '';
  for (let i = 0; i < 4; i++) {
    html += '<div class="card skeleton-card"><div class="skeleton sk-line sk-w60"></div><div class="skeleton sk-line sk-w40 sk-lg"></div><div class="skeleton sk-line sk-w80"></div></div>';
  }
  kpi.innerHTML = html;
}

function clearOverviewSkeleton() {
  const kpi = document.getElementById('kpiCards');
  if (kpi && kpi.querySelector('.skeleton-card')) kpi.innerHTML = '';
}

function initUX() {
  buildMainNav();
  initMobileNav();
  renderWelcomeHero();
  initFamilyProfileForm();
  renderOverviewSkeleton();
  applyURLState();
  const st = document.getElementById('statusText');
  if (st) st.setAttribute('aria-live', 'polite');
  if (typeof initUXExtended === 'function') initUXExtended();
}

function exportChartPng(canvasId, filename) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = (filename || canvasId) + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
