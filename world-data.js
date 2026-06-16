/* WORLDPANEL — Dados embutidos + configuração de indicadores */

const COUNTRIES = [
  { code:'BRA', name:'Brasil', flag:'🇧🇷', region:'americas' },
  { code:'USA', name:'EUA', flag:'🇺🇸', region:'americas' },
  { code:'CAN', name:'Canadá', flag:'🇨🇦', region:'americas' },
  { code:'MEX', name:'México', flag:'🇲🇽', region:'americas' },
  { code:'ARG', name:'Argentina', flag:'🇦🇷', region:'americas' },
  { code:'COL', name:'Colômbia', flag:'🇨🇴', region:'americas' },
  { code:'CHL', name:'Chile', flag:'🇨🇱', region:'americas' },
  { code:'CHN', name:'China', flag:'🇨🇳', region:'asia' },
  { code:'IND', name:'Índia', flag:'🇮🇳', region:'asia' },
  { code:'JPN', name:'Japão', flag:'🇯🇵', region:'asia' },
  { code:'KOR', name:'Coreia do Sul', flag:'🇰🇷', region:'asia' },
  { code:'IDN', name:'Indonésia', flag:'🇮🇩', region:'asia' },
  { code:'TUR', name:'Turquia', flag:'🇹🇷', region:'asia' },
  { code:'SAU', name:'Arábia Saudita', flag:'🇸🇦', region:'asia' },
  { code:'DEU', name:'Alemanha', flag:'🇩🇪', region:'europe' },
  { code:'GBR', name:'Reino Unido', flag:'🇬🇧', region:'europe' },
  { code:'FRA', name:'França', flag:'🇫🇷', region:'europe' },
  { code:'ITA', name:'Itália', flag:'🇮🇹', region:'europe' },
  { code:'ESP', name:'Espanha', flag:'🇪🇸', region:'europe' },
  { code:'NLD', name:'Holanda', flag:'🇳🇱', region:'europe' },
  { code:'CHE', name:'Suíça', flag:'🇨🇭', region:'europe' },
  { code:'SWE', name:'Suécia', flag:'🇸🇪', region:'europe' },
  { code:'NOR', name:'Noruega', flag:'🇳🇴', region:'europe' },
  { code:'DNK', name:'Dinamarca', flag:'🇩🇰', region:'europe' },
  { code:'FIN', name:'Finlândia', flag:'🇫🇮', region:'europe' },
  { code:'POL', name:'Polônia', flag:'🇵🇱', region:'europe' },
  { code:'BEL', name:'Bélgica', flag:'🇧🇪', region:'europe' },
  { code:'AUT', name:'Áustria', flag:'🇦🇹', region:'europe' },
  { code:'PRT', name:'Portugal', flag:'🇵🇹', region:'europe' },
  { code:'GRC', name:'Grécia', flag:'🇬🇷', region:'europe' },
  { code:'CZE', name:'Rep. Tcheca', flag:'🇨🇿', region:'europe' },
  { code:'ROU', name:'Romênia', flag:'🇷🇴', region:'europe' },
  { code:'HUN', name:'Hungria', flag:'🇭🇺', region:'europe' },
  { code:'IRL', name:'Irlanda', flag:'🇮🇪', region:'europe' },
  { code:'ISL', name:'Islândia', flag:'🇮🇸', region:'europe' },
  { code:'LUX', name:'Luxemburgo', flag:'🇱🇺', region:'europe' },
  { code:'RUS', name:'Rússia', flag:'🇷🇺', region:'europe' },
  { code:'ZAF', name:'África do Sul', flag:'🇿🇦', region:'africa' },
  { code:'NGA', name:'Nigéria', flag:'🇳🇬', region:'africa' },
  { code:'EGY', name:'Egito', flag:'🇪🇬', region:'africa' },
  { code:'AUS', name:'Austrália', flag:'🇦🇺', region:'oceania' }
];

const ISO2 = {
  BRA:'br', USA:'us', CAN:'ca', MEX:'mx', ARG:'ar', COL:'co', CHL:'cl',
  CHN:'cn', IND:'in', JPN:'jp', KOR:'kr', IDN:'id', TUR:'tr', SAU:'sa',
  DEU:'de', GBR:'gb', FRA:'fr', ITA:'it', ESP:'es', NLD:'nl', CHE:'ch',
  SWE:'se', NOR:'no', DNK:'dk', FIN:'fi', POL:'pl', BEL:'be', AUT:'at',
  PRT:'pt', GRC:'gr', CZE:'cz', ROU:'ro', HUN:'hu', IRL:'ie', ISL:'is',
  LUX:'lu', RUS:'ru', ZAF:'za', NGA:'ng', EGY:'eg', AUS:'au'
};

const FLAG_SIZES = { xs: 20, sm: 24, md: 32, lg: 48, xl: 72 };
const FLAG_CDN_WIDTHS = [20, 40, 80, 160, 320, 640];

function flagCdnWidth(displayPx) {
  const need = Math.max(20, displayPx * 2);
  return FLAG_CDN_WIDTHS.find(w => w >= need) || 640;
}

function flagUrl(code, displayPx) {
  const iso = ISO2[code];
  if (!iso) return '';
  return 'https://flagcdn.com/w' + flagCdnWidth(displayPx) + '/' + iso + '.png';
}

function flagImg(code, size, extraClass) {
  size = size || 'sm';
  const px = FLAG_SIZES[size] || 24;
  const url = flagUrl(code, px);
  const c = COUNTRIES.find(x => x.code === code);
  if (!url) return c ? '<span class="flag-emoji">' + c.flag + '</span>' : '';
  const h = Math.round(px * 0.75);
  const cls = 'flag-img flag-' + size + (extraClass ? ' ' + extraClass : '');
  const fb = (c && c.flag) ? c.flag : '';
  return '<img src="' + url + '" alt="" class="' + cls + '" width="' + px + '" height="' + h + '" loading="lazy" decoding="async" data-fb="' + fb + '" onerror="flagImgError(this)">';
}

function flagImgError(img) {
  const fb = img.getAttribute('data-fb') || '';
  const span = document.createElement('span');
  span.className = 'flag-emoji';
  span.textContent = fb;
  img.replaceWith(span);
}

const COUNTRY_HERO = {
  BRA:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=900&q=80',
  USA:'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=900&q=80',
  CAN:'https://images.unsplash.com/photo-1519832979-6fa792d6c6e7?w=900&q=80',
  MEX:'https://images.unsplash.com/photo-1518659094540-e255662b8839?w=900&q=80',
  ARG:'https://images.unsplash.com/photo-1589904159514-35915486fe3b?w=900&q=80',
  COL:'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=900&q=80',
  CHL:'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=900&q=80',
  CHN:'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=900&q=80',
  IND:'https://images.unsplash.com/photo-1524492412937-280b9d5780ee?w=900&q=80',
  JPN:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80',
  KOR:'https://images.unsplash.com/photo-1517154429-7a7cbef7d6fe?w=900&q=80',
  IDN:'https://images.unsplash.com/photo-1537996194471-d29704c1e12f?w=900&q=80',
  TUR:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&q=80',
  SAU:'https://images.unsplash.com/photo-1586724376253-3b0ff3edca0b?w=900&q=80',
  DEU:'https://images.unsplash.com/photo-1467269206134-ffe3e5da6021?w=900&q=80',
  GBR:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80',
  FRA:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
  ITA:'https://images.unsplash.com/photo-1515542622106-jda3bb120186?w=900&q=80',
  ESP:'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80',
  NLD:'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=900&q=80',
  CHE:'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=900&q=80',
  SWE:'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=900&q=80',
  NOR:'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=900&q=80',
  DNK:'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=900&q=80',
  FIN:'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80',
  POL:'https://images.unsplash.com/photo-1519197924294-4d9a626816d4?w=900&q=80',
  BEL:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
  AUT:'https://images.unsplash.com/photo-1602821607744-3ec9f1a1b9a5?w=900&q=80',
  PRT:'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=80',
  GRC:'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49b?w=900&q=80',
  CZE:'https://images.unsplash.com/photo-1541849549859-65fe22357dfa?w=900&q=80',
  ROU:'https://images.unsplash.com/photo-1555992336-03a23c7b2208?w=900&q=80',
  HUN:'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80',
  IRL:'https://images.unsplash.com/photo-1543877365-2682945eda7f?w=900&q=80',
  ISL:'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=900&q=80',
  LUX:'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=900&q=80',
  RUS:'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=900&q=80',
  ZAF:'https://images.unsplash.com/photo-1580060839134-75a3bda8e6c6?w=900&q=80',
  NGA:'https://images.unsplash.com/photo-1580060839134-75a3bda8e6c6?w=900&q=80',
  EGY:'https://images.unsplash.com/photo-1572252009286-268ace302f63?w=900&q=80',
  AUS:'https://images.unsplash.com/photo-1523482585902-3977ab18fcb4?w=900&q=80'
};

