/* WORLDPANEL — Anotações, planejamento e tarefas */

const PLANNER_KEY = 'worldpanel_planner_v1';

const DEFAULT_TASKS = [
  { id: 't1', text: 'Calcular reserva financeira (9–12 meses)', done: false, phase: 'prep' },
  { id: 't2', text: 'Validar diploma ENIC-NARIC', done: false, phase: 'prep' },
  { id: 't3', text: 'Escolher cidade destino (Itália)', done: false, phase: 'prep' },
  { id: 't4', text: 'Abrir perfil Fiverr + Upwork', done: false, phase: 'income' },
  { id: 't5', text: 'Pesquisar aluguel (Immobiliare / Idealista)', done: false, phase: 'housing' },
  { id: 't6', text: 'Seguro viagem + passagens', done: false, phase: 'prep' },
  { id: 't7', text: 'Curso italiano A1 (Duolingo + presencial)', done: false, phase: 'lang' },
  { id: 't8', text: 'Codice fiscale + residenza (após chegada)', done: false, phase: 'arrival' },
  { id: 't9', text: 'Inscrição SSN / médico família', done: false, phase: 'arrival' },
  { id: 't10', text: 'Conta bancária italiana', done: false, phase: 'arrival' }
];

const PHASES = {
  prep: { label: 'Preparação', color: 'var(--c-blue)' },
  income: { label: 'Renda / Hustle', color: 'var(--c-green)' },
  housing: { label: 'Moradia', color: 'var(--c-amber)' },
  lang: { label: 'Idioma', color: 'var(--c-purple)' },
  arrival: { label: 'Chegada', color: 'var(--c-red)' },
  notes: { label: 'Geral', color: 'var(--muted)' }
};

