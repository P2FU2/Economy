/* WORLDPANEL — Dados estáticos: vistos, fiscal, clima, burocracia (BR → destino) */

const EXPAT_PROFILE_KEY = 'worldpanel_expat_profile_v1';

const EXPAT_DIMENSIONS = [
  { id: 'entry', label: 'Entrada', icon: '🛂' },
  { id: 'cost', label: 'Custo', icon: '💶' },
  { id: 'quality', label: 'Qualidade', icon: '🏥' },
  { id: 'work', label: 'Trabalho', icon: '💼' },
  { id: 'integration', label: 'Integração', icon: '🗣️' }
];

const EXPAT_MOTIVATION_WEIGHTS = {
  family: { quality: 0.28, cost: 0.18, entry: 0.15, work: 0.12, integration: 0.12 },
  career: { work: 0.32, entry: 0.18, integration: 0.18, cost: 0.12, quality: 0.10 },
  study: { integration: 0.25, entry: 0.22, cost: 0.20, quality: 0.18, work: 0.10 },
  retire: { quality: 0.30, cost: 0.28, entry: 0.15, integration: 0.12, work: 0.05 },
  lifestyle: { quality: 0.25, cost: 0.22, integration: 0.18, work: 0.15, entry: 0.12 },
  tax: { cost: 0.35, entry: 0.20, work: 0.18, quality: 0.12, integration: 0.10 }
};

/* Burocracia imigração 1=fácil … 10=penoso */
const IMMIG_BUREAUCRACY = {
  PRT: 4, ESP: 5, ITA: 6, GRC: 6, IRL: 5, NLD: 5, DEU: 7, FRA: 7, BEL: 6, AUT: 7,
  CHE: 8, SWE: 6, NOR: 6, DNK: 6, FIN: 6, POL: 5, CZE: 5, HUN: 5, ROU: 5, LUX: 5,
  GBR: 8, USA: 8, CAN: 6, AUS: 6, MEX: 5, ARG: 4, CHL: 5, COL: 5, BRA: 3,
  JPN: 9, KOR: 7, CHN: 9, IND: 7, TUR: 6, ZAF: 6, NGA: 7, EGY: 7, RUS: 8, IDN: 6, SAU: 7
};

const BRAZILIAN_COMMUNITY = {
  PRT: 220, ITA: 180, ESP: 150, USA: 1900, GBR: 120, DEU: 85, FRA: 70, IRL: 45, NLD: 35,
  CHE: 25, BEL: 30, LUX: 8, AUT: 20, SWE: 15, NOR: 10, DNK: 12, FIN: 8, POL: 25, CZE: 18,
  GRC: 22, ROU: 12, HUN: 10, CAN: 95, AUS: 55, ARG: 280, CHL: 45, COL: 38, MEX: 65,
  JPN: 30, KOR: 15, ZAF: 25, BRA: 0, default: 15
};

const BUSINESS_EASE = {
  PRT: 78, ESP: 72, ITA: 65, DEU: 80, FRA: 75, NLD: 88, IRL: 85, GBR: 82, CHE: 86,
  SWE: 84, NOR: 82, DNK: 83, FIN: 82, POL: 70, CZE: 76, AUT: 74, BEL: 76, GRC: 58,
  USA: 82, CAN: 80, AUS: 78, MEX: 62, ARG: 55, BRA: 58, default: 60
};

const FLIGHT_HOURS_BR = {
  PRT: 10, ESP: 10, ITA: 12, FRA: 11, DEU: 12, GBR: 11, IRL: 10, NLD: 11, BEL: 11,
  CHE: 12, AUT: 12, SWE: 14, NOR: 14, DNK: 13, FIN: 14, POL: 13, CZE: 13, GRC: 13,
  ROU: 13, HUN: 12, LUX: 11, USA: 9, CAN: 10, MEX: 9, ARG: 3, CHL: 4, COL: 6, BRA: 0,
  JPN: 22, KOR: 22, CHN: 22, AUS: 22, ZAF: 9, default: 14
};