function countryCell(code, size, strong) {
  size = size || 'sm';
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return code;
  const name = strong ? '<strong>' + c.name + '</strong>' : '<span>' + c.name + '</span>';
  return '<span class="country-cell">' + flagImg(code, size) + name + '</span>';
}

function countryHero(code, subtitle, compact) {
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return '';
  const bg = COUNTRY_HERO[code];
  const bgHtml = bg
    ? '<img class="hero-bg" src="' + bg + '" alt="" loading="lazy">'
    : '<div class="hero-bg hero-fallback"></div>';
  const sub = subtitle ? '<p class="hero-sub">' + subtitle + '</p>' : '';
  const cls = 'country-hero anim-in' + (compact ? ' country-hero-compact' : '');
  return '<div class="' + cls + '">' + bgHtml +
    '<div class="hero-overlay">' + flagImg(code, 'xl', 'hero-flag') +
    '<div class="hero-text"><h2>' + c.name + '</h2>' + sub + '</div></div></div>';
}

function countryTag(code, extra, tagClass) {
  const c = COUNTRIES.find(x => x.code === code);
  const label = extra != null ? extra : (c ? c.name : code);
  return '<span class="tag ' + (tagClass || 'neutral') + ' tag-flag">' + flagImg(code, 'xs') + label + '</span>';
}

function countrySelectLabel(code) {
  const c = COUNTRIES.find(x => x.code === code);
  return c ? c.name : code;
}

