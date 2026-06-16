/* WORLDPANEL — Tour guiado interativo */

const TOUR_KEY = 'worldpanel_tour_v1';

const TOUR_STEPS = [
  {
    tab: 'overview',
    target: 'header h1',
    title: 'Bem-vindo ao WorldPanel',
    body: 'Painel econômico global com 41 países desde 1960. Dados World Bank, IDH, felicidade e ferramentas para quem planeja mudar de país.',
    placement: 'bottom'
  },
  {
    tab: 'overview',
    target: '#mainNav',
    title: 'Navegação em 4 grupos',
    body: 'Explorar (gráficos e histórico), Países (qualidade e guias), Ferramentas (fórmulas, análise, planejamento) e Config. Reduz a carga cognitiva de 10 abas para 4 decisões.',
    placement: 'bottom'
  },
  {
    tab: 'overview',
    target: '#kpiCards',
    title: 'Resumo imediato',
    body: 'KPIs calculados assim que os dados carregam — sem precisar clicar em nada. Médias dos países ativos na sua seleção.',
    placement: 'top'
  },
  {
    tab: 'overview',
    target: '#tableTitle',
    title: 'Tabela por categoria',
    body: 'Alterne Macroeconômico, Social, Trabalho ou Qualidade de Vida. Exporte CSV para planilhas e relatórios.',
    placement: 'bottom'
  },
  {
    tab: 'indicators',
    target: '#indSearch',
    title: 'Busca inteligente de país',
    body: 'Digite "bra", "ita" ou "ale" — autocomplete fuzzy substitui o dropdown lento. Brasil já vem pré-carregado.',
    placement: 'bottom',
    before: () => { if (typeof initHistoryTab === 'function') initHistoryTab(); }
  },
  {
    tab: 'indicators',
    target: '#chartHistory',
    title: 'Gráfico com zoom',
    body: 'Pinch no mobile ou scroll no desktop para zoom no eixo temporal. Shift + arrastar para pan. Toque em um ponto para ver o tooltip.',
    placement: 'top'
  },
  {
    tab: 'relocation',
    target: '#fpHousehold',
    title: 'Simulador personalizado',
    body: 'Ajuste composição familiar, idade, escolaridade, cidadania UE e objetivo — o ranking europeu recalcula para o seu perfil.',
    placement: 'bottom'
  },
  {
    tab: 'planner',
    target: '#plannerTarget',
    title: 'Planejamento de transição',
    body: 'Meta, orçamento, checklist por fase e anotações. Exporte em TXT, CSV, JSON ou PDF para guardar o plano.',
    placement: 'bottom'
  },
  {
    tab: 'overview',
    target: '#themeToggle',
    title: 'Tema e conforto visual',
    body: 'Alterne modo claro/escuro para análises prolongadas. Preferência salva automaticamente.',
    placement: 'bottom'
  },
  {
    tab: 'config',
    target: '#watchlistPanel',
    title: 'Watchlist e compartilhar',
    body: 'Configure alertas (ex.: Gini > 50). Copie a URL do navegador após filtrar — links com ?tab=indicators&pais=BRA&ind=... são compartilháveis.',
    placement: 'top',
    action: { label: 'Copiar link atual', fn: 'copyShareLink' }
  }
];

let tourIndex = 0;
let tourActive = false;

function tourEl(id) {
  return document.getElementById(id);
}

function buildTourUI() {
  if (tourEl('tourRoot')) return;
  const root = document.createElement('div');
  root.id = 'tourRoot';
  root.className = 'tour-root hidden';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'tourTitle');
  root.innerHTML =
    '<div class="tour-overlay" id="tourOverlay" aria-hidden="true"></div>' +
    '<div class="tour-spotlight" id="tourSpotlight" aria-hidden="true"></div>' +
    '<div class="tour-popover" id="tourPopover" tabindex="-1">' +
    '<p class="tour-step-label" id="tourStepLabel"></p>' +
    '<h2 id="tourTitle"></h2>' +
    '<p id="tourBody"></p>' +
    '<div class="tour-actions" id="tourExtra"></div>' +
    '<div class="tour-nav">' +
    '<button type="button" class="btn btn-sm secondary" id="tourSkip">Pular tour</button>' +
    '<div class="tour-nav-right">' +
    '<button type="button" class="btn btn-sm secondary" id="tourPrev">Anterior</button>' +
    '<button type="button" class="btn btn-sm primary" id="tourNext">Próximo</button>' +
    '</div></div></div>';
  document.body.appendChild(root);
  tourEl('tourSkip').addEventListener('click', endTour);
  tourEl('tourPrev').addEventListener('click', () => goTourStep(tourIndex - 1));
  tourEl('tourNext').addEventListener('click', () => {
    if (tourIndex >= TOUR_STEPS.length - 1) endTour(true);
    else goTourStep(tourIndex + 1);
  });
  tourEl('tourOverlay').addEventListener('click', endTour);
  document.addEventListener('keydown', tourKeydown);
}

