/* WORLDPANEL — Fórmulas econômicas e de mudança */

function v(sym, name, desc) {
  return '<span class="var-chip" tabindex="0" role="button" aria-label="' + name + '">' + sym +
    '<span class="var-tip"><strong>' + name + '</strong>' + desc + '</span></span>';
}

function varsRow(items) {
  return '<div class="formula-vars"><span class="formula-vars-label">Variáveis — passe o mouse ou clique:</span>' + items.join('') + '</div>';
}

function paperBlock(links) {
  if (!links || !links.length) return '';
  const html = links.map(l => '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + '</a>').join(' · ');
  return '<div class="formula-paper"><span class="paper-label">Referência:</span>' + html + '</div>';
}

function explainBlock(help, eq, varsHtml, paperLinks) {
  return '<div class="formula-explain">' +
    '<div class="formula-help">' + help + '</div>' +
    '<div class="formula-eq">' + eq + '</div>' +
    (varsHtml || '') +
    paperBlock(paperLinks) +
    '</div>';
}

const FORMULA_SECTIONS = [
  {
    title: 'Macroeconomia — Entender o país',
    cards: ['misery', 'taylor', 'fisher', 'cagr', 'rule72']
  },
  {
    title: 'Mudança internacional — Poder de compra e custos',
    cards: ['ppp', 'colratio', 'realflow', 'housing', 'reserve', 'breakeven']
  },
  {
    title: 'Análise estrutural',
    cards: ['eci', 'giniinterp', 'familyeu']
  }
];

const FORMULA_HTML = {
  misery: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Mede o "desconforto econômico" somando inflação e desemprego. Compare países em crise ou avalie risco antes de mudar.',
      'Misery = ' + v('π', 'π — Inflação', 'Variação percentual anual dos preços (IPC). Alta inflação corrói poder de compra.') + ' + ' + v('u', 'u — Desemprego', 'Percentual da força de trabalho sem emprego. Desemprego alto = menos renda familiar.'),
      varsRow([v('π', 'π', 'Inflação anual (%)'), v('u', 'u', 'Taxa de desemprego (%)'), v('Misery', 'Misery', 'Quanto maior, pior o bem-estar econômico médio')]),
      [{ url: 'https://www.cato.org/sites/cato.org/files/pubs/pdf/hanke-misery-index-2017.pdf', label: 'Hanke — Misery Index (PDF)' }, { url: 'https://en.wikipedia.org/wiki/Misery_index_(economics)', label: 'Okun (1960s)' }]
    );
    return '<div class="card formula-card"><h4>1. Índice Misery (Okun)</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fMiseryCountry" onchange="calcMisery()"></select></div>' +
      '<div class="formula-use">&lt;10 confortável · 10–20 moderado · &gt;20 alto sofrimento · &gt;30 crise</div>' +
      '<div class="formula-result" id="resMisery">—</div></div>';
  })(),

  taylor: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Estima a taxa de juros ideal do banco central. Ajuda a ver se a política monetária está apertada ou frouxa — impacta crédito, imóveis e câmbio.',
      v('i*', 'i* — Taxa ideal', 'Taxa de juros de equilíbrio sugerida pela regra.') + ' = ' +
      v('r̄', 'r̄ — Taxa neutra', 'Juros de longo prazo quando inflação e PIB estão na meta (~2%).') + ' + 0,5(' +
      v('π', 'π — Inflação atual', 'IPC anual observado no país.') + ' − ' +
      v('π*', 'π* — Meta de inflação', 'Alvo do banco central (ex: 2% EZ, 3% Brasil).') + ') + 0,5(' +
      v('y−ȳ', 'Gap do PIB', 'Diferença entre PIB real e potencial. Positivo = economia aquecida.') + ')',
      varsRow([v('i*', 'i*', 'Taxa de juros recomendada (%)'), v('r̄', 'r̄', 'Taxa neutra real (%)'), v('π', 'π', 'Inflação vigente'), v('π*', 'π*', 'Meta inflacionária'), v('y−ȳ', 'Gap PIB', 'Desvio do produto potencial (%)')]),
      [{ url: 'https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/Assets/PDFs/Taylor/rule.pdf', label: 'Taylor (1993) — PDF original' }]
    );
    return '<div class="card formula-card"><h4>2. Regra de Taylor</h4>' + ex +
      '<div class="form-row"><label>Inflação %</label><input type="number" id="fTaylorInf" value="4" step="0.1" style="width:72px">' +
      '<label>Meta π* %</label><input type="number" id="fTaylorTarget" value="3" step="0.1" style="width:72px">' +
      '<label>Gap PIB %</label><input type="number" id="fTaylorGap" value="0" step="0.1" style="width:72px">' +
      '<label>Taxa r̄ %</label><input type="number" id="fTaylorNeutral" value="2" step="0.1" style="width:72px">' +
      '<button class="btn" onclick="calcTaylor()">Calcular</button></div>' +
      '<div class="formula-use">i* &gt; juros atuais → política frouxa · i* &lt; juros atuais → apertada</div>' +
      '<div class="formula-result" id="resTaylor">—</div></div>';
  })(),

  fisher: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Revela o rendimento real após inflação. Essencial para comparar poupança e salários entre países.',
      'Exata: (1+' + v('r_real', 'r_real', 'Taxa de juros ou ganho real, descontada inflação.') + ') = (1+' +
      v('r_nom', 'r_nom', 'Taxa nominal — o número que o banco anuncia.') + ') / (1+' +
      v('π', 'π', 'Inflação anual.') + ') &nbsp;|&nbsp; Aprox: r_real ≈ r_nom − π',
      varsRow([v('r_nom', 'r_nom', 'Taxa nominal (%)'), v('π', 'π', 'Inflação (%)'), v('r_real', 'r_real', 'Ganho real em poder de compra (%)')]),
      [{ url: 'https://fraser.stlouisfed.org/title/theory-interest-153', label: 'Fisher (1930) — Theory of Interest' }]
    );
    return '<div class="card formula-card"><h4>3. Efeito Fisher</h4>' + ex +
      '<div class="form-row"><label>Nominal %</label><input type="number" id="fFisherNom" value="10" step="0.1" style="width:72px">' +
      '<label>Inflação %</label><input type="number" id="fFisherInf" value="4.5" step="0.1" style="width:72px">' +
      '<button class="btn" onclick="calcFisher()">Calcular</button></div>' +
      '<div class="formula-result" id="resFisher">—</div></div>';
  })(),

  cagr: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Taxa média anual de crescimento da riqueza per capita ao longo de décadas.',
      v('CAGR', 'CAGR', 'Compound Annual Growth Rate — crescimento composto.') + ' = (' +
      v('Vf', 'V_final', 'Valor final do indicador (ex: PIB pc último ano).') + ' / ' +
      v('Vi', 'V_inicial', 'Valor no início do período.') + ')^(1/' +
      v('n', 'n', 'Número de anos entre Vi e Vf.') + ') − 1',
      varsRow([v('Vi', 'Vi', 'PIB pc inicial'), v('Vf', 'Vf', 'PIB pc final'), v('n', 'n', 'Anos de histórico'), v('CAGR', 'CAGR', 'Crescimento médio anual (%)')]),
      [{ url: 'https://www.worldbank.org/en/research/brief/historical-data', label: 'World Bank — WDI histórico' }]
    );
    return '<div class="card formula-card"><h4>4. CAGR — PIB per capita</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fCAGRCountry" onchange="calcCAGR()"></select></div>' +
      '<div class="formula-use">&gt;3%/ano = forte · &lt;1% = estagnação</div>' +
      '<div class="formula-result" id="resCAGR">—</div></div>';
  })(),

  rule72: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Atalho mental — em quantos anos um valor dobra.',
      'Anos ≈ 72 / ' + v('taxa', 'taxa (%)', 'Taxa de crescimento ou inflação anual em percentual.'),
      varsRow([v('72', '72', 'Constante de aproximação (ln 2 ≈ 0,693)'), v('taxa', 'taxa', 'Taxa anual em %')]),
      [{ url: 'https://en.wikipedia.org/wiki/Rule_of_72', label: 'Regra dos 72 — referência' }]
    );
    return '<div class="card formula-card"><h4>5. Regra dos 72</h4>' + ex +
      '<div class="form-row"><label>Taxa %</label><input type="number" id="fRule72" value="7" step="0.1" style="width:72px">' +
      '<button class="btn" onclick="calcRule72()">Calcular</button></div>' +
      '<div class="formula-result" id="resRule72">—</div></div>';
  })(),

  ppp: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Converte salário para poder de compra equivalente em outro país.',
      v('S_eq', 'Salário equiv.', 'Quanto seu salário "vale" no destino em termos reais.') + ' = ' +
      v('S', 'Salário', 'Sua renda mensal na moeda de referência (USD).') + ' × (' +
      v('PPP_d', 'PPP destino', 'Fator de paridade do país para onde vai.') + ' / ' +
      v('PPP_o', 'PPP origem', 'Fator do país onde está hoje.') + ')',
      varsRow([v('S', 'S', 'Salário atual'), v('PPP_o', 'PPP origem', 'Poder de compra relativo origem'), v('PPP_d', 'PPP destino', 'Poder de compra relativo destino')]),
      [{ url: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/603831468139806508', label: 'World Bank — Manual PPP (PDF)' }]
    );
    return '<div class="card formula-card"><h4>6. Paridade PPP</h4>' + ex +
      '<div class="form-row"><label>Salário USD</label><input type="number" id="fPPPSal" value="2500" style="width:90px">' +
      '<label>De</label><select id="fPPPFrom"></select><label>Para</label><select id="fPPPTo"></select>' +
      '<button class="btn" onclick="calcPPP()">Calcular</button></div>' +
      '<div class="formula-result" id="resPPP">—</div></div>';
  })(),

  colratio: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Compara custo de vida destino vs origem. NYC = 100.',
      v('R', 'Razão', 'Quociente entre índices de custo de vida.') + ' = ' +
      v('COL_d', 'COL destino', 'Índice de custo no país de destino.') + ' / ' +
      v('COL_o', 'COL origem', 'Índice no país de origem.') + ' &nbsp; (&lt;1 = mais barato)',
      varsRow([v('COL_o', 'COL origem', 'Custo de vida origem (NYC=100)'), v('COL_d', 'COL destino', 'Custo de vida destino')]),
      [{ url: 'https://www.worldbank.org/en/programs/icp', label: 'World Bank ICP' }]
    );
    return '<div class="card formula-card"><h4>7. Razão Custo de Vida</h4>' + ex +
      '<div class="form-row"><label>Origem</label><select id="fCOLFrom"></select><label>Destino</label><select id="fCOLTo"></select>' +
      '<button class="btn" onclick="calcCOLRatio()">Calcular</button></div>' +
      '<div class="formula-result" id="resCOL">—</div></div>';
  })(),

  realflow: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Quanto sobra após impostos e aluguel — essencial para casal começando do zero.',
      v('Líq', 'Líquido', 'Dinheiro que sobra no fim do mês.') + ' ≈ ' +
      v('S', 'Salário bruto', 'Renda antes de impostos.') + ' × (1 − ' +
      v('T', 'Impostos %', 'Carga tributária média sobre salário.') + ') − ' +
      v('A', 'Aluguel', 'Estimativa T2 fora do centro.'),
      varsRow([v('S', 'S', 'Salário bruto USD'), v('T', 'T', 'Impostos (%)'), v('A', 'A', 'Aluguel mensal est.')]),
      []
    );
    return '<div class="card formula-card"><h4>8. Fluxo de caixa real</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fFlowCountry"></select>' +
      '<label>Salário USD</label><input type="number" id="fFlowSal" value="1800" style="width:90px">' +
      '<button class="btn" onclick="calcRealFlow()">Calcular</button></div>' +
      '<div class="formula-result" id="resFlow">—</div></div>';
  })(),

  housing: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Verifica se o aluguel cabe no orçamento (regra dos 30%).',
      '% renda = ' + v('A', 'Aluguel', 'Custo mensal estimado.') + ' / ' +
      v('S', 'Salário', 'Sua renda mensal.') + ' × 100',
      varsRow([v('A', 'A', 'Aluguel T2 estimado'), v('S', 'S', 'Seu salário'), v('30%', '30%', 'Limite saudável de comprometimento')]),
      []
    );
    return '<div class="card formula-card"><h4>9. Acessibilidade habitacional</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fHousingCountry" onchange="calcHousing()"></select>' +
      '<label>Salário USD</label><input type="number" id="fHousingSal" value="2000" style="width:90px" onchange="calcHousing()"></div>' +
      '<div class="formula-result" id="resHousing">—</div></div>';
  })(),

  reserve: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Quanto guardar antes de mudar sem emprego garantido.',
      v('R', 'Reserva', 'Montante total recomendado.') + ' = (' +
      v('A', 'Aluguel', 'Custo mensal de moradia.') + ' + ' +
      v('C', 'Custo base', 'Alimentação, transporte, contas.') + ') × ' +
      v('m', 'meses', 'Meses de segurança (6–12).') + ' × ' +
      v('p', 'pessoas', 'Número de pessoas na família.') + '',
      varsRow([v('A', 'A', 'Aluguel/mês'), v('C', 'C', 'Vida básica/mês'), v('m', 'm', 'Meses de reserva'), v('p', 'p', 'Pessoas')]),
      []
    );
    return '<div class="card formula-card"><h4>10. Fundo de reserva</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fReserveCountry"></select>' +
      '<label>Meses</label><input type="number" id="fReserveMonths" value="9" min="3" max="24" style="width:60px">' +
      '<label>Pessoas</label><input type="number" id="fReservePeople" value="2" min="1" max="6" style="width:50px">' +
      '<button class="btn" onclick="calcReserve()">Calcular</button></div>' +
      '<div class="formula-result" id="resReserve">—</div></div>';
  })(),

  breakeven: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Meses para a mudança se pagar financeiramente.',
      v('m', 'Meses', 'Tempo até recuperar custo da mudança.') + ' = ' +
      v('C', 'Custo mudança', 'Passagens, documentos, reserva inicial.') + ' / (' +
      v('ΔS', 'Ganho mensal', 'Diferença de salário líquido destino − origem.') + ')',
      varsRow([v('C', 'C', 'Custo total da mudança (USD)'), v('ΔS', 'ΔS', 'Ganho mensal líquido extra')]),
      []
    );
    return '<div class="card formula-card"><h4>11. Break-even mudança</h4>' + ex +
      '<div class="form-row"><label>De</label><select id="fBEFrom"></select><label>Para</label><select id="fBETo"></select>' +
      '<label>Custo USD</label><input type="number" id="fBECost" value="8000" style="width:90px">' +
      '<label>Salário origem</label><input type="number" id="fBESalFrom" value="1500" style="width:80px">' +
      '<button class="btn" onclick="calcBreakEven()">Calcular</button></div>' +
      '<div class="formula-result" id="resBE">—</div></div>';
  })(),

  eci: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Mede sofisticação das exportações — países com ECI alto têm vagas melhores em tech e engenharia.',
      v('ECI', 'ECI', 'Economic Complexity Index. Escala aproximada de −2 a +2.') + ' ∈ [−2, +2] · &gt;1,5 = alta complexidade',
      varsRow([v('ECI', 'ECI', 'Índice Hausmann/Harvard'), v('+1.5', '>1,5', 'Exportações sofisticadas (DEU, JPN)'), v('−0.5', '<−0,5', 'Commodities, baixa diversificação')]),
      [{ url: 'https://growthlab.cid.harvard.edu/publications/complexity-preparedness-and-uncertainty', label: 'Hausmann — Harvard Growth Lab' }]
    );
    return '<div class="card formula-card"><h4>12. ECI — Complexidade</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fECICountry" onchange="calcECI()"></select></div>' +
      '<div class="formula-result" id="resECI">—</div></div>';
  })(),

  giniinterp: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Mede desigualdade de renda. 0 = igualdade perfeita, 100 = máxima concentração.',
      v('Gini', 'Gini', 'Coeficiente de Gini. Quanto maior, mais renda concentrada no topo.'),
      varsRow([v('0', '0', 'Igualdade total (teórico)'), v('30', '<30', 'Baixa desigualdade (Nórdicos)'), v('50', '>50', 'Alta desigualdade')]),
      [{ url: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/199081468158177725', label: 'World Bank — Desigualdade (PDF)' }]
    );
    return '<div class="card formula-card"><h4>13. Gini — Desigualdade</h4>' + ex +
      '<div class="form-row"><label>País</label><select id="fGiniCountry" onchange="calcGiniInterp()"></select></div>' +
      '<div class="formula-result" id="resGini">—</div></div>';
  })(),

  familyeu: (function() {
    const ex = explainBlock(
      '<strong>Para que serve:</strong> Ranking para casal UE com ensino superior, pouco idioma, querendo formar família.',
      'Score = 22%' + v('idioma', 'Idioma', 'Facilidade para falante de português.') + ' + 18%' + v('emprego', 'Emprego', 'Entrada no mercado sem fluência.') + ' + 15% custo + 12% saúde + 10% desemprego + 8% segurança + 8% IDH + 7% felicidade',
      varsRow([v('IDH', 'IDH', 'Índice Desenvolvimento Humano (PNUD)'), v('Felic.', 'Felicidade', 'World Happiness Report 0–10')]),
      [{ url: 'https://hdr.undp.org/data-center/documentation', label: 'PNUD — IDH (PDF)' }, { url: 'https://worldhappiness.report/ed/2024/', label: 'World Happiness 2024' }]
    );
    return '<div class="card formula-card"><h4>14. Score Família UE</h4>' + ex +
      '<button class="btn" onclick="renderFamilyProfile();document.querySelector(\'[data-tab=relocation]\').click()">Ver ranking Europa</button>' +
      '<div class="formula-result" id="resFamilyEU">Clique para calcular na aba Mudança</div></div>';
  })()
};