/* Alfabetização — WB só reporta em censos (~5-10 anos). Série UNESCO embutida. */
const LITERACY_HIST = {
  BRA: [{y:1970,v:61},{y:1980,v:74},{y:1991,v:81},{y:2000,v:86},{y:2010,v:90},{y:2015,v:92},{y:2018,v:93.2}],
  USA: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2019,v:99}],
  PRT: [{y:1970,v:68},{y:1981,v:78},{y:1991,v:88},{y:2001,v:93},{y:2011,v:95},{y:2018,v:96.1}],
  ITA: [{y:1970,v:87},{y:1981,v:96},{y:1991,v:97},{y:2001,v:98},{y:2011,v:99},{y:2018,v:99.2}],
  ESP: [{y:1970,v:87},{y:1981,v:94},{y:1991,v:96},{y:2001,v:97},{y:2011,v:98},{y:2018,v:98.4}],
  DEU: [{y:1970,v:98},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  FRA: [{y:1970,v:96},{y:1980,v:98},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  GBR: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  ARG: [{y:1970,v:90},{y:1980,v:93},{y:1991,v:95},{y:2001,v:97},{y:2010,v:98},{y:2018,v:99}],
  MEX: [{y:1970,v:76},{y:1980,v:83},{y:1990,v:88},{y:2000,v:91},{y:2010,v:94},{y:2018,v:95.4}],
  CHL: [{y:1970,v:81},{y:1982,v:91},{y:1992,v:94},{y:2002,v:96},{y:2012,v:96},{y:2018,v:96.4}],
  COL: [{y:1970,v:74},{y:1981,v:81},{y:1993,v:88},{y:2005,v:92},{y:2014,v:95},{y:2018,v:95.1}],
  IND: [{y:1970,v:34},{y:1981,v:44},{y:1991,v:52},{y:2001,v:61},{y:2011,v:69},{y:2018,v:74.4}],
  CHN: [{y:1970,v:30},{y:1982,v:65},{y:1990,v:78},{y:2000,v:87},{y:2010,v:94},{y:2018,v:96.8}],
  JPN: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  ZAF: [{y:1970,v:70},{y:1980,v:75},{y:1990,v:81},{y:2000,v:85},{y:2011,v:87},{y:2017,v:87}],
  NGA: [{y:1970,v:23},{y:1981,v:38},{y:1991,v:52},{y:2003,v:58},{y:2010,v:61},{y:2018,v:62}],
  POL: [{y:1970,v:93},{y:1980,v:96},{y:1990,v:98},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  RUS: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99.7}],
  IRL: [{y:1970,v:98},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  GRC: [{y:1970,v:78},{y:1981,v:89},{y:1991,v:93},{y:2001,v:96},{y:2011,v:97},{y:2018,v:97.9}],
  TUR: [{y:1970,v:54},{y:1980,v:73},{y:1990,v:82},{y:2000,v:87},{y:2010,v:94},{y:2018,v:96.7}],
  IDN: [{y:1970,v:60},{y:1980,v:78},{y:1990,v:84},{y:2000,v:90},{y:2010,v:94},{y:2018,v:96}],
  KOR: [{y:1970,v:88},{y:1980,v:93},{y:1990,v:96},{y:2000,v:97},{y:2010,v:98},{y:2018,v:97.9}],
  AUS: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  CAN: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  EGY: [{y:1970,v:26},{y:1986,v:44},{y:1996,v:55},{y:2006,v:66},{y:2013,v:71},{y:2017,v:71.2}],
  SAU: [{y:1970,v:15},{y:1980,v:47},{y:1990,v:70},{y:2000,v:84},{y:2010,v:92},{y:2017,v:95.3}],
  CHE: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  NLD: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  SWE: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  NOR: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  DNK: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  FIN: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  BEL: [{y:1970,v:96},{y:1980,v:98},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  AUT: [{y:1970,v:98},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  CZE: [{y:1970,v:96},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  HUN: [{y:1970,v:96},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  ROU: [{y:1970,v:94},{y:1980,v:96},{y:1990,v:97},{y:2000,v:97},{y:2010,v:98},{y:2018,v:98.8}],
  LUX: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}],
  ISL: [{y:1970,v:99},{y:1980,v:99},{y:1990,v:99},{y:2000,v:99},{y:2010,v:99},{y:2018,v:99}]
};

function mergeHistPoints(existing, extra) {
  const map = {};
  (existing || []).forEach(p => { map[p.year] = p.value; });
  (extra || []).forEach(p => {
    const y = p.year != null ? p.year : p.y;
    const v = p.value != null ? p.value : p.v;
    if (map[y] == null) map[y] = v;
  });
  return Object.keys(map).map(Number).sort((a, b) => a - b).map(y => ({ year: y, value: map[y] }));
}

function mergeEmbeddedHistory(histRef) {
  COUNTRIES.forEach(c => {
    if (!histRef[c.code]) histRef[c.code] = {};
    const lit = LITERACY_HIST[c.code];
    if (!lit) return;
    const cur = histRef[c.code].literacy || [];
    if (cur.length < 4) {
      histRef[c.code].literacy = mergeHistPoints(cur, lit.map(p => ({ year: p.y, value: p.v })));
    }
  });
}

function getHistSeries(code, indId) {
  const pts = (history[code] && history[code][indId]) || [];
  if (pts.length < 2) return pts;
  return [...pts].sort((a, b) => a.year - b.year);
}

function toggleCollapse(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('collapsed');
}

function countryHeroCompact(code, subtitle, collapseId) {
  const inner = countryHero(code, subtitle).replace('country-hero', 'country-hero country-hero-compact');
  const id = collapseId || 'heroCollapse';
  return '<div class="collapsible collapsed" id="' + id + '">' +
    '<button type="button" class="collapse-toggle" onclick="toggleCollapse(\'' + id + '\')">' +
    '<span class="collapse-icon">▾</span> Foto do país <span class="collapse-hint">clique para expandir</span></button>' +
    '<div class="collapse-body">' + inner + '</div></div>';
}

const CHART_PALETTE = ['#5b8fd4', '#3d9a6a', '#c9a227', '#c45c5c', '#9b7ec8', '#4db8a4', '#e07b53', '#8a8a8a'];
const CHART_LINE_DASHES = [[], [6, 4], [2, 3], [8, 4, 2, 4], [4, 4], [10, 5, 2, 5], [2, 6], [6, 6]];

function fuzzyCountryScore(query, country) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return 1;
  const name = country.name.toLowerCase();
  const code = country.code.toLowerCase();
  if (code === q) return 100;
  if (name === q) return 95;
  if (name.startsWith(q)) return 85;
  if (name.includes(q)) return 70;
  if (code.startsWith(q)) return 65;
  let qi = 0;
  for (let i = 0; i < name.length && qi < q.length; i++) {
    if (name[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 45 + (q.length / Math.max(name.length, 1)) * 25;
  return 0;
}

function searchCountries(query, limit, pool) {
  pool = pool || COUNTRIES;
  const q = (query || '').trim();
  if (!q) return pool.slice(0, limit || 8);
  return pool
    .map(c => ({ c, score: fuzzyCountryScore(q, c) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 8)
    .map(x => x.c);
}

function pickCountry(inputId, selectId, code, onPick) {
  const input = document.getElementById(inputId);
  const sel = selectId ? document.getElementById(selectId) : null;
  const c = getCountry(code);
  if (!c) return;
  if (sel) sel.value = c.code;
  if (input) input.value = c.name;
  const list = document.getElementById(inputId + 'Dropdown');
  if (list) list.classList.remove('open');
  if (onPick) onPick(c.code);
}

function initCountrySearch(inputId, selectId, onPick, opts) {
  opts = opts || {};
  const input = document.getElementById(inputId);
  const sel = selectId ? document.getElementById(selectId) : null;
  if (!input || input.dataset.bound) return;
  input.dataset.bound = '1';
  if (sel) sel.classList.add('visually-hidden');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  const pool = opts.pool || COUNTRIES;
  const listId = inputId + 'Dropdown';
  let list = document.getElementById(listId);
  if (!list) {
    list = document.createElement('div');
    list.id = listId;
    list.className = 'country-dropdown';
    list.setAttribute('role', 'listbox');
    input.parentNode.classList.add('country-combo-wrap');
    input.parentNode.appendChild(list);
  }
  input.setAttribute('aria-controls', listId);

  let activeIdx = -1;
  const renderList = (matches) => {
    if (!matches.length) {
      list.innerHTML = '<div class="country-dropdown-empty">Nenhum país encontrado</div>';
      list.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    list.innerHTML = matches.map((c, i) =>
      '<button type="button" class="country-dropdown-item' + (i === activeIdx ? ' active' : '') + '" role="option" data-code="' + c.code + '">' +
      flagImg(c.code, 'xs') + '<span>' + c.name + '</span><code>' + c.code + '</code></button>'
    ).join('');
    list.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
    list.querySelectorAll('.country-dropdown-item').forEach(btn => {
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        pickCountry(inputId, selectId, btn.dataset.code, onPick);
      });
    });
  };

  const syncFromSelect = () => {
    if (!sel || !sel.value) return;
    const c = getCountry(sel.value);
    if (c) input.value = c.name;
  };
  syncFromSelect();

  input.addEventListener('input', () => {
    activeIdx = -1;
    renderList(searchCountries(input.value, 8, pool));
  });
  input.addEventListener('focus', () => {
    activeIdx = -1;
    renderList(searchCountries(input.value, 8, pool));
  });
  input.addEventListener('blur', () => {
    setTimeout(() => {
      list.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      const q = (input.value || '').trim();
      const exact = COUNTRIES.find(x => x.name.toLowerCase() === q.toLowerCase() || x.code.toLowerCase() === q.toLowerCase());
      const match = exact || searchCountries(q, 1, pool)[0];
      if (match) pickCountry(inputId, selectId, match.code, onPick);
      else syncFromSelect();
    }, 150);
  });
  input.addEventListener('keydown', e => {
    const items = [...list.querySelectorAll('.country-dropdown-item')];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
      if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const code = activeIdx >= 0 && items[activeIdx]
        ? items[activeIdx].dataset.code
        : (searchCountries(input.value, 1, pool)[0] || {}).code;
      if (code) pickCountry(inputId, selectId, code, onPick);
    } else if (e.key === 'Escape') {
      list.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('click', e => {
    if (!input.parentNode.contains(e.target)) {
      list.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
    }
  });
}

const INDICATOR_CATS = {
  macro: { label:'Macroeconômico', ids:['gdp_pc','gdp_pc_ppp','gdp_growth','inflation','unemployment','population','exports','current_account','gov_debt'] },
  social: { label:'Social & Saúde', ids:['life_expectancy','gini','poverty','literacy','health_spend','edu_spend','internet','fertility'] },
  labor: { label:'Mercado de Trabalho', ids:['emp_services','emp_industry','emp_agriculture','avg_salary','min_wage'] },
  quality: { label:'Qualidade de Vida', ids:['hdi','happiness','cost_living','safety','rent_index','healthcare','qol_index','immigration'] },
  relocation: { label:'Mudança / Expat', ids:['salary_ppp','purchasing_power','sector_tech','sector_health','sector_finance','sector_construction','sector_hospitality','tax_burden','relocation_score'] }
};

const INDICATORS = [
  { id:'gdp_pc', wb:'NY.GDP.PCAP.CD', label:'PIB per Capita (USD)', cat:'macro', fmt:v=>'$'+fmtNum(v) },
  { id:'gdp_pc_ppp', wb:'NY.GDP.PCAP.PP.CD', label:'PIB pc PPP (USD)', cat:'macro', fmt:v=>'$'+fmtNum(v,0) },
  { id:'gdp_growth', wb:'NY.GDP.MKTP.KD.ZG', label:'Crescimento PIB (%)', cat:'macro', fmt:v=>fmtNum(v)+'%' },
  { id:'inflation', wb:'FP.CPI.TOTL.ZG', label:'Inflação (%)', cat:'macro', fmt:v=>fmtNum(v)+'%' },
  { id:'unemployment', wb:'SL.UEM.TOTL.ZS', label:'Desemprego (%)', cat:'macro', fmt:v=>fmtNum(v)+'%' },
  { id:'population', wb:'SP.POP.TOTL', label:'População', cat:'macro', fmt:v=>fmtNum(v,0) },
  { id:'exports', wb:'NE.EXP.GNFS.ZP.ZS', label:'Exportações (% PIB)', cat:'macro', fmt:v=>fmtNum(v)+'%' },
  { id:'current_account', wb:'BN.CAB.XOKA.GD.ZP', label:'Conta Corrente (% PIB)', cat:'macro', fmt:v=>fmtNum(v)+'%' },
  { id:'gov_debt', wb:'GC.DOD.TOTL.GD.ZS', label:'Dívida Gov. (% PIB)', cat:'macro', fmt:v=>fmtNum(v)+'%' },
  { id:'life_expectancy', wb:'SP.DYN.LE00.IN', label:'Expectativa de Vida (anos)', cat:'social', fmt:v=>fmtNum(v,1)+' anos' },
  { id:'gini', wb:'SI.POV.GINI', label:'Índice Gini', cat:'social', fmt:v=>fmtNum(v,1) },
  { id:'poverty', wb:'SI.POV.DDAY', label:'Pobreza ($2.15/dia %)', cat:'social', fmt:v=>fmtNum(v)+'%' },
  { id:'literacy', wb:'SE.ADT.LTRT.ZS', label:'Alfabetização (%)', cat:'social', fmt:v=>fmtNum(v)+'%' },
  { id:'health_spend', wb:'SH.XPD.CHEX.GD.ZS', label:'Gasto Saúde (% PIB)', cat:'social', fmt:v=>fmtNum(v)+'%' },
  { id:'edu_spend', wb:'SE.XPD.TOTL.GD.ZS', label:'Gasto Educação (% PIB)', cat:'social', fmt:v=>fmtNum(v)+'%' },
  { id:'internet', wb:'IT.NET.USER.ZS', label:'Usuários Internet (%)', cat:'social', fmt:v=>fmtNum(v)+'%' },
  { id:'fertility', wb:'SP.DYN.TFRT.IN', label:'Taxa Fertilidade', cat:'social', fmt:v=>fmtNum(v,2) },
  { id:'emp_services', wb:'SL.SRV.EMPL.ZS', label:'Emprego Serviços (%)', cat:'labor', fmt:v=>fmtNum(v)+'%' },
  { id:'emp_industry', wb:'SL.IND.EMPL.ZS', label:'Emprego Indústria (%)', cat:'labor', fmt:v=>fmtNum(v)+'%' },
  { id:'emp_agriculture', wb:'SL.AGR.EMPL.ZS', label:'Emprego Agricultura (%)', cat:'labor', fmt:v=>fmtNum(v)+'%' },
  { id:'avg_salary', label:'Salário Médio Líquido (USD/mês)', cat:'labor', embed:true, fmt:v=>'$'+fmtNum(v,0) },
  { id:'min_wage', label:'Salário Mínimo (USD/mês)', cat:'labor', embed:true, fmt:v=>'$'+fmtNum(v,0) },
  { id:'hdi', label:'IDH (PNUD)', cat:'quality', embed:true, fmt:v=>fmtNum(v,3) },
  { id:'happiness', label:'Índice Felicidade (ONU)', cat:'quality', embed:true, fmt:v=>fmtNum(v,2)+'/10' },
  { id:'cost_living', label:'Custo de Vida (NYC=100)', cat:'quality', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'safety', label:'Segurança (0-100)', cat:'quality', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'rent_index', label:'Índice Aluguel (NYC=100)', cat:'quality', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'healthcare', label:'Qualidade Saúde (0-100)', cat:'quality', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'qol_index', label:'Qualidade de Vida (0-100)', cat:'quality', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'immigration', label:'Facilidade Imigração (0-100)', cat:'quality', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'salary_ppp', label:'Salário Ajustado PPP', cat:'relocation', computed:true, fmt:v=>'$'+fmtNum(v,0) },
  { id:'purchasing_power', label:'Poder de Compra Relativo', cat:'relocation', computed:true, fmt:v=>fmtNum(v)+'%' },
  { id:'sector_tech', label:'Demanda TI (0-100)', cat:'relocation', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'sector_health', label:'Demanda Saúde (0-100)', cat:'relocation', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'sector_finance', label:'Demanda Finanças (0-100)', cat:'relocation', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'sector_construction', label:'Demanda Construção (0-100)', cat:'relocation', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'sector_hospitality', label:'Demanda Turismo (0-100)', cat:'relocation', embed:true, fmt:v=>fmtNum(v,0) },
  { id:'tax_burden', label:'Carga Tributária (%)', cat:'relocation', embed:true, fmt:v=>fmtNum(v)+'%' },
  { id:'relocation_score', label:'Score Mudança (0-100)', cat:'relocation', computed:true, fmt:v=>fmtNum(v,0) },
  { id:'eci', label:'ECI Complexidade', cat:'macro', embed:true, fmt:v=>fmtNum(v,2) }
];

const ECI_DATA = { BRA:-0.35,USA:1.56,CHN:0.89,IND:-0.42,DEU:2.19,GBR:1.42,FRA:1.58,JPN:2.12,MEX:1.08,ARG:-0.12,CAN:0.78,AUS:0.45,ZAF:0.02,NGA:-1.55,EGY:-0.68,RUS:-0.22,KOR:1.85,IDN:-0.58,TUR:0.31,SAU:-1.12,ITA:1.21,ESP:1.05,COL:-0.28,CHL:0.12,NLD:1.72,CHE:2.05,SWE:1.45,NOR:0.88,DNK:1.12,FIN:1.28,POL:0.62,BEL:1.35,AUT:1.48,PRT:0.95,GRC:0.42,CZE:1.55,ROU:0.88,HUN:1.02,IRL:1.38,ISL:0.55,LUX:1.65 };

const PPP_FACTOR = { BRA:0.55,USA:1.0,CHN:0.58,IND:0.28,DEU:0.82,GBR:0.75,FRA:0.78,JPN:0.72,MEX:0.48,ARG:0.42,CAN:0.85,AUS:0.80,ZAF:0.38,NGA:0.25,EGY:0.22,RUS:0.45,KOR:0.68,IDN:0.32,TUR:0.40,SAU:0.55,ITA:0.72,ESP:0.70,COL:0.38,CHL:0.52,NLD:0.88,CHE:1.12,SWE:0.85,NOR:0.95,DNK:0.90,FIN:0.82,POL:0.52,BEL:0.80,AUT:0.78,PRT:0.62,GRC:0.58,CZE:0.58,ROU:0.42,HUN:0.48,IRL:0.82,ISL:0.92,LUX:0.95 };

/* Facilidade de idioma para falante de português com domínio baixo (0-100) */
const LANG_EASE = {
  PRT:100,ESP:85,ITA:72,IRL:95,GBR:95,LUX:78,GRC:58,FRA:42,BEL:52,NLD:58,
  DEU:28,AUT:32,POL:38,CZE:40,HUN:35,ROU:32,SWE:55,DNK:58,FIN:52,NOR:55,
  CHE:38,BRA:100,USA:70,CAN:72,MEX:90,ARG:100,COL:88,CHL:82,CHN:15,IND:25,
  JPN:12,KOR:20,IDN:30,TUR:25,SAU:20,RUS:22,ZAF:55,NGA:40,EGY:30,AUS:75
};

/* Barreira de entrada no emprego sem fluência no idioma local (0=fácil, 100=muito difícil) */
const JOB_ENTRY = {
  PRT:18,ESP:30,ITA:48,IRL:15,GBR:18,LUX:35,GRC:52,FRA:58,BEL:50,NLD:38,
  DEU:68,AUT:62,POL:42,CZE:40,HUN:48,ROU:45,SWE:55,DNK:52,FIN:55,NOR:50,
  CHE:65,BRA:25,USA:35,CAN:38,MEX:40,ARG:35,COL:45,CHL:42,CHN:70,IND:55,
  JPN:75,KOR:72,IDN:50,TUR:55,SAU:60,RUS:50,ZAF:45,NGA:50,EGY:55,AUS:30
};

/* % estimado de vagas acessíveis só com inglês */
const ENGLISH_JOBS = {
  IRL:88,GBR:90,NLD:72,SWE:68,DNK:70,FIN:65,NOR:68,DEU:45,AUT:42,BEL:55,
  LUX:75,PRT:35,ESP:30,ITA:28,FRA:25,GRC:40,POL:50,CZE:48,HUN:42,ROU:38,
  CHE:55,USA:85,CAN:80,AUS:82,BRA:15,default:25
};

/* Dados embutidos — fallback + IDH/Felicidade/Custo de Vida (PNUD, ONU, compilado 2023/24) */
const EMBEDDED = {
  BRA:{gdp_pc:8917,gdp_pc_ppp:19200,gdp_growth:2.9,inflation:4.6,unemployment:7.8,population:216400000,exports:16.2,current_account:-2.1,gov_debt:88.8,life_expectancy:75.9,gini:51.6,poverty:8.7,literacy:93.2,health_spend:10.0,edu_spend:6.2,internet:84,fertility:1.64,emp_services:62,emp_industry:21,emp_agriculture:9,avg_salary:850,min_wage:280,hdi:0.765,happiness:5.76,cost_living:32,safety:43,rent_index:12,healthcare:55,qol_index:48,immigration:62,tax_burden:33,sector_tech:65,sector_health:70,sector_finance:55,sector_construction:60,sector_hospitality:55 },
  USA:{gdp_pc:76329,gdp_pc_ppp:76329,gdp_growth:2.5,inflation:3.4,unemployment:3.7,population:334900000,exports:11.0,current_account:-3.0,gov_debt:122.3,life_expectancy:78.4,gini:41.5,poverty:1.2,literacy:99,health_spend:16.7,edu_spend:5.0,internet:92,fertility:1.66,emp_services:79,emp_industry:19,emp_agriculture:1,avg_salary:4200,min_wage:1160,hdi:0.921,happiness:6.89,cost_living:74,safety:62,rent_index:58,healthcare:72,qol_index:68,immigration:55,tax_burden:28,sector_tech:95,sector_health:80,sector_finance:90,sector_construction:70,sector_hospitality:65 },
  CHN:{gdp_pc:12556,gdp_pc_ppp:23309,gdp_growth:5.2,inflation:0.2,unemployment:5.1,population:1412000000,exports:19.8,current_account:1.5,gov_debt:77.1,life_expectancy:78.2,gini:38.2,poverty:0.1,literacy:96.8,health_spend:5.4,edu_spend:3.6,internet:73,fertility:1.09,emp_services:48,emp_industry:28,emp_agriculture:23,avg_salary:1200,min_wage:380,hdi:0.788,happiness:5.82,cost_living:38,safety:72,rent_index:22,healthcare:58,qol_index:52,immigration:40,tax_burden:18,sector_tech:88,sector_health:75,sector_finance:70,sector_construction:85,sector_hospitality:60 },
  IND:{gdp_pc:2389,gdp_pc_ppp:9045,gdp_growth:7.2,inflation:5.4,unemployment:7.8,population:1428000000,exports:21.5,current_account:-1.2,gov_debt:83.4,life_expectancy:72.0,gini:35.7,poverty:12.9,literacy:74.4,health_spend:3.0,edu_spend:4.4,internet:55,fertility:2.00,emp_services:32,emp_industry:25,emp_agriculture:42,avg_salary:450,min_wage:70,hdi:0.644,happiness:4.05,cost_living:22,safety:55,rent_index:8,healthcare:42,qol_index:35,immigration:48,tax_burden:25,sector_tech:82,sector_health:65,sector_finance:60,sector_construction:75,sector_hospitality:50 },
  DEU:{gdp_pc:48756,gdp_pc_ppp:60800,gdp_growth:0.1,inflation:5.9,unemployment:3.0,population:83200000,exports:47.0,current_account:6.1,gov_debt:66.1,life_expectancy:81.3,gini:31.9,poverty:0.1,literacy:99,health_spend:11.7,edu_spend:4.7,internet:93,fertility:1.53,emp_services:72,emp_industry:24,emp_agriculture:2,avg_salary:3200,min_wage:1920,hdi:0.942,happiness:7.03,cost_living:68,safety:78,rent_index:35,healthcare:82,qol_index:82,immigration:72,tax_burden:39,sector_tech:78,sector_health:80,sector_finance:75,sector_construction:65,sector_hospitality:60 },
  GBR:{gdp_pc:46125,gdp_pc_ppp:52300,gdp_growth:0.5,inflation:7.3,unemployment:4.2,population:67700000,exports:30.5,current_account:-3.5,gov_debt:101.9,life_expectancy:81.3,gini:35.1,poverty:0.2,literacy:99,health_spend:10.2,edu_spend:5.4,internet:96,fertility:1.56,emp_services:81,emp_industry:14,emp_agriculture:1,avg_salary:3100,min_wage:1780,hdi:0.940,happiness:6.75,cost_living:72,safety:68,rent_index:52,healthcare:78,qol_index:75,immigration:65,tax_burden:33,sector_tech:85,sector_health:78,sector_finance:92,sector_construction:60,sector_hospitality:72 },
  FRA:{gdp_pc:44460,gdp_pc_ppp:54800,gdp_growth:0.9,inflation:5.7,unemployment:7.3,population:68000000,exports:30.1,current_account:-0.8,gov_debt:111.8,life_expectancy:82.7,gini:31.6,poverty:0.1,literacy:99,health_spend:11.3,edu_spend:5.5,internet:86,fertility:1.79,emp_services:77,emp_industry:18,emp_agriculture:3,avg_salary:2800,min_wage:1680,hdi:0.903,happiness:6.66,cost_living:70,safety:72,rent_index:32,healthcare:80,qol_index:78,immigration:68,tax_burden:45,sector_tech:72,sector_health:82,sector_finance:70,sector_construction:58,sector_hospitality:75 },
  JPN:{gdp_pc:33836,gdp_pc_ppp:45200,gdp_growth:1.9,inflation:3.2,unemployment:2.6,population:125700000,exports:18.5,current_account:3.5,gov_debt:261.3,life_expectancy:84.5,gini:32.9,poverty:0.4,literacy:99,health_spend:10.9,edu_spend:3.5,internet:93,fertility:1.26,emp_services:72,emp_industry:24,emp_agriculture:3,avg_salary:2800,min_wage:1100,hdi:0.920,happiness:6.13,cost_living:58,safety:82,rent_index:28,healthcare:85,qol_index:80,immigration:42,tax_burden:32,sector_tech:80,sector_health:85,sector_finance:65,sector_construction:55,sector_hospitality:65 },
  MEX:{gdp_pc:11496,gdp_pc_ppp:21300,gdp_growth:3.1,inflation:5.5,unemployment:2.8,population:128900000,exports:38.5,current_account:-0.5,gov_debt:54.3,life_expectancy:75.0,gini:45.4,poverty:4.5,literacy:95.4,health_spend:5.4,edu_spend:4.3,internet:76,fertility:1.87,emp_services:62,emp_industry:24,emp_agriculture:12,avg_salary:750,min_wage:320,hdi:0.781,happiness:6.68,cost_living:35,safety:38,rent_index:14,healthcare:52,qol_index:45,immigration:58,tax_burden:22,sector_tech:55,sector_health:60,sector_finance:50,sector_construction:65,sector_hospitality:70 },
  ARG:{gdp_pc:13651,gdp_pc_ppp:26800,gdp_growth:-1.6,inflation:133.0,unemployment:6.9,population:46200000,exports:15.2,current_account:-1.8,gov_debt:88.0,life_expectancy:76.5,gini:42.9,poverty:5.0,literacy:99,health_spend:9.5,edu_spend:5.5,internet:87,fertility:1.87,emp_services:68,emp_industry:20,emp_agriculture:6,avg_salary:550,min_wage:280,hdi:0.849,happiness:5.97,cost_living:32,safety:45,rent_index:12,healthcare:60,qol_index:52,immigration:55,tax_burden:30,sector_tech:50,sector_health:62,sector_finance:48,sector_construction:55,sector_hospitality:58 },
  CAN:{gdp_pc:53247,gdp_pc_ppp:58200,gdp_growth:1.1,inflation:3.9,unemployment:5.4,population:40100000,exports:31.2,current_account:-0.6,gov_debt:106.8,life_expectancy:82.6,gini:33.3,poverty:0.2,literacy:99,health_spend:10.8,edu_spend:5.3,internet:94,fertility:1.40,emp_services:79,emp_industry:18,emp_agriculture:2,avg_salary:3500,min_wage:1780,hdi:0.936,happiness:7.03,cost_living:68,safety:75,rent_index:42,healthcare:78,qol_index:80,immigration:88,tax_burden:26,sector_tech:75,sector_health:78,sector_finance:72,sector_construction:68,sector_hospitality:62 },
  AUS:{gdp_pc:64460,gdp_pc_ppp:68200,gdp_growth:2.0,inflation:5.6,unemployment:3.7,population:26600000,exports:24.8,current_account:0.8,gov_debt:57.8,life_expectancy:83.4,gini:34.4,poverty:0.2,literacy:99,health_spend:9.9,edu_spend:5.1,internet:97,fertility:1.58,emp_services:78,emp_industry:18,emp_agriculture:3,avg_salary:3800,min_wage:1950,hdi:0.946,happiness:7.06,cost_living:72,safety:78,rent_index:45,healthcare:80,qol_index:82,immigration:85,tax_burden:28,sector_tech:72,sector_health:75,sector_finance:78,sector_construction:70,sector_hospitality:68 },
  ZAF:{gdp_pc:6776,gdp_pc_ppp:15400,gdp_growth:0.6,inflation:5.9,unemployment:32.9,population:60400000,exports:31.5,current_account:-1.5,gov_debt:73.6,life_expectancy:65.3,gini:63.0,poverty:27.7,literacy:87,health_spend:8.1,edu_spend:6.2,internet:72,fertility:2.33,emp_services:72,emp_industry:18,emp_agriculture:5,avg_salary:650,min_wage:250,hdi:0.717,happiness:5.42,cost_living:38,safety:28,rent_index:14,healthcare:45,qol_index:38,immigration:52,tax_burden:28,sector_tech:55,sector_health:58,sector_finance:60,sector_construction:52,sector_hospitality:55 },
  NGA:{gdp_pc:2184,gdp_pc_ppp:5800,gdp_growth:2.9,inflation:24.5,unemployment:4.1,population:223800000,exports:12.8,current_account:1.2,gov_debt:37.2,life_expectancy:55.0,gini:35.1,poverty:37.5,literacy:62,health_spend:3.3,edu_spend:0.9,internet:55,fertility:4.62,emp_services:48,emp_industry:12,emp_agriculture:35,avg_salary:200,min_wage:75,hdi:0.555,happiness:4.88,cost_living:28,safety:32,rent_index:8,healthcare:32,qol_index:25,immigration:45,tax_burden:18,sector_tech:45,sector_health:40,sector_finance:42,sector_construction:50,sector_hospitality:35 },
  EGY:{gdp_pc:4295,gdp_pc_ppp:15800,gdp_growth:3.8,inflation:33.9,unemployment:7.0,population:112700000,exports:18.5,current_account:-2.8,gov_debt:92.7,life_expectancy:72.0,gini:31.5,poverty:3.0,literacy:71.2,health_spend:4.5,edu_spend:2.6,internet:72,fertility:2.85,emp_services:52,emp_industry:28,emp_agriculture:18,avg_salary:180,min_wage:120,hdi:0.728,happiness:4.35,cost_living:22,safety:48,rent_index:6,healthcare:38,qol_index:32,immigration:38,tax_burden:15,sector_tech:40,sector_health:45,sector_finance:38,sector_construction:55,sector_hospitality:50 },
  RUS:{gdp_pc:15345,gdp_pc_ppp:38200,gdp_growth:3.6,inflation:7.4,unemployment:3.2,population:144400000,exports:28.5,current_account:2.8,gov_debt:18.9,life_expectancy:73.2,gini:37.5,poverty:0.1,literacy:99.7,health_spend:5.7,edu_spend:3.8,internet:88,fertility:1.50,emp_services:65,emp_industry:27,emp_agriculture:7,avg_salary:750,min_wage:200,hdi:0.821,happiness:5.78,cost_living:35,safety:55,rent_index:15,healthcare:55,qol_index:48,immigration:35,tax_burden:20,sector_tech:60,sector_health:62,sector_finance:55,sector_construction:58,sector_hospitality:48 },
  KOR:{gdp_pc:33121,gdp_pc_ppp:52800,gdp_growth:1.4,inflation:3.6,unemployment:2.7,population:51700000,exports:44.5,current_account:4.8,gov_debt:51.3,life_expectancy:83.6,gini:31.6,poverty:0.1,literacy:97.9,health_spend:8.4,edu_spend:4.5,internet:97,fertility:0.72,emp_services:70,emp_industry:25,emp_agriculture:5,avg_salary:2600,min_wage:1450,hdi:0.929,happiness:5.97,cost_living:62,safety:80,rent_index:28,healthcare:82,qol_index:78,immigration:48,tax_burden:26,sector_tech:92,sector_health:78,sector_finance:72,sector_construction:60,sector_hospitality:55 },
  IDN:{gdp_pc:4788,gdp_pc_ppp:15800,gdp_growth:5.0,inflation:3.7,unemployment:5.3,population:277500000,exports:21.2,current_account:-0.3,gov_debt:39.8,life_expectancy:71.7,gini:38.2,poverty:2.5,literacy:96,health_spend:3.4,edu_spend:2.8,internet:73,fertility:2.18,emp_services:44,emp_industry:22,emp_agriculture:29,avg_salary:350,min_wage:180,hdi:0.713,happiness:5.37,cost_living:28,safety:58,rent_index:10,healthcare:45,qol_index:40,immigration:50,tax_burden:12,sector_tech:55,sector_health:50,sector_finance:48,sector_construction:62,sector_hospitality:65 },
  TUR:{gdp_pc:10676,gdp_pc_ppp:35800,gdp_growth:4.5,inflation:64.8,unemployment:9.4,population:85300000,exports:28.8,current_account:-4.5,gov_debt:34.5,life_expectancy:78.0,gini:41.9,poverty:0.3,literacy:96.7,health_spend:4.3,edu_spend:2.8,internet:86,fertility:1.88,emp_services:55,emp_industry:27,emp_agriculture:17,avg_salary:550,min_wage:480,hdi:0.838,happiness:4.98,cost_living:32,safety:52,rent_index:14,healthcare:52,qol_index:45,immigration:55,tax_burden:25,sector_tech:52,sector_health:55,sector_finance:50,sector_construction:68,sector_hospitality:72 },
  SAU:{gdp_pc:32578,gdp_pc_ppp:54800,gdp_growth:-0.8,inflation:2.3,unemployment:5.8,population:36900000,exports:35.2,current_account:5.5,gov_debt:26.2,life_expectancy:78.3,gini:32.4,poverty:0.1,literacy:95.3,health_spend:6.3,edu_spend:5.9,internet:98,fertility:2.28,emp_services:58,emp_industry:32,emp_agriculture:6,avg_salary:2200,min_wage:800,hdi:0.875,happiness:6.38,cost_living:48,safety:72,rent_index:22,healthcare:62,qol_index:58,immigration:45,tax_burden:5,sector_tech:55,sector_health:60,sector_finance:65,sector_construction:75,sector_hospitality:45 },
  ITA:{gdp_pc:34776,gdp_pc_ppp:48200,gdp_growth:0.7,inflation:5.9,unemployment:7.6,population:58900000,exports:31.8,current_account:0.5,gov_debt:144.4,life_expectancy:83.4,gini:35.9,poverty:0.1,literacy:99.2,health_spend:8.7,edu_spend:4.2,internet:87,fertility:1.24,emp_services:70,emp_industry:24,emp_agriculture:4,avg_salary:2200,min_wage:1100,hdi:0.906,happiness:6.58,cost_living:65,safety:72,rent_index:28,healthcare:78,qol_index:75,immigration:62,tax_burden:42,sector_tech:62,sector_health:75,sector_finance:68,sector_construction:55,sector_hospitality:78 },
  ESP:{gdp_pc:30103,gdp_pc_ppp:45800,gdp_growth:2.5,inflation:3.5,unemployment:12.2,population:47800000,exports:33.5,current_account:0.9,gov_debt:113.2,life_expectancy:83.8,gini:34.7,poverty:0.1,literacy:98.4,health_spend:9.0,edu_spend:4.3,internet:94,fertility:1.19,emp_services:74,emp_industry:18,emp_agriculture:4,avg_salary:1800,min_wage:950,hdi:0.911,happiness:6.40,cost_living:52,safety:75,rent_index:22,healthcare:78,qol_index:72,immigration:70,tax_burden:35,sector_tech:58,sector_health:72,sector_finance:62,sector_construction:52,sector_hospitality:82 },
  COL:{gdp_pc:6624,gdp_pc_ppp:19200,gdp_growth:0.6,inflation:11.7,unemployment:10.2,population:52000000,exports:17.5,current_account:-2.5,gov_debt:58.6,life_expectancy:77.3,gini:54.8,poverty:6.5,literacy:95.1,health_spend:7.5,edu_spend:4.5,internet:73,fertility:1.75,emp_services:62,emp_industry:20,emp_agriculture:16,avg_salary:450,min_wage:280,hdi:0.758,happiness:5.87,cost_living:28,safety:42,rent_index:10,healthcare:52,qol_index:42,immigration:55,tax_burden:20,sector_tech:48,sector_health:55,sector_finance:45,sector_construction:58,sector_hospitality:60 },
  CHL:{gdp_pc:16709,gdp_pc_ppp:28200,gdp_growth:0.2,inflation:4.1,unemployment:8.7,population:19600000,exports:31.0,current_account:-3.8,gov_debt:38.1,life_expectancy:80.2,gini:44.8,poverty:0.6,literacy:96.4,health_spend:8.5,edu_spend:5.4,internet:92,fertility:1.52,emp_services:68,emp_industry:22,emp_agriculture:9,avg_salary:750,min_wage:480,hdi:0.860,happiness:6.17,cost_living:42,safety:55,rent_index:16,healthcare:65,qol_index:58,immigration:60,tax_burden:22,sector_tech:52,sector_health:60,sector_finance:55,sector_construction:55,sector_hospitality:58 },
  NLD:{gdp_pc:53106,gdp_pc_ppp:68200,gdp_growth:0.2,inflation:4.1,unemployment:3.5,population:17800000,exports:83.0,current_account:8.5,gov_debt:46.5,life_expectancy:82.4,gini:26.6,poverty:0.1,literacy:99,health_spend:10.1,edu_spend:5.3,internet:96,fertility:1.57,emp_services:82,emp_industry:15,emp_agriculture:2,avg_salary:3400,min_wage:1980,hdi:0.946,happiness:7.32,cost_living:72,safety:75,rent_index:48,healthcare:80,qol_index:85,immigration:78,tax_burden:37,sector_tech:82,sector_health:78,sector_finance:88,sector_construction:62,sector_hospitality:65 },
  CHE:{gdp_pc:91932,gdp_pc_ppp:78000,gdp_growth:0.8,inflation:2.1,unemployment:2.0,population:8800000,exports:66.0,current_account:8.2,gov_debt:41.0,life_expectancy:84.0,gini:33.1,poverty:0.1,literacy:99,health_spend:11.8,edu_spend:5.1,internet:97,fertility:1.46,emp_services:76,emp_industry:20,emp_agriculture:3,avg_salary:5800,min_wage:0,hdi:0.967,happiness:7.06,cost_living:98,safety:85,rent_index:55,healthcare:88,qol_index:92,immigration:72,tax_burden:28,sector_tech:85,sector_health:82,sector_finance:95,sector_construction:58,sector_hospitality:68 },
  SWE:{gdp_pc:56424,gdp_pc_ppp:58200,gdp_growth:-0.2,inflation:8.5,unemployment:7.5,population:10500000,exports:48.0,current_account:4.2,gov_debt:33.9,life_expectancy:83.2,gini:28.8,poverty:0.1,literacy:99,health_spend:10.8,edu_spend:7.2,internet:98,fertility:1.67,emp_services:78,emp_industry:18,emp_agriculture:2,avg_salary:3600,min_wage:0,hdi:0.947,happiness:7.34,cost_living:68,safety:78,rent_index:32,healthcare:82,qol_index:88,immigration:80,tax_burden:42,sector_tech:78,sector_health:80,sector_finance:72,sector_construction:55,sector_hospitality:58 },
  NOR:{gdp_pc:87992,gdp_pc_ppp:78000,gdp_growth:0.5,inflation:5.5,unemployment:3.5,population:5500000,exports:42.0,current_account:15.0,gov_debt:45.0,life_expectancy:83.8,gini:27.7,poverty:0.1,literacy:99,health_spend:10.5,edu_spend:6.8,internet:99,fertility:1.53,emp_services:75,emp_industry:18,emp_agriculture:2,avg_salary:4500,min_wage:0,hdi:0.966,happiness:7.55,cost_living:88,safety:88,rent_index:38,healthcare:85,qol_index:90,immigration:75,tax_burden:35,sector_tech:72,sector_health:78,sector_finance:75,sector_construction:62,sector_hospitality:55 },
  DNK:{gdp_pc:68388,gdp_pc_ppp:65800,gdp_growth:1.8,inflation:3.7,unemployment:5.0,population:5900000,exports:55.0,current_account:8.5,gov_debt:29.8,life_expectancy:81.9,gini:28.2,poverty:0.1,literacy:99,health_spend:10.3,edu_spend:6.4,internet:98,fertility:1.72,emp_services:79,emp_industry:17,emp_agriculture:2,avg_salary:3800,min_wage:0,hdi:0.948,happiness:7.58,cost_living:78,safety:82,rent_index:35,healthcare:82,qol_index:88,immigration:78,tax_burden:45,sector_tech:75,sector_health:78,sector_finance:80,sector_construction:58,sector_hospitality:60 },
  FIN:{gdp_pc:53654,gdp_pc_ppp:58200,gdp_growth:-1.0,inflation:4.3,unemployment:7.2,population:5600000,exports:38.0,current_account:-1.5,gov_debt:76.5,life_expectancy:82.1,gini:27.3,poverty:0.1,literacy:99,health_spend:9.4,edu_spend:6.8,internet:97,fertility:1.32,emp_services:72,emp_industry:22,emp_agriculture:4,avg_salary:3200,min_wage:0,hdi:0.941,happiness:7.74,cost_living:68,safety:85,rent_index:28,healthcare:80,qol_index:88,immigration:72,tax_burden:42,sector_tech:82,sector_health:78,sector_finance:68,sector_construction:52,sector_hospitality:52 },
  POL:{gdp_pc:18688,gdp_pc_ppp:41200,gdp_growth:2.7,inflation:11.4,unemployment:2.8,population:36700000,exports:57.0,current_account:-0.5,gov_debt:49.5,life_expectancy:78.5,gini:29.8,poverty:0.1,literacy:99,health_spend:6.5,edu_spend:4.7,internet:88,fertility:1.38,emp_services:58,emp_industry:30,emp_agriculture:10,avg_salary:1200,min_wage:650,hdi:0.881,happiness:6.17,cost_living:42,safety:72,rent_index:18,healthcare:62,qol_index:62,immigration:65,tax_burden:32,sector_tech:65,sector_health:62,sector_finance:55,sector_construction:72,sector_hospitality:58 },
  BEL:{gdp_pc:50559,gdp_pc_ppp:60200,gdp_growth:1.0,inflation:4.3,unemployment:5.5,population:11700000,exports:82.0,current_account:-0.5,gov_debt:105.0,life_expectancy:81.7,gini:27.2,poverty:0.1,literacy:99,health_spend:10.5,edu_spend:6.2,internet:93,fertility:1.55,emp_services:78,emp_industry:18,emp_agriculture:1,avg_salary:2900,min_wage:1850,hdi:0.942,happiness:6.80,cost_living:68,safety:68,rent_index:32,healthcare:78,qol_index:78,immigration:70,tax_burden:42,sector_tech:72,sector_health:75,sector_finance:78,sector_construction:58,sector_hospitality:62 },
  AUT:{gdp_pc:53638,gdp_pc_ppp:62200,gdp_growth:-0.7,inflation:7.8,unemployment:5.2,population:9100000,exports:54.0,current_account:1.5,gov_debt:78.5,life_expectancy:81.8,gini:30.8,poverty:0.1,literacy:99,health_spend:10.4,edu_spend:5.2,internet:93,fertility:1.46,emp_services:70,emp_industry:25,emp_agriculture:3,avg_salary:2800,min_wage:0,hdi:0.926,happiness:7.10,cost_living:68,safety:82,rent_index:30,healthcare:82,qol_index:82,immigration:68,tax_burden:40,sector_tech:68,sector_health:78,sector_finance:72,sector_construction:60,sector_hospitality:72 },
  PRT:{gdp_pc:24567,gdp_pc_ppp:38200,gdp_growth:2.3,inflation:5.3,unemployment:6.5,population:10300000,exports:42.0,current_account:0.5,gov_debt:99.8,life_expectancy:81.9,gini:33.7,poverty:0.2,literacy:96.1,health_spend:10.1,edu_spend:5.0,internet:88,fertility:1.38,emp_services:68,emp_industry:22,emp_agriculture:8,avg_salary:1200,min_wage:820,hdi:0.866,happiness:5.90,cost_living:48,safety:72,rent_index:22,healthcare:72,qol_index:68,immigration:75,tax_burden:35,sector_tech:55,sector_health:68,sector_finance:58,sector_construction:52,sector_hospitality:75 },
  GRC:{gdp_pc:22200,gdp_pc_ppp:35200,gdp_growth:2.0,inflation:4.2,unemployment:10.8,population:10400000,exports:38.0,current_account:-5.5,gov_debt:161.9,life_expectancy:81.0,gini:32.9,poverty:0.2,literacy:97.9,health_spend:7.8,edu_spend:3.9,internet:87,fertility:1.32,emp_services:72,emp_industry:15,emp_agriculture:11,avg_salary:1100,min_wage:780,hdi:0.888,happiness:5.93,cost_living:52,safety:68,rent_index:16,healthcare:65,qol_index:62,immigration:62,tax_burden:38,sector_tech:48,sector_health:62,sector_finance:52,sector_construction:48,sector_hospitality:78 },
  CZE:{gdp_pc:27200,gdp_pc_ppp:45200,gdp_growth:1.0,inflation:10.7,unemployment:2.6,population:10800000,exports:72.0,current_account:1.2,gov_debt:41.5,life_expectancy:79.8,gini:25.0,poverty:0.1,literacy:99,health_spend:7.8,edu_spend:4.5,internet:88,fertility:1.71,emp_services:58,emp_industry:35,emp_agriculture:2,avg_salary:1400,min_wage:650,hdi:0.895,happiness:6.97,cost_living:48,safety:78,rent_index:18,healthcare:72,qol_index:72,immigration:68,tax_burden:33,sector_tech:68,sector_health:65,sector_finance:60,sector_construction:62,sector_hospitality:62 },
  ROU:{gdp_pc:14800,gdp_pc_ppp:35200,gdp_growth:2.1,inflation:9.6,unemployment:5.5,population:19000000,exports:35.0,current_account:-6.5,gov_debt:47.5,life_expectancy:76.6,gini:34.8,poverty:0.2,literacy:98.8,health_spend:5.8,edu_spend:3.2,internet:85,fertility:1.71,emp_services:48,emp_industry:32,emp_agriculture:18,avg_salary:750,min_wage:520,hdi:0.827,happiness:5.88,cost_living:35,safety:68,rent_index:12,healthcare:55,qol_index:55,immigration:60,tax_burden:28,sector_tech:58,sector_health:55,sector_finance:48,sector_construction:65,sector_hospitality:55 },
  HUN:{gdp_pc:18300,gdp_pc_ppp:38200,gdp_growth:0.5,inflation:17.6,unemployment:4.1,population:9600000,exports:85.0,current_account:-0.5,gov_debt:73.5,life_expectancy:76.9,gini:29.6,poverty:0.1,literacy:99,health_spend:6.4,edu_spend:4.6,internet:90,fertility:1.55,emp_services:65,emp_industry:28,emp_agriculture:5,avg_salary:950,min_wage:580,hdi:0.851,happiness:6.09,cost_living:42,safety:72,rent_index:14,healthcare:62,qol_index:58,immigration:62,tax_burden:30,sector_tech:62,sector_health:60,sector_finance:55,sector_construction:58,sector_hospitality:58 },
  IRL:{gdp_pc:103500,gdp_pc_ppp:102000,gdp_growth:-5.5,inflation:5.2,unemployment:4.2,population:5200000,exports:112.0,current_account:8.5,gov_debt:44.0,life_expectancy:82.6,gini:31.9,poverty:0.1,literacy:99,health_spend:6.7,edu_spend:3.3,internet:96,fertility:1.78,emp_services:78,emp_industry:16,emp_agriculture:5,avg_salary:3800,min_wage:2100,hdi:0.945,happiness:6.84,cost_living:72,safety:75,rent_index:52,healthcare:78,qol_index:82,immigration:82,tax_burden:28,sector_tech:92,sector_health:72,sector_finance:95,sector_construction:65,sector_hospitality:68 },
  ISL:{gdp_pc:72800,gdp_pc_ppp:62000,gdp_growth:4.1,inflation:8.6,unemployment:3.5,population:380000,exports:38.0,current_account:2.5,gov_debt:42.0,life_expectancy:83.3,gini:26.1,poverty:0.1,literacy:99,health_spend:8.6,edu_spend:7.5,internet:99,fertility:1.72,emp_services:75,emp_industry:18,emp_agriculture:5,avg_salary:4200,min_wage:0,hdi:0.959,happiness:7.53,cost_living:82,safety:88,rent_index:42,healthcare:82,qol_index:88,immigration:70,tax_burden:32,sector_tech:65,sector_health:72,sector_finance:62,sector_construction:58,sector_hospitality:72 },
  LUX:{gdp_pc:128820,gdp_pc_ppp:112000,gdp_growth:-1.0,inflation:3.7,unemployment:5.2,population:660000,exports:175.0,current_account:5.5,gov_debt:24.5,life_expectancy:82.7,gini:32.4,poverty:0.1,literacy:99,health_spend:5.5,edu_spend:3.2,internet:97,fertility:1.38,emp_services:82,emp_industry:12,emp_agriculture:1,avg_salary:4800,min_wage:0,hdi:0.935,happiness:7.23,cost_living:78,safety:82,rent_index:45,healthcare:78,qol_index:85,immigration:75,tax_burden:38,sector_tech:75,sector_health:72,sector_finance:92,sector_construction:55,sector_hospitality:62 }
};

function fmtNum(v, dec = 1) {
  if (v == null || isNaN(v)) return '—';
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function getInd(id) { return INDICATORS.find(i => i.id === id); }