const Planner = {
  load() {
    try {
      const raw = localStorage.getItem(PLANNER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { notes: '', tasks: [...DEFAULT_TASKS], target: 'ITA', budget: '', deadline: '' };
  },
  save(state) {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(state));
  },
  get() {
    if (!this._state) this._state = this.load();
    return this._state;
  },
  persist() {
    this.save(this.get());
    this.render();
  }
};

function renderPlanner() {
  const s = Planner.get();
  const notesEl = document.getElementById('plannerNotes');
  const targetEl = document.getElementById('plannerTarget');
  const budgetEl = document.getElementById('plannerBudget');
  const deadlineEl = document.getElementById('plannerDeadline');
  const tasksEl = document.getElementById('plannerTasks');
  const progressEl = document.getElementById('plannerProgress');

  if (notesEl) notesEl.value = s.notes || '';
  if (targetEl) targetEl.value = s.target || 'ITA';
  if (budgetEl) budgetEl.value = s.budget || '';
  if (deadlineEl) deadlineEl.value = s.deadline || '';

  const heroEl = document.getElementById('plannerHero');
  if (heroEl) heroEl.innerHTML = countryHero(s.target || 'ITA', 'Planejamento da transição');

  const done = s.tasks.filter(t => t.done).length;
  const total = s.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (progressEl) {
    progressEl.innerHTML = '<div class="progress-label"><span>Progresso da transição</span><span class="accent-num">' + pct + '%</span></div>' +
      '<div class="progress-wrap" style="height:8px;margin-top:.4rem"><div style="width:' + pct + '%;background:var(--c-green)"></div></div>' +
      '<span style="font-size:.75rem;color:var(--muted)">' + done + ' de ' + total + ' tarefas</span>';
  }

  if (!tasksEl) return;

  const byPhase = {};
  s.tasks.forEach(t => {
    const p = t.phase || 'notes';
    if (!byPhase[p]) byPhase[p] = [];
    byPhase[p].push(t);
  });

  let html = '';
  Object.entries(PHASES).forEach(([key, ph]) => {
    const list = byPhase[key];
    if (!list || !list.length) return;
    html += '<div class="task-phase"><h4 style="color:' + ph.color + '">' + ph.label + '</h4>';
    list.forEach(t => {
      html += '<div class="task-row' + (t.done ? ' done' : '') + '">';
      html += '<input type="checkbox" ' + (t.done ? 'checked' : '') + ' onchange="toggleTask(\'' + t.id + '\',this.checked)">';
      html += '<span class="task-text">' + escapeHtml(t.text) + '</span>';
      html += '<button class="task-del" onclick="deleteTask(\'' + t.id + '\')" title="Remover">×</button></div>';
    });
    html += '</div>';
  });
  tasksEl.innerHTML = html || '<p class="muted-text">Nenhuma tarefa. Adicione abaixo.</p>';
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function saveNotes() {
  const s = Planner.get();
  s.notes = document.getElementById('plannerNotes').value;
  Planner.persist();
}

function saveMeta() {
  const s = Planner.get();
  s.target = document.getElementById('plannerTarget').value;
  s.budget = document.getElementById('plannerBudget').value;
  s.deadline = document.getElementById('plannerDeadline').value;
  const heroEl = document.getElementById('plannerHero');
  if (heroEl) heroEl.innerHTML = countryHero(s.target, 'Planejamento da transição');
  Planner.persist();
}

function addTask() {
  const input = document.getElementById('newTaskText');
  const phase = document.getElementById('newTaskPhase').value;
  const text = (input.value || '').trim();
  if (!text) return;
  const s = Planner.get();
  s.tasks.push({ id: 't' + Date.now(), text, done: false, phase });
  input.value = '';
  Planner.persist();
}

function toggleTask(id, done) {
  const s = Planner.get();
  const t = s.tasks.find(x => x.id === id);
  if (t) { t.done = done; Planner.persist(); }
}

function deleteTask(id) {
  const s = Planner.get();
  s.tasks = s.tasks.filter(x => x.id !== id);
  Planner.persist();
}

function exportPlannerPdf() {
  if (!window.jspdf?.jsPDF) {
    alert('Biblioteca PDF não carregada. Recarregue a página.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const s = Planner.get();
  const c = getCountry(s.target);
  const done = s.tasks.filter(t => t.done).length;
  const total = s.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  let y = margin;
  const line = (text, size, bold) => {
    doc.setFontSize(size || 10);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(text || ''), 174);
    lines.forEach(l => {
      if (y > 275) { doc.addPage(); y = margin; }
      doc.text(l, margin, y);
      y += size > 12 ? 7 : 5;
    });
  };
  line('WORLDPANEL — Planejamento de Transicao', 16, true);
  y += 2;
  line('Gerado em ' + new Date().toLocaleString('pt-BR'), 9, false);
  y += 4;
  line('Destino: ' + (c ? c.name : s.target), 11, true);
  line('Orcamento reserva: ' + (s.budget || '—'), 10, false);
  line('Data meta: ' + (s.deadline || '—'), 10, false);
  line('Progresso: ' + pct + '% (' + done + '/' + total + ' tarefas)', 10, false);
  y += 4;
  line('TAREFAS POR FASE', 11, true);
  Object.entries(PHASES).forEach(([key, ph]) => {
    const list = s.tasks.filter(t => (t.phase || 'notes') === key);
    if (!list.length) return;
    line(ph.label, 10, true);
    list.forEach(t => line((t.done ? '[x] ' : '[ ] ') + t.text, 9, false));
    y += 2;
  });
  y += 2;
  line('ANOTACOES', 11, true);
  line(s.notes || '(vazio)', 9, false);
  y += 4;
  line('— WorldPanel · economy painel global', 8, false);
  doc.save('planejamento_' + new Date().toISOString().slice(0, 10) + '.pdf');
}

function exportPlanner() {
  const s = Planner.get();
  const c = getCountry(s.target);
  const lines = ['WORLDPANEL — Planejamento de Transição', '='.repeat(45),
    'Destino: ' + (c ? c.name : s.target), 'Orçamento: ' + (s.budget || '—'),
    'Meta: ' + (s.deadline || '—'), '', 'TAREFAS:', ''];
  s.tasks.forEach(t => lines.push((t.done ? '[x]' : '[ ]') + ' ' + t.text));
  lines.push('', 'ANOTAÇÕES:', s.notes || '');
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'planejamento_' + new Date().toISOString().slice(0, 10) + '.txt';
  a.click();
}

function initPlannerTab() {
  const targetEl = document.getElementById('plannerTarget');
  if (targetEl && !targetEl.options.length) {
    targetEl.innerHTML = COUNTRIES.filter(c => c.region === 'europe')
      .map(c => '<option value="' + c.code + '">' + countrySelectLabel(c.code) + '</option>').join('');
  }
  renderPlanner();
}