function tourKeydown(e) {
  if (!tourActive) return;
  if (e.key === 'Escape') endTour();
  if (e.key === 'ArrowRight') goTourStep(tourIndex + 1);
  if (e.key === 'ArrowLeft') goTourStep(tourIndex - 1);
}

function positionTourSpotlight(el, placement) {
  const spot = tourEl('tourSpotlight');
  const pop = tourEl('tourPopover');
  if (!el || !spot || !pop) return;
  const pad = 8;
  const rect = el.getBoundingClientRect();
  spot.style.top = (rect.top - pad) + 'px';
  spot.style.left = (rect.left - pad) + 'px';
  spot.style.width = (rect.width + pad * 2) + 'px';
  spot.style.height = (rect.height + pad * 2) + 'px';
  el.classList.add('tour-highlight');
  const popW = Math.min(340, window.innerWidth - 24);
  pop.style.width = popW + 'px';
  let top = placement === 'top' ? rect.top - pop.offsetHeight - 16 : rect.bottom + 16;
  let left = rect.left + rect.width / 2 - popW / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - popW - 12));
  if (top < 12) top = rect.bottom + 16;
  if (top + pop.offsetHeight > window.innerHeight - 12) top = rect.top - pop.offsetHeight - 16;
  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
}

function goTourStep(idx) {
  if (idx < 0 || idx >= TOUR_STEPS.length) return;
  document.querySelectorAll('.tour-highlight').forEach(e => e.classList.remove('tour-highlight'));
  tourIndex = idx;
  const step = TOUR_STEPS[idx];
  if (step.tab && typeof switchTab === 'function') switchTab(step.tab, { skipTour: true, skipScroll: true });
  if (step.before) step.before();
  setTimeout(() => {
    const el = document.querySelector(step.target);
    if (!el) {
      if (idx < TOUR_STEPS.length - 1) goTourStep(idx + 1);
      return;
    }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => {
      tourEl('tourStepLabel').textContent = 'Passo ' + (idx + 1) + ' de ' + TOUR_STEPS.length;
      tourEl('tourTitle').textContent = step.title;
      tourEl('tourBody').textContent = step.body;
      tourEl('tourPrev').disabled = idx === 0;
      tourEl('tourNext').textContent = idx >= TOUR_STEPS.length - 1 ? 'Concluir' : 'Próximo';
      const extra = tourEl('tourExtra');
      extra.innerHTML = '';
      if (step.action) {
        extra.innerHTML = '<button type="button" class="btn btn-sm" id="tourActionBtn">' + step.action.label + '</button>';
        tourEl('tourActionBtn').addEventListener('click', () => {
          if (step.action.fn === 'copyShareLink' && typeof copyShareLink === 'function') copyShareLink();
        });
      }
      positionTourSpotlight(el, step.placement || 'bottom');
      tourEl('tourPopover').focus();
    }, 350);
  }, step.tab ? 280 : 50);
}

function startTour(force) {
  if (tourActive) return;
  if (!force && localStorage.getItem(TOUR_KEY)) return;
  buildTourUI();
  tourActive = true;
  const root = tourEl('tourRoot');
  root.classList.remove('hidden');
  document.body.classList.add('tour-active');
  goTourStep(0);
}

function endTour(completed) {
  tourActive = false;
  document.querySelectorAll('.tour-highlight').forEach(e => e.classList.remove('tour-highlight'));
  const root = tourEl('tourRoot');
  if (root) root.classList.add('hidden');
  document.body.classList.remove('tour-active');
  if (completed) localStorage.setItem(TOUR_KEY, '1');
}

function restartTour() {
  localStorage.removeItem(TOUR_KEY);
  startTour(true);
}

function copyShareLink() {
  if (typeof updateURLState === 'function') updateURLState();
  const url = location.href;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(() => alert('Link copiado! Cole e compartilhe a análise.')).catch(() => prompt('Copie o link:', url));
  } else {
    prompt('Copie o link:', url);
  }
}

function initTour() {
  buildTourUI();
  setTimeout(() => startTour(false), 1200);
}