const EXPAT_CLIMATE = {
  PRT: { tempC: 16, sunnyDays: 280, warm: true, humid: 'moderate' },
  ESP: { tempC: 15, sunnyDays: 260, warm: true, humid: 'low' },
  ITA: { tempC: 14, sunnyDays: 250, warm: true, humid: 'moderate' },
  GRC: { tempC: 17, sunnyDays: 270, warm: true, humid: 'low' },
  FRA: { tempC: 11, sunnyDays: 180, warm: false, humid: 'moderate' },
  DEU: { tempC: 9, sunnyDays: 160, warm: false, humid: 'moderate' },
  NLD: { tempC: 10, sunnyDays: 150, warm: false, humid: 'high' },
  GBR: { tempC: 10, sunnyDays: 140, warm: false, humid: 'high' },
  IRL: { tempC: 10, sunnyDays: 145, warm: false, humid: 'high' },
  SWE: { tempC: 6, sunnyDays: 120, warm: false, humid: 'moderate' },
  NOR: { tempC: 5, sunnyDays: 110, warm: false, humid: 'moderate' },
  DNK: { tempC: 8, sunnyDays: 150, warm: false, humid: 'moderate' },
  FIN: { tempC: 5, sunnyDays: 115, warm: false, humid: 'moderate' },
  CHE: { tempC: 8, sunnyDays: 170, warm: false, humid: 'low' },
  AUT: { tempC: 8, sunnyDays: 165, warm: false, humid: 'moderate' },
  POL: { tempC: 8, sunnyDays: 155, warm: false, humid: 'moderate' },
  CZE: { tempC: 8, sunnyDays: 160, warm: false, humid: 'moderate' },
  USA: { tempC: 12, sunnyDays: 220, warm: true, humid: 'varies' },
  CAN: { tempC: 4, sunnyDays: 130, warm: false, humid: 'moderate' },
  AUS: { tempC: 18, sunnyDays: 260, warm: true, humid: 'moderate' },
  BRA: { tempC: 24, sunnyDays: 220, warm: true, humid: 'high' },
  default: { tempC: 12, sunnyDays: 180, warm: false, humid: 'moderate' }
};

const EXPAT_TAX = {
  PRT: { foreignRate: 0.28, localRate: 0.35, treatyBR: true, special: { name: 'NHR (extinto 2024 — consultar regime atual)', rate: 0.20, note: 'Rendimentos estrangeiros podiam ter tratamento favorável por 10 anos' } },
  ITA: { foreignRate: 0.38, localRate: 0.43, treatyBR: true, special: { name: 'Impatriati / Flat tax', rate: 0.30, note: 'Regime para novos residentes — 30% fixo ou impatriati 70% isento por 5 anos (condições)' } },
  ESP: { foreignRate: 0.35, localRate: 0.40, treatyBR: true, special: { name: 'Beckham Law', rate: 0.24, note: 'Trabalhadores qualificados — 24% fixo por 6 anos' } },
  DEU: { foreignRate: 0.42, localRate: 0.45, treatyBR: true, special: null },
  FRA: { foreignRate: 0.40, localRate: 0.45, treatyBR: true, special: null },
  NLD: { foreignRate: 0.37, localRate: 0.40, treatyBR: true, special: { name: '30% ruling', rate: 0.30, note: 'Expatriados qualificados — 30% isento por 5 anos' } },
  IRL: { foreignRate: 0.40, localRate: 0.40, treatyBR: true, special: null },
  GBR: { foreignRate: 0.40, localRate: 0.45, treatyBR: true, special: null },
  CHE: { foreignRate: 0.25, localRate: 0.30, treatyBR: true, special: null },
  GRC: { foreignRate: 0.30, localRate: 0.35, treatyBR: true, special: { name: 'Flat tax aposentados', rate: 0.07, note: '7% fixo sobre pensão estrangeira (condições)' } },
  USA: { foreignRate: 0.32, localRate: 0.35, treatyBR: true, special: null },
  CAN: { foreignRate: 0.33, localRate: 0.35, treatyBR: true, special: null },
  AUS: { foreignRate: 0.37, localRate: 0.37, treatyBR: true, special: null },
  default: { foreignRate: 0.30, localRate: 0.35, treatyBR: true, special: null }
};