let varTooltipInited = false;

function initVarTooltips() {
  document.querySelectorAll('.var-chip').forEach(chip => {
    chip.onclick = e => {
      e.stopPropagation();
      const on = chip.classList.contains('active');
      document.querySelectorAll('.var-chip.active').forEach(c => c.classList.remove('active'));
      if (!on) chip.classList.add('active');
    };
  });
  if (!varTooltipInited) {
    varTooltipInited = true;
    document.addEventListener('click', () => {
      document.querySelectorAll('.var-chip.active').forEach(c => c.classList.remove('active'));
    });
  }
}

function buildFormulas() {
  const grid = document.getElementById('formulasGrid');
  if (!grid) return;
  let html = '';
  FORMULA_SECTIONS.forEach(sec => {
    html += '<div class="formula-section"><h3>' + sec.title + '</h3></div>';
    sec.cards.forEach(id => { html += FORMULA_HTML[id]; });
  });
  grid.innerHTML = html;
  initVarTooltips();
  const opts = COUNTRIES.map(c => '<option value="' + c.code + '">' + countrySelectLabel(c.code) + '</option>').join('');
  ['fMiseryCountry','fCAGRCountry','fECICountry','fPPPFrom','fPPPTo','fCOLFrom','fCOLTo',
   'fFlowCountry','fHousingCountry','fReserveCountry','fBEFrom','fBETo','fGiniCountry'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
  if (document.getElementById('fPPPFrom')) document.getElementById('fPPPFrom').value = 'BRA';
  if (document.getElementById('fPPPTo')) document.getElementById('fPPPTo').value = 'PRT';
  if (document.getElementById('fCOLFrom')) document.getElementById('fCOLFrom').value = 'BRA';
  if (document.getElementById('fCOLTo')) document.getElementById('fCOLTo').value = 'PRT';
  if (document.getElementById('fBEFrom')) document.getElementById('fBEFrom').value = 'BRA';
  if (document.getElementById('fBETo')) document.getElementById('fBETo').value = 'PRT';
}

function estRent(code) {
  const d = data[code] || {};
  return (d.rent_index || 20) * 18;
}

function estMonthlyCost(code) {
  const d = data[code] || {};
  return (d.cost_living || 50) * 35;
}

function calcMisery() {
  const code = document.getElementById('fMiseryCountry').value;
  const inf = data[code]?.inflation ?? 0;
  const unemp = data[code]?.unemployment ?? 0;
  const misery = inf + unemp;
  const c = getCountry(code);
  let band = misery < 10 ? '<span class="tag up">Confortável</span> — boa estabilidade para morar/investir' :
    misery < 20 ? '<span class="tag neutral">Moderado</span> — monitorar inflação e emprego' :
    misery < 30 ? '<span class="tag down">Elevado</span> — pressão sobre famílias e consumo' :
    '<span class="tag down">Crise</span> — alto risco macroeconômico';
  document.getElementById('resMisery').innerHTML =
    `<strong>${c.name}:</strong> Misery = ${fmtNum(inf)}% + ${fmtNum(unemp)}% = <strong>${fmtNum(misery)}</strong><br>${band}`;
}

function calcTaylor() {
  const pi = +document.getElementById('fTaylorInf').value;
  const target = +document.getElementById('fTaylorTarget').value;
  const gap = +document.getElementById('fTaylorGap').value;
  const rBar = +document.getElementById('fTaylorNeutral').value;
  const rate = rBar + 0.5 * (pi - target) + 0.5 * gap;
  const stance = rate > rBar + 1 ? 'Contracionista (freia economia)' :
    rate < rBar - 1 ? 'Expansionista (estimula economia)' : 'Neutra';
  document.getElementById('resTaylor').innerHTML =
    `i* = ${fmtNum(rBar)} + 0,5×(${fmtNum(pi)}−${fmtNum(target)}) + 0,5×(${fmtNum(gap)}) = <strong>${fmtNum(rate)}%</strong><br>Interpretação: ${stance}`;
}

function calcFisher() {
  const nom = +document.getElementById('fFisherNom').value / 100;
  const inf = +document.getElementById('fFisherInf').value / 100;
  const exact = ((1 + nom) / (1 + inf) - 1) * 100;
  const approx = (+document.getElementById('fFisherNom').value) - (+document.getElementById('fFisherInf').value);
  const msg = exact > 0 ? 'Poupança/renda cresce em poder real' : 'Poder de compra está caindo';
  document.getElementById('resFisher').innerHTML =
    `Taxa real exata: <strong>${fmtNum(exact)}%</strong> · Aproximação: ${fmtNum(approx)}%<br>${msg}`;
}

function calcPPP() {
  const sal = +document.getElementById('fPPPSal').value;
  const fromC = document.getElementById('fPPPFrom').value;
  const toC = document.getElementById('fPPPTo').value;
  const from = PPP_FACTOR[fromC], to = PPP_FACTOR[toC];
  const equiv = sal * (to / from);
  const colRatio = (data[toC]?.cost_living || 50) / (data[fromC]?.cost_living || 50);
  const fc = getCountry(fromC), tc = getCountry(toC);
  document.getElementById('resPPP').innerHTML =
    `$${fmtNum(sal, 0)} em ${fc.name} → <strong>$${fmtNum(equiv, 0)}</strong> poder de compra em ${tc.name}<br>
    Custo de vida relativo: ${colRatio < 1 ? fmtNum((1 - colRatio) * 100, 0) + '% mais barato' : fmtNum((colRatio - 1) * 100, 0) + '% mais caro'} no destino`;
}

function calcCOLRatio() {
  const from = document.getElementById('fCOLFrom').value;
  const to = document.getElementById('fCOLTo').value;
  const colF = data[from]?.cost_living || 50;
  const colT = data[to]?.cost_living || 50;
  const ratio = colT / colF;
  const fc = getCountry(from), tc = getCountry(to);
  document.getElementById('resCOL').innerHTML =
    `${tc.name} vs ${fc.name}: razão <strong>${fmtNum(ratio, 2)}</strong><br>
    ${ratio < 1 ? `Destino ${fmtNum((1 - ratio) * 100, 0)}% mais barato` : `Destino ${fmtNum((ratio - 1) * 100, 0)}% mais caro`} em custo de vida geral`;
}

function calcCAGR() {
  const code = document.getElementById('fCAGRCountry').value;
  const hist = history[code]?.gdp_pc_ppp || history[code]?.gdp_pc;
  if (!hist || hist.length < 2) {
    document.getElementById('resCAGR').innerHTML = 'Aguardando histórico da API… Abra com internet e clique em Config → Atualizar agora.';
    return;
  }
  const vi = hist[0].value, vf = hist[hist.length - 1].value;
  const n = hist[hist.length - 1].year - hist[0].year;
  if (n <= 0 || vi <= 0) { document.getElementById('resCAGR').textContent = 'Dados insuficientes'; return; }
  const cagr = (Math.pow(vf / vi, 1 / n) - 1) * 100;
  const years72 = cagr > 0 ? 72 / cagr : null;
  const c = getCountry(code);
  document.getElementById('resCAGR').innerHTML =
    `<strong>${c.name}</strong> ${hist[0].year}→${hist[hist.length - 1].year} (${n} anos): CAGR <strong>${fmtNum(cagr)}%</strong>/ano<br>
    PIB pc: $${fmtNum(vi, 0)} → $${fmtNum(vf, 0)}${years72 ? ` · A este ritmo, dobra a cada ~${fmtNum(years72, 0)} anos` : ''}`;
}

function calcRule72() {
  const rate = +document.getElementById('fRule72').value;
  if (!rate) { document.getElementById('resRule72').textContent = 'Taxa inválida'; return; }
  const years = 72 / Math.abs(rate);
  const ctx = rate > 0 ? 'investimento/poupança dobra' : 'inflação dobra preços';
  document.getElementById('resRule72').innerHTML =
    `Com ${fmtNum(rate)}% ao ano, <strong>${fmtNum(years, 1)} anos</strong> para ${ctx}.`;
}

function calcRealFlow() {
  const code = document.getElementById('fFlowCountry').value;
  const sal = +document.getElementById('fFlowSal').value;
  const d = data[code] || {};
  const tax = (d.tax_burden || 30) / 100;
  const net = sal * (1 - tax);
  const rent = estRent(code);
  const leftover = net - rent;
  const pct = sal > 0 ? (rent / net) * 100 : 0;
  const c = getCountry(code);
  const ok = pct <= 30 ? '<span class="tag up">Aluguel dentro da regra dos 30%</span>' : pct <= 40 ? '<span class="tag neutral">Apertado</span>' : '<span class="tag down">Aluguel consome muito da renda</span>';
  document.getElementById('resFlow').innerHTML =
    `<strong>${c.name}</strong> · Bruto $${fmtNum(sal, 0)} → Líquido ~$${fmtNum(net, 0)} (impostos ${fmtNum(d.tax_burden)}%)<br>
    Aluguel est. $${fmtNum(rent, 0)}/mês (${fmtNum(pct, 0)}% da renda) · <strong>Sobra $${fmtNum(leftover, 0)}</strong><br>${ok}`;
}

function calcHousing() {
  const code = document.getElementById('fHousingCountry').value;
  const sal = +document.getElementById('fHousingSal').value;
  const d = data[code] || {};
  const rent = estRent(code);
  const minW = d.min_wage || 500;
  const monthsMin = rent / minW;
  const pctSal = sal > 0 ? (rent / sal) * 100 : 0;
  const c = getCountry(code);
  document.getElementById('resHousing').innerHTML =
    `<strong>${c.name}</strong> · Aluguel T2 est.: $${fmtNum(rent, 0)}/mês<br>
    = ${fmtNum(monthsMin, 1)}× salário mínimo · ${fmtNum(pctSal, 0)}% do seu salário de $${fmtNum(sal, 0)}<br>
    ${pctSal <= 30 ? '<span class="tag up">Viável para família</span>' : pctSal <= 45 ? '<span class="tag neutral">Possível com duas rendas</span>' : '<span class="tag down">Difícil sem renda alta</span>'}`;
}

function calcReserve() {
  const code = document.getElementById('fReserveCountry').value;
  const months = +document.getElementById('fReserveMonths').value;
  const people = +document.getElementById('fReservePeople').value;
  const monthly = estMonthlyCost(code) + estRent(code);
  const total = monthly * months * (people * 0.85);
  const c = getCountry(code);
  document.getElementById('resReserve').innerHTML =
    `<strong>${c.name}</strong> · ${people} pessoa(s) × ${months} meses<br>
    Despesa mensal est.: $${fmtNum(monthly, 0)} · <strong>Reserva recomendada: $${fmtNum(total, 0)}</strong><br>
    Inclui aluguel + alimentação/transporte básico. Adicione 20% para imprevistos.`;
}

function calcBreakEven() {
  const from = document.getElementById('fBEFrom').value;
  const to = document.getElementById('fBETo').value;
  const cost = +document.getElementById('fBECost').value;
  const salFrom = +document.getElementById('fBESalFrom').value;
  const salTo = data[to]?.avg_salary || 2000;
  const taxTo = (data[to]?.tax_burden || 30) / 100;
  const netTo = salTo * (1 - taxTo);
  const diff = netTo - salFrom;
  const fc = getCountry(from), tc = getCountry(to);
  if (diff <= 0) {
    document.getElementById('resBE').innerHTML =
      `Atenção: salário líquido médio em ${tc.name} ($${fmtNum(netTo, 0)}) não supera sua renda atual ($${fmtNum(salFrom, 0)}). Mudança por dinheiro não se paga — avalie qualidade de vida/família.`;
    return;
  }
  const months = cost / diff;
  document.getElementById('resBE').innerHTML =
    `Custo mudança $${fmtNum(cost, 0)} ÷ ganho mensal $${fmtNum(diff, 0)} = <strong>${fmtNum(months, 1)} meses</strong> para break-even<br>
    ${months < 12 ? '<span class="tag up">Compensa em menos de 1 ano</span>' : months < 24 ? '<span class="tag neutral">Compensa em 1–2 anos</span>' : '<span class="tag down">Retorno financeiro lento — planeje reserva maior</span>'}`;
}

function calcECI() {
  const code = document.getElementById('fECICountry').value;
  const eci = ECI_DATA[code];
  const c = getCountry(code);
  const level = eci > 1.5 ? 'Alta — vagas sofisticadas (tech, engenharia, pharma)' :
    eci > 0.5 ? 'Média-alta — indústria diversificada' :
    eci > -0.5 ? 'Média — serviços e indústria básica' : 'Baixa — commodities e pouca diversificação';
  document.getElementById('resECI').innerHTML =
    `<strong>${c.name}</strong> ECI = <strong>${fmtNum(eci, 2)}</strong> · ${level}<br>
    Demanda TI: ${fmtNum(data[code]?.sector_tech, 0)}/100 · Salário médio: $${fmtNum(data[code]?.avg_salary, 0)}`;
}

function calcGiniInterp() {
  const code = document.getElementById('fGiniCountry').value;
  const g = data[code]?.gini;
  const c = getCountry(code);
  if (g == null) { document.getElementById('resGini').textContent = 'Sem dado Gini na API'; return; }
  const level = g < 30 ? 'Baixa desigualdade (modelo nórdico)' :
    g < 40 ? 'Desigualdade moderada (Europa continental)' :
    g < 50 ? 'Desigualdade significativa' : 'Desigualdade muito alta';
  document.getElementById('resGini').innerHTML =
    `<strong>${c.name}</strong> Gini = <strong>${fmtNum(g, 1)}</strong> · ${level}<br>
    Pobreza extrema: ${fmtNum(data[code]?.poverty)}% · IDH: ${fmtNum(data[code]?.hdi, 3)}`;
}

function calcFamilyEUScore(code) {
  const d = data[code] || {};
  const lang = LANG_EASE[code] || 30;
  const jobEase = 100 - (JOB_ENTRY[code] || 50);
  const costScore = Math.max(0, 100 - (d.cost_living || 50));
  const unempScore = Math.max(0, 100 - (d.unemployment || 5) * 8);
  return Math.round(
    lang * 0.22 + jobEase * 0.18 + costScore * 0.15 +
    (d.healthcare || 50) * 0.12 + unempScore * 0.10 +
    (d.safety || 50) * 0.08 + (d.hdi || 0.5) * 100 * 0.08 +
    (d.happiness || 5) * 10 * 0.07
  );
}

function familyTopText(top, reserve) {
  const res = fmtNum(reserve * 9 * 2 * 0.85, 0);
  if (top.c.code === 'PRT') return 'vocês falam a língua local, eliminando a maior barreira. Custo de vida 40–50% menor que Norte da Europa, saúde pública SNS, bom para formar família.';
  if (top.c.code === 'ESP') return 'espanhol é aprendido em 3–6 meses vindo do português. Economia maior, mais vagas. Custo moderado.';
  if (top.c.code === 'ITA') return 'italiano é próximo ao português (72/100 facilidade). Norte (Milão, Bolonha) tem mais emprego; Sul mais barato. SNS público excelente para família. Salários médios, vida cultural rica — boa opção com cidadania UE.';
  if (top.c.code === 'IRL') return 'inglês elimina barreira. Hub tech. Reserva ~$' + res + ' para 9 meses — custo alto.';
  return 'score ' + top.score + '/100 · idioma ' + fmtNum(top.lang, 0) + '/100 · reserva ~$' + res;
}

function renderFamilyProfile() {
  const europe = COUNTRIES.filter(c => c.region === 'europe' && c.code !== 'RUS' && c.code !== 'GBR');
  const ranked = europe.map(c => {
    const score = calcFamilyEUScore(c.code);
    const d = data[c.code] || {};
    return { c, score, d, lang: LANG_EASE[c.code], job: JOB_ENTRY[c.code], eng: ENGLISH_JOBS[c.code] || ENGLISH_JOBS.default };
  }).sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const top3 = ranked.slice(0, 3);
  const ita = ranked.find(x => x.c.code === 'ITA');
  const reserve = estMonthlyCost(top.c.code) + estRent(top.c.code);

  let html = '<div class="grid grid-3 stagger-children" style="margin-top:1rem">';
  top3.forEach((x, i) => {
    const rank = i === 0 ? '#1' : i === 1 ? '#2' : '#3';
    html += '<div class="card flag-card reloc-card"><h3>' + rank + ' ' + countryCell(x.c.code, 'md') + '</h3>';
    html += '<div class="kpi" style="font-size:1.4rem">' + x.score + '/100</div>';
    html += '<p style="font-size:.82rem;color:var(--muted);margin-top:.5rem">Idioma: ' + fmtNum(x.lang, 0) + '/100 · Emprego: ' + fmtNum(100 - x.job, 0) + '/100<br>';
    html += 'Custo: ' + fmtNum(x.d.cost_living, 0) + ' · Saúde: ' + fmtNum(x.d.healthcare, 0) + ' · Desemprego: ' + fmtNum(x.d.unemployment) + '%</p></div>';
  });
  html += '</div>';

  if (ita) {
    const itaRank = ranked.findIndex(x => x.c.code === 'ITA') + 1;
    html += '<div class="card" style="margin-top:1rem;border-left:3px solid var(--c-green)">';
    html += '<div class="compare-header">' + flagImg('ITA', 'lg') + '<h3>Itália — posição #' + itaRank + ' (score ' + ita.score + '/100)</h3></div>';
    html += '<p style="font-size:.88rem">IDH ' + fmtNum(ita.d.hdi, 3) + ' · Felicidade ' + fmtNum(ita.d.happiness, 2) + ' · Custo vida ' + fmtNum(ita.d.cost_living, 0) + ' · Salário médio $' + fmtNum(ita.d.avg_salary, 0);
    html += ' · Italiano aprendível em poucos meses para falantes de português. SNS universal. Bolsa família/Incentivi demografici para natalidade. Norte: emprego industrial/tech; Sul: custo menor.</p></div>';
  }

  html += '<div class="card" style="margin-top:1rem"><h3>Ranking completo — Europa (seu perfil)</h3><div class="table-wrap"><table><thead><tr>';
  html += '<th>#</th><th>País</th><th>Score</th><th>Idioma</th><th>Emprego</th><th>Inglês</th><th>Custo</th><th>Aluguel</th><th>Saúde</th><th>IDH</th><th>Reserva 9m</th></tr></thead><tbody>';
  ranked.forEach((x, i) => {
    html += '<tr data-family-code="' + x.c.code + '" id="family-row-' + x.c.code + '"><td>' + (i+1) + '</td><td>' + countryCell(x.c.code, 'sm', true) + '</td><td><strong>' + x.score + '</strong></td>';
    html += '<td>' + fmtNum(x.lang, 0) + '</td><td>' + fmtNum(100 - x.job, 0) + '</td><td>' + fmtNum(x.eng, 0) + '%</td>';
    html += '<td>' + fmtNum(x.d.cost_living, 0) + '</td><td>' + fmtNum(x.d.rent_index, 0) + '</td><td>' + fmtNum(x.d.healthcare, 0) + '</td>';
    html += '<td>' + fmtNum(x.d.hdi, 3) + '</td><td>$' + fmtNum((estMonthlyCost(x.c.code) + estRent(x.c.code)) * 9 * 2 * 0.85, 0) + '</td></tr>';
  });
  html += '</tbody></table></div></div>';

  html += '<div class="conclusion-block" style="margin-top:1rem"><h4>Recomendação</h4>';
  html += '<p style="font-size:.9rem"><strong>1º ' + top.c.name + '</strong> — ' + familyTopText(top, reserve) + '</p>';
  html += '<p style="font-size:.88rem;margin-top:.5rem"><strong>Estratégia:</strong> Reserva 9–12 meses → ' + top3.map(x => x.c.name).join(', ') + ' (ou Itália se preferirem cultura/medio custo) → validar diploma ENIC-NARIC → registro municipal UE. Veja o <strong>plano completo Itália</strong> na aba Guias País e organize tarefas na aba Planejamento.</p>';
  html += '<p style="font-size:.85rem;color:var(--muted);margin-top:.5rem"><strong>Evitar no início:</strong> Alemanha, Áustria, Suíça, França sem idioma local.</p></div>';

  const el = document.getElementById('familyProfileResult');
  if (el) el.innerHTML = html;
  const resEl = document.getElementById('resFamilyEU');
  if (resEl) resEl.innerHTML = 'Top 3: ' + top3.map(x => flagImg(x.c.code, 'xs') + ' ' + x.c.name + ' (' + x.score + ')').join(' · ');
  initCountrySearch('familySearch', null, focusFamilyCountryByCode);
}

function focusFamilyCountry() {
  const input = document.getElementById('familySearch');
  if (!input) return;
  const q = (input.value || '').trim().toLowerCase();
  const eu = COUNTRIES.filter(c => c.region === 'europe' && c.code !== 'RUS' && c.code !== 'GBR');
  const c = eu.find(x => x.name.toLowerCase() === q || x.code.toLowerCase() === q) ||
    eu.find(x => x.name.toLowerCase().includes(q));
  if (!c) return;
  focusFamilyCountryByCode(c.code);
}

function focusFamilyCountryByCode(code) {
  const el = document.getElementById('familyProfileResult');
  if (!el) return;
  const row = el.querySelector('[data-family-code="' + code + '"]');
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.style.outline = '2px solid var(--c-amber)';
    setTimeout(() => { row.style.outline = ''; }, 2500);
  }
  const c = getCountry(code);
  const d = data[code] || {};
  const score = calcFamilyEUScore(code);
  const banner = document.getElementById('familyCountryFocus');
  if (banner && c) {
    banner.innerHTML = '<div class="card" style="margin-top:1rem;border-left:3px solid var(--c-amber)">' +
      '<div class="compare-header">' + flagImg(code, 'lg') + '<h3>' + c.name + ' — score ' + score + '/100</h3></div>' +
      '<p class="muted-text" style="font-size:.85rem">Idioma ' + fmtNum(LANG_EASE[code] || 0, 0) + '/100 · Custo ' + fmtNum(d.cost_living, 0) +
      ' · Saúde ' + fmtNum(d.healthcare, 0) + ' · Reserva 9m $' + fmtNum((estMonthlyCost(code) + estRent(code)) * 9 * 2 * 0.85, 0) + '</p></div>';
  }
}

function runAllFormulas() {
  const run = (fn, id) => { if (document.getElementById(id)) try { fn(); } catch (e) { console.warn(fn.name, e); } };
  run(calcMisery, 'fMiseryCountry');
  run(calcTaylor, 'fTaylorInf');
  run(calcFisher, 'fFisherNom');
  run(calcPPP, 'fPPPSal');
  run(calcCAGR, 'fCAGRCountry');
  run(calcRule72, 'fRule72');
  run(calcCOLRatio, 'fCOLFrom');
  run(calcRealFlow, 'fFlowCountry');
  run(calcHousing, 'fHousingCountry');
  run(calcReserve, 'fReserveCountry');
  run(calcBreakEven, 'fBEFrom');
  run(calcECI, 'fECICountry');
  run(calcGiniInterp, 'fGiniCountry');
}