const EXPAT_VISA = {
  PRT: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 1, costUsd: 400, euOnly: true, next: 'Obter NIF + registo CRUE no SEF/AIMA' },
      { id: 'd7', label: 'Visto D7 (renda passiva)', months: 3, costUsd: 2200, minIncome: 920, remote: true, passive: true, next: 'Abrir conta PT + NIF + comprovar rendimentos' },
      { id: 'd8', label: 'Visto D8 (nômade digital)', months: 3, costUsd: 2000, minIncome: 3480, remote: true, next: 'Contrato remoto + seguro saúde + alojamento' },
      { id: 'work', label: 'Visto de trabalho', months: 6, costUsd: 3200, localJob: true, next: 'Oferta de emprego + contrato + visto consular' },
      { id: 'golden', label: 'Golden Visa (investimento)', months: 8, costUsd: 35000, investor: true, next: 'Investimento imobiliário/fundos (regras 2024+)' }
    ]
  },
  ITA: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 1, costUsd: 500, euOnly: true, next: 'Codice fiscale + residenza comune + tessera sanitaria' },
      { id: 'elective', label: 'Visto de eleitor (renda passiva)', months: 4, costUsd: 2800, minIncome: 31000, passive: true, next: 'Comprovar renda anual + alojamento + seguro' },
      { id: 'digital', label: 'Visto nômade digital', months: 4, costUsd: 2200, minIncome: 2800, remote: true, next: 'Contrato remoto + seguro + endereço IT' },
      { id: 'work', label: 'Nulla osta / trabalho', months: 8, costUsd: 3800, localJob: true, next: 'Employer solicita nulla osta + visto consular' },
      { id: 'study', label: 'Visto de estudo', months: 4, costUsd: 1800, study: true, next: 'Matrícula universidade + comprovante financeiro' }
    ]
  },
  ESP: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 1, costUsd: 450, euOnly: true, next: 'NIE + empadronamiento + seguridad social' },
      { id: 'nonlucrative', label: 'Visado no lucrativo', months: 4, costUsd: 2500, minIncome: 2800, passive: true, next: 'Comprovar meios + seguro saúde privado' },
      { id: 'digital', label: 'Visto teletrabalho', months: 3, costUsd: 2000, minIncome: 2100, remote: true, next: 'Contrato remoto + titulação universitária' },
      { id: 'work', label: 'Visto de trabalho', months: 6, costUsd: 3000, localJob: true, next: 'Autorização trabalho + contrato' }
    ]
  },
  DEU: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 2, costUsd: 600, euOnly: true, next: 'Anmeldung + Krankenversicherung' },
      { id: 'bluecard', label: 'EU Blue Card', months: 5, costUsd: 3500, minIncome: 4500, localJob: true, next: 'Diploma reconhecido + oferta salário mínimo' },
      { id: 'freelance', label: 'Visto freelance', months: 6, costUsd: 3200, entrepreneur: true, next: 'Plano de negócios + clientes alemães' },
      { id: 'jobseeker', label: 'Job seeker visa', months: 4, costUsd: 2200, next: 'Diploma + fundos 6 meses + seguro' }
    ]
  },
  FRA: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 2, costUsd: 550, euOnly: true, next: 'Titre de séjour + CAF + sécurité sociale' },
      { id: 'talent', label: 'Passeport talent', months: 5, costUsd: 3200, minIncome: 3800, localJob: true, next: 'Contrato qualificado + reconhecimento diploma' },
      { id: 'visitor', label: 'Visiteur (renda passiva)', months: 4, costUsd: 2600, passive: true, minIncome: 2000, next: 'Comprovar rendimentos + seguro' }
    ]
  },
  NLD: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 1, costUsd: 500, euOnly: true, next: 'BSN + registro municipal' },
      { id: 'hsm', label: 'Highly Skilled Migrant', months: 4, costUsd: 3000, minIncome: 5200, localJob: true, next: 'Employer sponsor IND' },
      { id: 'daft', label: 'DAFT (empreendedor US)', months: 5, costUsd: 4500, entrepreneur: true, next: 'Investimento €4.500 + plano negócios' }
    ]
  },
  IRL: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 1, costUsd: 450, euOnly: true, next: 'PPSN + registro IRP' },
      { id: 'critical', label: 'Critical Skills Employment', months: 4, costUsd: 2800, localJob: true, next: 'Oferta em lista critical skills' },
      { id: 'stamp0', label: 'Stamp 0 (renda passiva)', months: 5, costUsd: 2400, passive: true, minIncome: 50000, next: 'Comprovar renda anual €50k+' }
    ]
  },
  GBR: {
    paths: [
      { id: 'skilled', label: 'Skilled Worker visa', months: 4, costUsd: 4500, minIncome: 3800, localJob: true, next: 'Sponsor licenciado + IELTS' },
      { id: 'global', label: 'Global Talent', months: 6, costUsd: 5000, next: 'Endorsement tech/arts/research' }
    ]
  },
  USA: {
    paths: [
      { id: 'b1b2', label: 'Turista B1/B2', months: 2, costUsd: 500, tourist: true, next: 'Entrevista consular — sem direito a trabalhar' },
      { id: 'h1b', label: 'H-1B (trabalho)', months: 8, costUsd: 8000, localJob: true, next: 'Employer petition + loteria H-1B' },
      { id: 'e2', label: 'E-2 investidor', months: 10, costUsd: 120000, investor: true, next: 'Investimento substancial + plano negócios' }
    ]
  },
  CAN: {
    paths: [
      { id: 'express', label: 'Express Entry', months: 8, costUsd: 3500, next: 'CRS score + language test + ECA' },
      { id: 'work', label: 'Work permit', months: 5, costUsd: 2800, localJob: true, next: 'LMIA ou LMIA-exempt offer' }
    ]
  },
  default: {
    paths: [
      { id: 'eu', label: 'Cidadania / residência UE', months: 2, costUsd: 600, euOnly: true, next: 'Registro local como cidadão UE' },
      { id: 'tourist', label: 'Entrada turística (Schengen 90/180)', months: 0, costUsd: 200, tourist: true, next: 'Sem residência — apenas visita' },
      { id: 'work', label: 'Visto de trabalho', months: 8, costUsd: 3500, localJob: true, next: 'Consultar consulado do país' },
      { id: 'remote', label: 'Visto nômade / renda', months: 5, costUsd: 2500, remote: true, minIncome: 2500, next: 'Verificar se país oferece visto específico' }
    ]
  }
};

const CITY_COST_MULT = {
  ITA: { default: 1, Roma: 1.05, Milano: 1.35, Bologna: 1.15, Firenze: 1.2, Napoli: 0.85, Torino: 1.1 },
  PRT: { default: 1, Lisboa: 1.25, Porto: 1.05, Braga: 0.85, Faro: 0.9 },
  ESP: { default: 1, Madrid: 1.15, Barcelona: 1.2, Valencia: 0.9, Sevilla: 0.85 },
  DEU: { default: 1, Berlin: 1.1, München: 1.45, Hamburg: 1.15, Frankfurt: 1.2 },
  FRA: { default: 1, Paris: 1.4, Lyon: 1.05, Marseille: 0.95 },
  default: { default: 1 }
};

const DEFAULT_EXPAT_PROFILE = {
  household: 'couple',
  age: 30,
  education: 'superior',
  euCitizen: false,
  euCountry: '',
  langLevel: 'basic',
  goal: 'family',
  motivations: ['family'],
  monthlyIncome: 3500,
  incomeCurrency: 'USD',
  reserve: 20000,
  incomeType: 'remote',
  sector: 'sector_tech',
  riskTolerance: 3,
  priorities: ['safety', 'healthcare', 'cost'],
  timelineMonths: 12,
  langCommitment: 'moderate',
  targetCity: ''
};

function getExpatVisaData(code) {
  return EXPAT_VISA[code] || EXPAT_VISA.default;
}

function getExpatTax(code) {
  return EXPAT_TAX[code] || EXPAT_TAX.default;
}

function getExpatClimate(code) {
  return EXPAT_CLIMATE[code] || EXPAT_CLIMATE.default;
}

function getCityCostMult(code, city) {
  const map = CITY_COST_MULT[code] || CITY_COST_MULT.default;
  if (!city) return map.default || 1;
  const key = city.trim();
  return map[key] || map.default || 1;
}

function loadExpatProfile() {
  try {
    const raw = localStorage.getItem(EXPAT_PROFILE_KEY);
    let p = raw ? { ...DEFAULT_EXPAT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_EXPAT_PROFILE };
    if (typeof getFamilyProfile === 'function') {
      const fp = getFamilyProfile();
      p = { ...p, household: fp.household, age: fp.age, education: fp.education, euCitizen: fp.euCitizen, goal: fp.goal };
      if (!p.motivations?.length) p.motivations = [fp.goal || 'family'];
    }
    return p;
  } catch (e) {
    return { ...DEFAULT_EXPAT_PROFILE };
  }
}

function saveExpatProfile(p) {
  localStorage.setItem(EXPAT_PROFILE_KEY, JSON.stringify(p));
  if (typeof saveFamilyProfileFromForm === 'function') {
    /* sync back minimal fields if form exists */
  }
}

function pickBestVisaPath(code, profile) {
  const visa = getExpatVisaData(code);
  const paths = visa.paths.slice();
  if (profile.euCitizen) {
    const eu = paths.find(p => p.euOnly);
    if (eu) return { ...eu, fit: 98, reason: 'Cidadania UE — direito de residência sem visto de longa duração' };
  }
  let best = null;
  let bestScore = -1;
  paths.forEach(p => {
    if (p.euOnly) return;
    let score = 50;
    if (profile.incomeType === 'remote' && (p.remote || p.passive)) score += 25;
    if (profile.incomeType === 'local' && p.localJob) score += 25;
    if (profile.incomeType === 'entrepreneur' && p.entrepreneur) score += 25;
    if (profile.incomeType === 'clt_br' && p.passive) score += 10;
    if (p.minIncome && profile.monthlyIncome >= p.minIncome) score += 15;
    else if (p.minIncome && profile.monthlyIncome < p.minIncome) score -= 30;
    if (p.months <= profile.timelineMonths) score += 15;
    else score -= (p.months - profile.timelineMonths) * 3;
    if (profile.goal === 'study' && p.study) score += 30;
    if (profile.goal === 'retire' && p.passive) score += 20;
    if (score > bestScore) { bestScore = score; best = p; }
  });
  if (!best) best = paths.find(p => !p.euOnly) || paths[0];
  return { ...best, fit: Math.max(0, Math.min(100, bestScore)), reason: bestScore >= 70 ? 'Caminho alinhado ao seu perfil' : bestScore >= 45 ? 'Viável com ajustes' : 'Desafiador — considere alternativas' };
}

function estMonthlyLiving(code, city) {
  const mult = getCityCostMult(code, city);
  return (estMonthlyCost(code) + estRent(code)) * mult;
}

function incomeInUsd(profile) {
  let inc = profile.monthlyIncome || 0;
  if (profile.incomeCurrency === 'BRL') inc = inc / 5.2;
  if (profile.incomeCurrency === 'EUR') inc = inc * 1.08;
  return inc;
}

function effectiveTaxRate(code, profile) {
  const tax = getExpatTax(code);
  if (profile.incomeType === 'remote' || profile.incomeType === 'clt_br') return tax.foreignRate;
  return tax.localRate;
}

function monthsReserveCovers(code, profile, city) {
  const monthly = estMonthlyLiving(code, city);
  if (!monthly) return 0;
  return (profile.reserve || 0) / monthly;
}

function netMonthlyIncome(code, profile) {
  const gross = incomeInUsd(profile);
  const rate = effectiveTaxRate(code, profile);
  return gross * (1 - rate);
}

function langMonthsToB1(profile, code) {
  const ease = LANG_EASE[code] || 30;
  const base = { none: 18, basic: 12, intermediate: 6, advanced: 0 }[profile.langLevel] || 12;
  const commit = { low: 1.4, moderate: 1, high: 0.7 }[profile.langCommitment] || 1;
  return Math.round(base * (100 - ease) / 35 * commit);
}

function calcReversibilityScore(code, profile) {
  const hours = FLIGHT_HOURS_BR[code] ?? FLIGHT_HOURS_BR.default;
  const community = BRAZILIAN_COMMUNITY[code] ?? BRAZILIAN_COMMUNITY.default;
  const lang = LANG_EASE[code] || 30;
  let s = 50;
  s += Math.max(0, 20 - hours);
  s += Math.min(15, community / 15);
  s += lang / 5;
  s -= (profile.riskTolerance || 3) * 2;
  if (profile.euCitizen) s -= 5;
  return Math.round(Math.max(10, Math.min(95, s)));
}
