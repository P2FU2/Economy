/* WORLDPANEL — Governantes e eventos históricos por país */

const LEADERS = {
  BRA: [
    { name: 'Jânio Quadros', from: 1961, to: 1961, role: 'Presidente', measures: ['Política externa independente', 'Tentativa de frente contra inflação'], consequences: ['Crise política', 'Renúncia após 7 meses'] },
    { name: 'João Goulart', from: 1961, to: 1964, role: 'Presidente', measures: ['Reformas de base', 'Controle de lucros', 'Voto aos analfabetos'], consequences: ['Inflação acelerou', 'Golpe militar de 1964'] },
    { name: 'Castelo Branco', from: 1964, to: 1967, role: 'Presidente', measures: ['AI-1/2', 'Congelamento salarial', 'Abertura à FMI'], consequences: ['Estabilização inicial', 'Repressão política'] },
    { name: 'Emílio Médici', from: 1969, to: 1974, role: 'Presidente', measures: ['Milagre econômico', 'Grandes obras', 'Geisel como planejamento'], consequences: ['PIB ~10%/ano', 'Dívida externa cresceu'] },
    { name: 'Ernesto Geisel', from: 1974, to: 1979, role: 'Presidente', measures: ['Abertura lenta', 'II PND', 'Déficit controlado'], consequences: ['Modernização industrial', 'Choque do petróleo absorvido'] },
    { name: 'João Figueiredo', from: 1979, to: 1985, role: 'Presidente', measures: ['Plano Cruzado (1986 legado)', 'Anistia'], consequences: ['Hiperinflação nos anos 80', 'Transição democrática'] },
    { name: 'José Sarney', from: 1985, to: 1990, role: 'Presidente', measures: ['Plano Cruzado', 'Plano Bresser', 'Plano Verão'], consequences: ['Inflação chegou a 80%/mês', 'Confisco da poupança (Cruzado)'] },
    { name: 'Fernando Collor', from: 1990, to: 1992, role: 'Presidente', measures: ['Plano Collor', 'Abertura comercial', 'Privatizações iniciais'], consequences: ['Confisco CPMF', 'Impeachment por corrupção'] },
    { name: 'Itamar Franco', from: 1992, to: 1994, role: 'Presidente', measures: ['Plano Real (FHC ministro)', 'Ulysses Guimarães Constituinte legado'], consequences: ['Fim da hiperinflação', 'Estabilidade cambial'] },
    { name: 'Fernando Henrique Cardoso', from: 1995, to: 2002, role: 'Presidente', measures: ['Plano Real consolidado', 'Privatizações', 'Real forte', 'Bolsa Família piloto'], consequences: ['Inflação <10%', 'Desemprego alto inicial', 'PIB estável'] },
    { name: 'Lula (1º e 2º)', from: 2003, to: 2010, role: 'Presidente', measures: ['Fome Zero', 'Bolsa Família', 'PAC', 'Salário mínimo real'], consequences: ['Queda forte da pobreza', 'Commodities impulsionaram PIB'] },
    { name: 'Dilma Rousseff', from: 2011, to: 2016, role: 'Presidente', measures: ['PAC 2', 'Controle de preços', 'Crédito subsidiado'], consequences: ['Recessão 2015-16', 'Impeachment', 'Desemprego >12%'] },
    { name: 'Michel Temer', from: 2016, to: 2018, role: 'Presidente', measures: ['Teto de gastos', 'Reforma trabalhista', 'Reforma previdência adiada'], consequences: ['Inflação baixa', 'Recuperação fraca'] },
    { name: 'Jair Bolsonaro', from: 2019, to: 2022, role: 'Presidente', measures: ['Reforma da Previdência', 'Auxílio emergencial', 'Liberação de armas'], consequences: ['Pandemia: -3,3% PIB 2020', 'Inflação voltou a subir'] },
    { name: 'Lula (3º)', from: 2023, to: 2026, role: 'Presidente', measures: ['Bolsa Família ampliado', 'PAC retomado', 'Marco fiscal'], consequences: ['Queda do desemprego', 'Déficit fiscal elevado'] }
  ],
  USA: [
    { name: 'JFK', from: 1961, to: 1963, role: 'Presidente', measures: ['Corte de impostos', 'Corrida espacial'], consequences: ['Crescimento forte início dos 60s'] },
    { name: 'Lyndon Johnson', from: 1963, to: 1969, role: 'Presidente', measures: ['Great Society', 'Guerra do Vietnã'], consequences: ['Gastos públicos altos', 'Inflação pressionada'] },
    { name: 'Richard Nixon', from: 1969, to: 1974, role: 'Presidente', measures: ['Fim padrão ouro', 'Controles de preços'], consequences: ['Estagflação', 'Watergate'] },
    { name: 'Ronald Reagan', from: 1981, to: 1989, role: 'Presidente', measures: ['Reaganomics', 'Corte impostos', 'Deregulação'], consequences: ['Recuperação 80s', 'Déficit twin'] },
    { name: 'Bill Clinton', from: 1993, to: 2001, role: 'Presidente', measures: ['NAFTA', 'Reforma welfare', 'Superávit fiscal'], consequences: ['Boom dot-com', 'Desemprego baixo'] },
    { name: 'George W. Bush', from: 2001, to: 2009, role: 'Presidente', measures: ['Guerra terror', 'Tax cuts', 'TARP 2008'], consequences: ['Déficits', 'Crise financeira'] },
    { name: 'Barack Obama', from: 2009, to: 2017, role: 'Presidente', measures: ['Stimulus ARRA', 'Affordable Care Act', 'QE Fed'], consequences: ['Recuperação lenta', 'Desemprego caiu'] },
    { name: 'Donald Trump', from: 2017, to: 2021, role: 'Presidente', measures: ['Tax Cuts 2017', 'Guerra comercial China', 'COVID stimulus'], consequences: ['PIB forte pré-COVID', 'Inflação pós-pandemia'] },
    { name: 'Joe Biden', from: 2021, to: 2025, role: 'Presidente', measures: ['IRA', 'CHIPS Act', 'Infraestrutura'], consequences: ['Emprego forte', 'Inflação 2022-23'] }
  ],
  ITA: [
    { name: 'Aldo Moro', from: 1963, to: 1968, role: 'PM', measures: ['Centro-esquerda', 'Reformas sociais'], consequences: ['Modernização Estado'] },
    { name: 'Berlusconi (vários)', from: 1994, to: 2011, role: 'PM', measures: ['Reforma fiscal', 'Flexibilização trabalho'], consequences: ['Dívida estável', 'Crescimento baixo'] },
    { name: 'Mario Monti', from: 2011, to: 2013, role: 'PM', measures: ['Austeridade', 'Reforma pensiones'], consequences: ['Spread caiu', 'Recessão'] },
    { name: 'Matteo Renzi', from: 2014, to: 2016, role: 'PM', measures: ['Jobs Act', 'Reforma constitucional (rejeitada)'], consequences: ['Emprego temporário subiu'] },
    { name: 'Giorgia Meloni', from: 2022, to: 2026, role: 'PM', measures: ['PNRR UE', 'Flat tax parcial'], consequences: ['PIB resiliente pós-COVID'] }
  ],
  ESP: [
    { name: 'Franco (fim)', from: 1960, to: 1975, role: 'Caudillo', measures: ['Autarquia → abertura tardia'], consequences: ['Atraso vs Europa'] },
    { name: 'Felipe González', from: 1982, to: 1996, role: 'PM', measures: ['Entrada UE', 'Privatizações', 'Estado autonômico'], consequences: ['Boom anos 90'] },
    { name: 'José María Aznar', from: 1996, to: 2004, role: 'PM', measures: ['Liberalização', 'Euro'], consequences: ['PIB alto crescimento'] },
    { name: 'Zapatero', from: 2004, to: 2011, role: 'PM', measures: ['Estado bem-estar', 'Bolha imobiliária'], consequences: ['Crise 2008 devastadora', 'Desemprego 26%'] },
    { name: 'Rajoy / Sánchez', from: 2011, to: 2026, role: 'PM', measures: ['Austeridade', 'Reforma laboral'], consequences: ['Recuperação gradual'] }
  ],
  PRT: [
    { name: 'Estado Novo (fim)', from: 1960, to: 1974, role: 'Regime', measures: ['Economia fechada'], consequences: ['PIB baixo', 'Emigração massiva'] },
    { name: 'Mário Soares', from: 1976, to: 1986, role: 'PM/Presidente', measures: ['Revolução dos Cravos legado', 'Entrada CEE'], consequences: ['Democratização', 'Investimento estrangeiro'] },
    { name: 'Durão Barroso / Sócrates', from: 2002, to: 2011, role: 'PM', measures: ['Obras públicas', 'Deficit alto'], consequences: ['Troika 2011', 'Austeridade severa'] },
    { name: 'António Costa', from: 2015, to: 2024, role: 'PM', measures: ['Geringonça', 'Salário mínimo', 'Turismo'], consequences: ['Superávit primário', 'Habitação cara'] }
  ],
  DEU: [
    { name: 'Konrad Adenauer', from: 1960, to: 1963, role: 'Chanceler', measures: ['Wirtschaftswunder'], consequences: ['Reconstrução pós-guerra'] },
    { name: 'Willy Brandt', from: 1969, to: 1974, role: 'Chanceler', measures: ['Ostpolitik', 'Expansão social'], consequences: ['Estabilidade social'] },
    { name: 'Gerhard Schröder', from: 1998, to: 2005, role: 'Chanceler', measures: ['Agenda 2010', 'Hartz reforms'], consequences: ['Desemprego caiu', 'Precarização'] },
    { name: 'Angela Merkel', from: 2005, to: 2021, role: 'Chanceler', measures: ['Austeridade euro', 'Energiewende'], consequences: ['Exportações fortes', 'Baixo desemprego'] },
    { name: 'Olaf Scholz', from: 2021, to: 2025, role: 'Chanceler', measures: ['Zeitenwende', 'Energia pós-Ucrânia'], consequences: ['Inflação energética 2022'] }
  ],
  FRA: [
    { name: 'Charles de Gaulle', from: 1960, to: 1969, role: 'Presidente', measures: ['Trente Glorieuses', 'Independência'], consequences: ['PIB forte'] },
    { name: 'François Mitterrand', from: 1981, to: 1995, role: 'Presidente', measures: ['Nacionalizações', '35h semanais'], consequences: ['Déficits', 'Maastricht'] },
    { name: 'Jacques Chirac', from: 1995, to: 2007, role: 'Presidente', measures: ['Euro', 'Reformas fiscais'], consequences: ['Estabilidade'] },
    { name: 'Emmanuel Macron', from: 2017, to: 2026, role: 'Presidente', measures: ['Reforma trabalhista', 'Pension reform'], consequences: ['Protestos', 'Desemprego baixo'] }
  ],
  GBR: [
    { name: 'Harold Wilson', from: 1964, to: 1970, role: 'PM', measures: ['Welfare state'], consequences: ['Modernização'] },
    { name: 'Margaret Thatcher', from: 1979, to: 1990, role: 'PM', measures: ['Privatizações', 'Fim sindicatos', 'Big Bang City'], consequences: ['Desindustrialização', 'Serviços financeiros'] },
    { name: 'Tony Blair', from: 1997, to: 2007, role: 'PM', measures: ['New Labour', 'Banco Central independente'], consequences: ['Crescimento estável'] },
    { name: 'Brexit era (May/Johnson)', from: 2016, to: 2022, role: 'PM', measures: ['Brexit', 'COVID furlough'], consequences: ['Comércio UE caiu', 'Inflação'] }
  ],
  ARG: [
    { name: 'Onganía / Perón retorno', from: 1966, to: 1976, role: 'Presidente', measures: ['Import substitution'], consequences: ['Instabilidade'] },
    { name: 'Menem', from: 1989, to: 1999, role: 'Presidente', measures: ['Convertibilidade 1:1 USD', 'Privatizações'], consequences: ['Inflação zero', 'Crise 2001'] },
    { name: 'Kirchnerismo', from: 2003, to: 2015, role: 'Presidente', measures: ['Controle cambial', 'CEPO'], consequences: ['Crescimento com inflação reprimida'] },
    { name: 'Macri / Fernández', from: 2015, to: 2024, role: 'Presidente', measures: ['FMI $57bi', 'Devaluação'], consequences: ['Inflação >100%', 'Pobreza subiu'] },
    { name: 'Javier Milei', from: 2023, to: 2026, role: 'Presidente', measures: ['Chainsaw austerity', 'Dolarização proposta'], consequences: ['Superávit fiscal', 'Recessão inicial'] }
  ],
  MEX: [
    { name: 'PRI estabilidade', from: 1960, to: 1982, role: 'Presidente', measures: ['Industrialização', 'Petróleo'], consequences: ['Crisis dívida 82'] },
    { name: 'Salinas / Zedillo', from: 1988, to: 2000, role: 'Presidente', measures: ['NAFTA', 'Tequila crisis fix'], consequences: ['Exportações EUA'] },
    { name: 'AMLO', from: 2018, to: 2024, role: 'Presidente', measures: ['Austeridade social', 'Pemex'], consequences: ['Pobreza caiu', 'Investimento baixo'] }
  ],
  CHL: [
    { name: 'Allende', from: 1970, to: 1973, role: 'Presidente', measures: ['Nacionalizações'], consequences: ['Hiperinflação', 'Golpe 1973'] },
    { name: 'Pinochet', from: 1973, to: 1990, role: 'Dictador', measures: ['Chicago Boys', 'Privatizações'], consequences: ['PIB cresceu', 'Desigualdade alta'] },
    { name: 'Concertación / Bachelet', from: 1990, to: 2018, role: 'Presidente', measures: ['Modelo social-democrata'], consequences: ['Estabilidade', 'Protestas 2019'] },
    { name: 'Boric', from: 2022, to: 2026, role: 'Presidente', measures: ['Reforma tributária', 'Constituinte'], consequences: ['Incerteza investimento'] }
  ],
  COL: [
    { name: 'Violência / narcotráfico', from: 1980, to: 2002, role: 'Crise', measures: ['Guerra interna'], consequences: ['Investimento baixo'] },
    { name: 'Uribe / Santos', from: 2002, to: 2018, role: 'Presidente', measures: ['Paz FARC', 'Segurança'], consequences: ['PIB cresceu', 'Acordo de paz 2016'] },
    { name: 'Petro', from: 2022, to: 2026, role: 'Presidente', measures: ['Transição energética', 'Reforma saúde'], consequences: ['Incerteza fiscal'] }
  ],
  JPN: [
    { name: 'Era alto crescimento', from: 1960, to: 1973, role: 'LDP', measures: ['Exportações', 'MITI'], consequences: ['Milagre japonês'] },
    { name: 'Bolha e perda década', from: 1989, to: 2012, role: 'PM rotativo', measures: ['ZIRP', 'Stimulus'], consequences: ['Deflação', 'Dívida 250% PIB'] },
    { name: 'Abe Shinzo', from: 2012, to: 2020, role: 'PM', measures: ['Abenomics', 'Yen fraco'], consequences: ['Bolsa subiu', 'Salários estagnados'] }
  ],
  POL: [
    { name: 'Comunismo (fim)', from: 1960, to: 1989, role: 'Regime', measures: ['Economia planificada'], consequences: ['Atraso vs Ocidente'] },
    { name: 'Transição UE', from: 1990, to: 2015, role: 'PM', measures: ['Shock therapy', 'Entrada UE'], consequences: ['Crescimento forte'] },
    { name: 'PiS (Kaczyński)', from: 2015, to: 2023, role: 'PM', measures: ['500+', 'Reforma judiciária'], consequences: ['Consumo subiu', 'Conflito UE'] }
  ],
  IND: [
    { name: 'Nehru / Indira Gandhi', from: 1960, to: 1984, role: 'PM', measures: ['Licence Raj', 'Green Revolution'], consequences: ['Crescimento lento', 'Autossuficiência alimentos'] },
    { name: 'Reformas 1991', from: 1991, to: 2004, role: 'PM', measures: ['Liberalização Manmohan'], consequences: ['IT boom', 'PIB acelerou'] },
    { name: 'Modi', from: 2014, to: 2026, role: 'PM', measures: ['GST', 'Make in India', 'Demonetização'], consequences: ['PIB top 5 mundial', 'Desemprego jovem alto'] }
  ],
  CHN: [
    { name: 'Mao (fim)', from: 1960, to: 1976, role: 'Líder', measures: ['Grande Salto', 'Cultura Revolucionária'], consequences: ['Fome', 'Estagnação'] },
    { name: 'Deng Xiaoping', from: 1978, to: 1997, role: 'Líder', measures: ['Reforma e abertura', 'Zonas econômicas'], consequences: ['Exportação mundial', 'Urbanização'] },
    { name: 'Xi Jinping', from: 2012, to: 2026, role: 'Presidente', measures: ['Belt and Road', 'Controle tech'], consequences: ['PIB 2º mundial', 'Dívida imobiliária'] }
  ]
};

const HIST_EVENTS = {
  BRA: [
    { year: 1964, title: 'Golpe militar', indicators: ['gdp_growth', 'inflation'], type: 'negative', cause: 'Instabilidade política; novo regime adota austeridade.' },
    { year: 1973, title: 'Choque do petróleo', indicators: ['inflation', 'gdp_growth'], type: 'negative', cause: 'Petróleo quadruplicou; inflação global pressionou Brasil.' },
    { year: 1985, title: 'Plano Cruzado', indicators: ['inflation'], type: 'mixed', cause: 'Congelamento de preços reduziu inflação temporariamente; desabou em 1987.' },
    { year: 1994, title: 'Plano Real', indicators: ['inflation', 'gdp_growth'], type: 'positive', cause: 'Nova moeda indexada; inflação caiu de 50%/mês para ~10%/ano.' },
    { year: 1999, title: 'Câmbio flutuante', indicators: ['gdp_growth', 'exports'], type: 'positive', cause: 'Fim da banda cambial; exportações ganharam competitividade.' },
    { year: 2008, title: 'Crise financeira global', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'Lehman; commodities recuperaram Brasil em 2010.' },
    { year: 2015, title: 'Recessão brasileira', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'Queda commodities + crise política; PIB -3,5%.' },
    { year: 2020, title: 'Pandemia COVID-19', indicators: ['gdp_growth', 'unemployment', 'health_spend'], type: 'negative', cause: 'Lockdowns; auxílio emergencial mitigou pobreza mas fiscal deteriorou.' }
  ],
  USA: [
    { year: 1971, title: 'Fim do padrão ouro', indicators: ['inflation'], type: 'mixed', cause: 'Nixon shock; dólar desvalorizou, inflação década 70.' },
    { year: 1979, title: 'Choque petróleo II', indicators: ['inflation', 'gdp_growth'], type: 'negative', cause: 'Volcker elevou juros; recessão 1980-82 controlou inflação.' },
    { year: 2001, title: 'Bolha dot-com estoura', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'NASDAQ caiu 78%; recessão curta.' },
    { year: 2008, title: 'Crise subprime', indicators: ['gdp_growth', 'unemployment', 'gov_debt'], type: 'negative', cause: 'Lehman; TARP e QE; desemprego 10%.' },
    { year: 2020, title: 'COVID-19', indicators: ['gdp_growth', 'unemployment', 'gov_debt'], type: 'negative', cause: 'PIB -3,4%; stimulus $5 tri; inflação 2021-22.' },
    { year: 2022, title: 'Inflação pós-pandemia', indicators: ['inflation'], type: 'negative', cause: 'Demanda + cadeias; Fed subiu juros agressivamente.' }
  ],
  ITA: [
    { year: 1992, title: 'Crise cambial lira', indicators: ['gdp_growth', 'inflation'], type: 'negative', cause: 'Saída do EMS; austeridade; mani pulite.' },
    { year: 1999, title: 'Adoção do Euro', indicators: ['gdp_growth', 'exports'], type: 'mixed', cause: 'Perdeu competição cambial; integração UE.' },
    { year: 2011, title: 'Crise dívida soberana', indicators: ['gov_debt', 'gdp_growth'], type: 'negative', cause: 'Spread BTP-Bund; governo Monti austeridade.' },
    { year: 2020, title: 'COVID — 1º lockdown UE', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'PIB -8,9%; PNRR depois impulsionou.' }
  ],
  ESP: [
    { year: 1986, title: 'Entrada na CEE', indicators: ['gdp_growth', 'exports'], type: 'positive', cause: 'Fundos estruturais; boom imobiliário começou.' },
    { year: 2008, title: 'Estouro bolha imobiliária', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'Construção 13% PIB; desemprego 26%.' },
    { year: 2012, title: 'Resgate bancário', indicators: ['gov_debt', 'gdp_growth'], type: 'negative', cause: 'Troika; cortes gastos públicos.' }
  ],
  PRT: [
    { year: 1986, title: 'Entrada CEE', indicators: ['gdp_growth'], type: 'positive', cause: 'Investimento estrangeiro; emigração reverteu.' },
    { year: 2011, title: 'Troika (FMI/UE/BCE)', indicators: ['gdp_growth', 'unemployment', 'gov_debt'], type: 'negative', cause: 'Austeridade; PIB -1,8% anual médio.' },
    { year: 2020, title: 'COVID + turismo parado', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'Turismo 15% PIB; RRP recuperação.' }
  ],
  DEU: [
    { year: 1990, title: 'Reunificação', indicators: ['gdp_growth', 'gov_debt'], type: 'mixed', cause: 'Leste integrado; custo transferências altas.' },
    { year: 2008, title: 'Crise financeira', indicators: ['gdp_growth', 'exports'], type: 'negative', cause: 'Exportações caíram; Kurzarbeit salvou emprego.' },
    { year: 2022, title: 'Guerra Ucrânia / energia', indicators: ['inflation', 'gdp_growth'], type: 'negative', cause: 'Gás Russo cortado; inflação 7%+.' }
  ],
  ARG: [
    { year: 1991, title: 'Convertibilidade', indicators: ['inflation'], type: 'positive', cause: 'Peso 1:1 dólar; inflação praticamente zero.' },
    { year: 2001, title: 'Corralito / default', indicators: ['gdp_growth', 'unemployment', 'inflation'], type: 'negative', cause: 'Quebra bancária; PIB -11%; desemprego 25%.' },
    { year: 2018, title: 'Crise cambial', indicators: ['inflation', 'gdp_growth'], type: 'negative', cause: 'Fuga capitais; FMI maior empréstimo.' }
  ],
  CHL: [
    { year: 1973, title: 'Golpe militar', indicators: ['gdp_growth'], type: 'mixed', cause: 'Choque neoliberal; PIB cresceu depois com desigualdade.' },
    { year: 2019, title: 'Protestos sociais', indicators: ['gdp_growth'], type: 'negative', cause: 'Estagnação + desigualdade; plebiscito constituinte.' }
  ],
  MEX: [
    { year: 1982, title: 'Crisis de la deuda', indicators: ['gdp_growth', 'inflation'], type: 'negative', cause: 'Petróleo caiu; default; peso desvalorizou.' },
    { year: 1994, title: 'Crisis Tequila', indicators: ['gdp_growth', 'inflation'], type: 'negative', cause: 'Peso crash; FMI $50bi; NAFTA salvou exportações.' }
  ],
  GBR: [
    { year: 1979, title: 'Thatcher eleita', indicators: ['gdp_growth', 'unemployment'], type: 'mixed', cause: 'Reformas estruturais; desemprego subiu antes de cair.' },
    { year: 2016, title: 'Brexit referendum', indicators: ['gdp_growth', 'exports'], type: 'negative', cause: 'Incerteza investimento; libra caiu 15%.' }
  ],
  FRA: [
    { year: 1968, title: 'Mai 68', indicators: ['gdp_growth'], type: 'negative', cause: 'Greves gerais; salários subiram.' },
    { year: 2008, title: 'Crise financeira', indicators: ['gdp_growth', 'unemployment'], type: 'negative', cause: 'Recessão moderada vs vizinhos.' }
  ],
  IND: [
    { year: 1991, title: 'Crise balança pagamentos', indicators: ['gdp_growth', 'exports'], type: 'positive', cause: 'Liberalização; ouro penhorado; reformas Rao.' },
    { year: 2016, title: 'Demonetização', indicators: ['gdp_growth'], type: 'negative', cause: 'Notas 500/1000 banidas; caixa subiu depois.' }
  ],
  CHN: [
    { year: 1978, title: 'Reforma Deng', indicators: ['gdp_growth', 'exports'], type: 'positive', cause: 'Agricultura descoletivizada; ZEE Shenzhen.' },
    { year: 2001, title: 'Entrada OMC', indicators: ['exports', 'gdp_growth'], type: 'positive', cause: 'Fábrica do mundo; comércio explodiu.' },
    { year: 2020, title: 'COVID + lockdown', indicators: ['gdp_growth'], type: 'negative', cause: 'Único grande com crescimento positivo fraco.' }
  ],
  JPN: [
    { year: 1990, title: 'Estouro bolha imobiliária', indicators: ['gdp_growth'], type: 'negative', cause: 'Nikkei caiu 60%; década perdida começou.' },
    { year: 2011, title: 'Terremoto Tohoku', indicators: ['gdp_growth'], type: 'negative', cause: 'Fukushima; reconstrução depois estimulou.' }
  ],
  COL: [
    { year: 2016, title: 'Acordo de paz FARC', indicators: ['gdp_growth', 'safety'], type: 'positive', cause: 'Segurança melhorou; investimento rural.' }
  ],
  POL: [
    { year: 2004, title: 'Entrada UE', indicators: ['gdp_growth', 'exports'], type: 'positive', cause: 'Fundos UE; manufatura alemã migrou.' }
  ],
  ZAF: [
    { year: 1994, title: 'Fim apartheid', indicators: ['gdp_growth'], type: 'positive', cause: 'Mandela; reintegração economia global.' }
  ],
  RUS: [
    { year: 1991, title: 'Dissolução URSS', indicators: ['gdp_growth', 'inflation'], type: 'negative', cause: 'Hiperinflação; choque de preços.' },
    { year: 2014, title: 'Sanções pós-Crimeia', indicators: ['gdp_growth', 'exports'], type: 'negative', cause: 'Rúblos caiu; petróleo também.' }
  ],
  TUR: [
    { year: 2001, title: 'Crise bancária', indicators: ['gdp_growth', 'inflation'], type: 'negative', cause: 'FMI; reformas Kemal Derviş.' },
    { year: 2018, title: 'Crise lira', indicators: ['inflation', 'gdp_growth'], type: 'negative', cause: 'Independência BC questionada; inflação 25%.' }
  ]
};

function getLeaderAtYear(code, year) {
  return (LEADERS[code] || []).find(l => year >= l.from && year <= l.to) || null;
}

function getEventsForYear(code, year, indId) {
  const all = HIST_EVENTS[code] || [];
  return all.filter(e => e.year === year && (!indId || !e.indicators || e.indicators.includes(indId)));
}

function getEventsInRange(code, yearFrom, yearTo, indId) {
  return (HIST_EVENTS[code] || []).filter(e =>
    e.year >= yearFrom && e.year <= yearTo && (!indId || !e.indicators || e.indicators.includes(indId))
  );
}

/* Fotos (Wikimedia) e decretos/leis por país+nome */
const LEADER_EXTRA = {
  'BRA|Fernando Henrique Cardoso': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Fernando_Henrique_Cardoso_1999.jpg/120px-Fernando_Henrique_Cardoso_1999.jpg',
    decrees: [
      { title: 'Lei 9.649/1998 — Privatizações', url: 'https://www.planalto.gov.br/ccivil_03/leis/l9649.htm' },
      { title: 'MP 1.863 — Bolsa Escola', url: 'https://www.planalto.gov.br/ccivil_03/mpv/Antigas/1863.htm' }
    ]
  },
  'BRA|Lula (1º e 2º)': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Lula_-_foto_oficial_-_05-01-2007_%28cropped%29.jpg/120px-Lula_-_foto_oficial_-_05-01-2007_%28cropped%29.jpg',
    decrees: [
      { title: 'Lei 10.836/2004 — Bolsa Família', url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10836.htm' },
      { title: 'Lei 11.947/2009 — Alimentação escolar', url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l11947.htm' },
      { title: 'Lei 12.187/2009 — Política sobre mudança do clima', url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12187.htm' }
    ]
  },
  'BRA|Lula (3º)': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Lula_-_foto_oficial_-_14-01-2023_%28cropped%29.jpg/120px-Lula_-_foto_oficial_-_14-01-2023_%28cropped%29.jpg',
    decrees: [
      { title: 'Lei 14.601/2023 — Minha Casa Minha Vida', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14601.htm' },
      { title: 'Decreto 11.150/2022 — PAC retomado', url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/decreto/d11150.htm' }
    ]
  },
  'BRA|Dilma Rousseff': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Dilma_Rousseff_2015.jpg/120px-Dilma_Rousseff_2015.jpg',
    decrees: [
      { title: 'Lei 12.715/2012 — PAC 2', url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12715.htm' },
      { title: 'MP 579/2012 — Redução energia', url: 'https://www.planalto.gov.br/ccivil_03/mpv/Antigas/579.htm' }
    ]
  },
  'BRA|Michel Temer': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Michel_Temer_%28cropped%29.jpg/120px-Michel_Temer_%28cropped%29.jpg',
    decrees: [
      { title: 'Emenda Constitucional 95 — Teto de gastos', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc95.htm' },
      { title: 'Lei 13.467/2017 — Reforma trabalhista', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13467.htm' }
    ]
  },
  'BRA|Jair Bolsonaro': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Jair_Bolsonaro_2019.jpg/120px-Jair_Bolsonaro_2019.jpg',
    decrees: [
      { title: 'Emenda Constitucional 103 — Reforma Previdência', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc103.htm' },
      { title: 'Lei 13.982/2020 — Auxílio emergencial', url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l13982.htm' }
    ]
  },
  'BRA|Itamar Franco': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Itamar_Franco_1992.jpg/120px-Itamar_Franco_1992.jpg',
    decrees: [
      { title: 'Lei 8.880/1994 — URV / Plano Real', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8880.htm' }
    ]
  },
  'ITA|Berlusconi (vários)': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Silvio_Berlusconi_2010.jpg/120px-Silvio_Berlusconi_2010.jpg',
    decrees: [
      { title: 'Legge 311/2004 — Riforma fiscale', url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2004-12-30;311' },
      { title: 'Decreto Legge 138/2011 — Austerity', url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2011-08-13;138' }
    ]
  },
  'ITA|Giorgia Meloni': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Giorgia_Meloni_2023.jpg/120px-Giorgia_Meloni_2023.jpg',
    decrees: [
      { title: 'PNRR Italia — Decreto 77/2021', url: 'https://www.italia.it/it/italia-pnrr' }
    ]
  },
  'ITA|Mario Monti': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mario_Monti_2012.jpg/120px-Mario_Monti_2012.jpg',
    decrees: [
      { title: 'Legge 214/2011 — Salva Italia', url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2011-12-22;214' }
    ]
  },
  'USA|Barack Obama': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/120px-President_Barack_Obama.jpg',
    decrees: [
      { title: 'American Recovery Act 2009', url: 'https://www.congress.gov/bill/111th-congress/house-bill/1' },
      { title: 'Affordable Care Act 2010', url: 'https://www.healthcare.gov/aca/' }
    ]
  },
  'USA|Joe Biden': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Joe_Biden_presidential_portrait.jpg/120px-Joe_Biden_presidential_portrait.jpg',
    decrees: [
      { title: 'Inflation Reduction Act 2022', url: 'https://www.congress.gov/bill/117th-congress/house-bill/5376' },
      { title: 'CHIPS and Science Act 2022', url: 'https://www.congress.gov/bill/117th-congress/house-bill/4346' }
    ]
  },
  'PRT|António Costa': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Ant%C3%B3nio_Costa_2016.jpg/120px-Ant%C3%B3nio_Costa_2016.jpg',
    decrees: [
      { title: 'Lei 42/2016 — Orçamento Estado', url: 'https://dre.pt/' }
    ]
  },
  'ARG|Javier Milei': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Javier_Milei_2023.jpg/120px-Javier_Milei_2023.jpg',
    decrees: [
      { title: 'DNU 70/2023 — Desregulación', url: 'https://www.boletinoficial.gob.ar/' }
    ]
  }
};

/* Fotos: arquivo local (quando baixado) + URL Wikipedia + título para busca API */
const LEADER_PHOTO_REGISTRY = {
  'BRA|Jânio Quadros': { local: 'assets/leaders/janio_quadros.jpg', wiki: 'Jânio Quadros', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/J%C3%A2nio_Quadros%2C_presidente_do_Brasil_em_1961_%28foto_oficial%29.jpg/250px-J%C3%A2nio_Quadros%2C_presidente_do_Brasil_em_1961_%28foto_oficial%29.jpg' },
  'BRA|João Goulart': { local: 'assets/leaders/joao_goulart.jpg', wiki: 'João Goulart', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Jo%C3%A3o_%E2%80%9CJango%E2%80%9D_Goulart%2C_Presidente_do_Brasil%2C_foto_oficial%2C_1961.jpg/250px-Jo%C3%A3o_%E2%80%9CJango%E2%80%9D_Goulart%2C_Presidente_do_Brasil%2C_foto_oficial%2C_1961.jpg' },
  'BRA|Castelo Branco': { wiki: 'Humberto de Alencar Castelo Branco', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Humberto_de_Alencar_Castelo_Branco.jpg/250px-Humberto_de_Alencar_Castelo_Branco.jpg' },
  'BRA|Emílio Médici': { local: 'assets/leaders/emilio_medici.jpg', wiki: 'Emílio Garrastazu Médici', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Em%C3%ADlio_Garrastazu_M%C3%A9dici%2C_presidente_da_Rep%C3%BAblica._%28cropped_and_contrast_enhanced%29.tif/lossy-page1-250px-Em%C3%ADlio_Garrastazu_M%C3%A9dici%2C_presidente_da_Rep%C3%BAblica._%28cropped_and_contrast_enhanced%29.tif.jpg' },
  'BRA|Ernesto Geisel': { local: 'assets/leaders/ernesto_geisel.jpg', wiki: 'Ernesto Geisel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Foto_oficial_do_presidente_Ernesto_Geisel.png/250px-Foto_oficial_do_presidente_Ernesto_Geisel.png' },
  'BRA|João Figueiredo': { wiki: 'João Figueiredo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Jo%C3%A3o_Figueiredo_%28color%29.jpg/250px-Jo%C3%A3o_Figueiredo_%28color%29.jpg' },
  'BRA|José Sarney': { wiki: 'José Sarney', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jos%C3%A9_Sarney_2019.jpg/250px-Jos%C3%A9_Sarney_2019.jpg' },
  'BRA|Fernando Collor': { wiki: 'Fernando Collor', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Fernando_Collor_%28cropped%29.jpg/250px-Fernando_Collor_%28cropped%29.jpg' },
  'BRA|Itamar Franco': { wiki: 'Itamar Franco', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Itamar_Franco_1992.jpg/250px-Itamar_Franco_1992.jpg' },
  'BRA|Fernando Henrique Cardoso': { wiki: 'Fernando Henrique Cardoso', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Fernando_Henrique_Cardoso_1999.jpg/250px-Fernando_Henrique_Cardoso_1999.jpg' },
  'BRA|Lula (1º e 2º)': { wiki: 'Luiz Inácio Lula da Silva', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Lula_-_foto_oficial_-_05-01-2007_%28cropped%29.jpg/250px-Lula_-_foto_oficial_-_05-01-2007_%28cropped%29.jpg' },
  'BRA|Dilma Rousseff': { wiki: 'Dilma Rousseff', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Dilma_Rousseff_2015.jpg/250px-Dilma_Rousseff_2015.jpg' },
  'BRA|Michel Temer': { wiki: 'Michel Temer', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Michel_Temer_%28cropped%29.jpg/250px-Michel_Temer_%28cropped%29.jpg' },
  'BRA|Jair Bolsonaro': { wiki: 'Jair Bolsonaro', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Jair_Bolsonaro_2019.jpg/250px-Jair_Bolsonaro_2019.jpg' },
  'BRA|Lula (3º)': { wiki: 'Luiz Inácio Lula da Silva', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Lula_-_foto_oficial_-_14-01-2023_%28cropped%29.jpg/250px-Lula_-_foto_oficial_-_14-01-2023_%28cropped%29.jpg' },
  'USA|JFK': { wiki: 'John F. Kennedy', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/John_F._Kennedy%2C_White_House_color_photo_portrait.jpg/250px-John_F._Kennedy%2C_White_House_color_photo_portrait.jpg' },
  'USA|Lyndon Johnson': { wiki: 'Lyndon B. Johnson', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Lyndon_B._Johnson%2C_36th_President_of_the_United_States%2C_head_and_shoulders_photo_portrait.jpg/250px-Lyndon_B._Johnson%2C_36th_President_of_the_United_States%2C_head_and_shoulders_photo_portrait.jpg' },
  'USA|Richard Nixon': { wiki: 'Richard Nixon', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nixon.jpeg/250px-Nixon.jpeg' },
  'USA|Ronald Reagan': { wiki: 'Ronald Reagan', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Portrait_of_President_Reagan_1981.jpg/250px-Official_Portrait_of_President_Reagan_1981.jpg' },
  'USA|Bill Clinton': { wiki: 'Bill Clinton', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bill_Clinton.jpg/250px-Bill_Clinton.jpg' },
  'USA|George W. Bush': { wiki: 'George W. Bush', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/George-W-Bush.jpeg/250px-George-W-Bush.jpeg' },
  'USA|Barack Obama': { wiki: 'Barack Obama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/250px-President_Barack_Obama.jpg' },
  'USA|Donald Trump': { wiki: 'Donald Trump', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/250px-Donald_Trump_official_portrait.jpg' },
  'USA|Joe Biden': { wiki: 'Joe Biden', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Joe_Biden_presidential_portrait.jpg/250px-Joe_Biden_presidential_portrait.jpg' },
  'ITA|Aldo Moro': { wiki: 'Aldo Moro', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Aldo_Moro_1968.jpg/250px-Aldo_Moro_1968.jpg' },
  'ITA|Berlusconi (vários)': { wiki: 'Silvio Berlusconi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Silvio_Berlusconi_2010.jpg/250px-Silvio_Berlusconi_2010.jpg' },
  'ITA|Mario Monti': { wiki: 'Mario Monti', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mario_Monti_2012.jpg/250px-Mario_Monti_2012.jpg' },
  'ITA|Matteo Renzi': { wiki: 'Matteo Renzi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Matteo_Renzi_2014.jpg/250px-Matteo_Renzi_2014.jpg' },
  'ITA|Giorgia Meloni': { wiki: 'Giorgia Meloni', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Giorgia_Meloni_2023.jpg/250px-Giorgia_Meloni_2023.jpg' },
  'ESP|Franco (fim)': { wiki: 'Francisco Franco', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Franco_en_Color.jpg/250px-Franco_en_Color.jpg' },
  'ESP|Felipe González': { wiki: 'Felipe González', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Felipe_Gonz%C3%A1lez_2014.jpg/250px-Felipe_Gonz%C3%A1lez_2014.jpg' },
  'ESP|José María Aznar': { wiki: 'José María Aznar', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jos%C3%A9_Mar%C3%ADa_Aznar_2003.jpg/250px-Jos%C3%A9_Mar%C3%ADa_Aznar_2003.jpg' },
  'ESP|Zapatero': { wiki: 'José Luis Rodríguez Zapatero', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zapatero_2011.jpg/250px-Zapatero_2011.jpg' },
  'ESP|Rajoy / Sánchez': { wiki: 'Pedro Sánchez', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Pedro_S%C3%A1nchez_2023.jpg/250px-Pedro_S%C3%A1nchez_2023.jpg' },
  'PRT|Mário Soares': { wiki: 'Mário Soares', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/M%C3%A1rio_Soares_2006.jpg/250px-M%C3%A1rio_Soares_2006.jpg' },
  'PRT|Durão Barroso / Sócrates': { wiki: 'José Sócrates', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Jos%C3%A9_S%C3%B3crates_2010.jpg/250px-Jos%C3%A9_S%C3%B3crates_2010.jpg' },
  'PRT|António Costa': { wiki: 'António Costa', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Ant%C3%B3nio_Costa_2016.jpg/250px-Ant%C3%B3nio_Costa_2016.jpg' },
  'DEU|Konrad Adenauer': { wiki: 'Konrad Adenauer', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Konrad_Adenauer.jpg/250px-Konrad_Adenauer.jpg' },
  'DEU|Willy Brandt': { wiki: 'Willy Brandt', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Willy_Brandt_1969.jpg/250px-Willy_Brandt_1969.jpg' },
  'DEU|Gerhard Schröder': { wiki: 'Gerhard Schröder', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gerhard_Schr%C3%B6der_2005.jpg/250px-Gerhard_Schr%C3%B6der_2005.jpg' },
  'DEU|Angela Merkel': { wiki: 'Angela Merkel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Angela_Merkel_2019.jpg/250px-Angela_Merkel_2019.jpg' },
  'DEU|Olaf Scholz': { wiki: 'Olaf Scholz', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Olaf_Scholz_2021.jpg/250px-Olaf_Scholz_2021.jpg' },
  'FRA|Charles de Gaulle': { wiki: 'Charles de Gaulle', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Charles_de_Gaulle-1963.jpg/250px-Charles_de_Gaulle-1963.jpg' },
  'FRA|François Mitterrand': { wiki: 'François Mitterrand', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Fran%C3%A7ois_Mitterrand_1984.jpg/250px-Fran%C3%A7ois_Mitterrand_1984.jpg' },
  'FRA|Jacques Chirac': { wiki: 'Jacques Chirac', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jacques_Chirac_1997.jpg/250px-Jacques_Chirac_1997.jpg' },
  'FRA|Emmanuel Macron': { wiki: 'Emmanuel Macron', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Emmanuel_Macron_2023.jpg/250px-Emmanuel_Macron_2023.jpg' },
  'GBR|Harold Wilson': { wiki: 'Harold Wilson', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Harold_Wilson.jpg/250px-Harold_Wilson.jpg' },
  'GBR|Margaret Thatcher': { wiki: 'Margaret Thatcher', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Margaret_Thatcher_stock_portrait_%28cropped%29.jpg/250px-Margaret_Thatcher_stock_portrait_%28cropped%29.jpg' },
  'GBR|Tony Blair': { wiki: 'Tony Blair', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Tony_Blair_2010.jpg/250px-Tony_Blair_2010.jpg' },
  'GBR|Brexit era (May/Johnson)': { wiki: 'Boris Johnson', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Boris_Johnson_official_portrait.jpg/250px-Boris_Johnson_official_portrait.jpg' },
  'ARG|Javier Milei': { wiki: 'Javier Milei', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Javier_Milei_2023.jpg/250px-Javier_Milei_2023.jpg' },
  'ARG|Macri / Fernández': { wiki: 'Alberto Fernández', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Alberto_Fern%C3%A1ndez_2019.jpg/250px-Alberto_Fern%C3%A1ndez_2019.jpg' },
  'ARG|Kirchnerismo': { wiki: 'Cristina Fernández de Kirchner', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cristina_Fern%C3%A1ndez_de_Kirchner_2011.jpg/250px-Cristina_Fern%C3%A1ndez_de_Kirchner_2011.jpg' },
  'ARG|Menem': { wiki: 'Carlos Menem', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carlos_Menem_1995.jpg/250px-Carlos_Menem_1995.jpg' },
  'CHN|Xi Jinping': { wiki: 'Xi Jinping', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Xi_Jinping_2019.jpg/250px-Xi_Jinping_2019.jpg' },
  'CHN|Deng Xiaoping': { wiki: 'Deng Xiaoping', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Deng_Xiaoping_at_the_arrival_ceremony_for_the_Vice_Premier_of_China_%28cropped%29.jpg/250px-Deng_Xiaoping_at_the_arrival_ceremony_for_the_Vice_Premier_of_China_%28cropped%29.jpg' },
  'IND|Modi': { wiki: 'Narendra Modi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Shri_Narendra_Modi%2C_Prime_Minister_of_India.jpg/250px-Shri_Narendra_Modi%2C_Prime_Minister_of_India.jpg' },
  'JPN|Abe Shinzo': { wiki: 'Shinzo Abe', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Shinzo_Abe_2020.jpg/250px-Shinzo_Abe_2020.jpg' }
};

/* Ministros e feitos agrupados por pasta ministerial */
const LEADER_MINISTRIES = {
  'BRA|Jânio Quadros': [
    { ministry: 'Fazenda', names: ['Eugênio Gudin'], achievements: ['Austeridade fiscal inicial', 'Tentativa de frear inflação com cortes de gastos'] },
    { ministry: 'Relações Exteriores', names: ['Afonso Arinos de Melo Franco'], achievements: ['Política externa independente', 'Reconhecimento da China Popular'] }
  ],
  'BRA|João Goulart': [
    { ministry: 'Fazenda', names: ['Walter Moreira Sales'], achievements: ['Reforma tributária proposta', 'Controle de remessas de lucros ao exterior'] },
    { ministry: 'Planejamento', names: ['Celso Furtado'], achievements: ['Reformas de base no Nordeste', 'Programa de desenvolvimento regional'] },
    { ministry: 'Trabalho', names: ['Almir Pazzianotto Pinto'], achievements: ['Projeto de extensão do voto aos analfabetos', 'Reivindicações sindicais amplificadas'] }
  ],
  'BRA|Castelo Branco': [
    { ministry: 'Fazenda', names: ['Octávio Gouveia de Bulhões'], achievements: ['Austeridade pós-golpe', 'Congelamento salarial via AIs'] },
    { ministry: 'Planejamento', names: ['Hélio Beltrão'], achievements: ['II PND estruturado', 'Prioridade a infraestrutura e energia'] },
    { ministry: 'Agricultura', names: ['Alysson Paolinelli'], achievements: ['Crédito rural ampliado', 'Expansão da fronteira agrícola'] }
  ],
  'BRA|Emílio Médici': [
    { ministry: 'Fazenda', names: ['Mário Henrique Simonsen'], achievements: ['“Milagre econômico” — PIB ~10%/ano', 'Incentivo a multinacionais'] },
    { ministry: 'Planejamento', names: ['João Paulo dos Reis Velloso'], achievements: ['Grandes obras (Transamazônica, Itaipu)', 'PIB industrial acelerado'] },
    { ministry: 'Obras Públicas', names: ['Pedro Aleixo / successoras'], achievements: ['Rodovias e hidrelétricas', 'Urbanização acelerada'] }
  ],
  'BRA|Ernesto Geisel': [
    { ministry: 'Fazenda', names: ['Mário Henrique Simonsen → Antônio Delfim Netto'], achievements: ['Delfim: “milagre” fiscal com indexação', 'Controle de déficit público'] },
    { ministry: 'Planejamento', names: ['João Paulo dos Reis Velloso'], achievements: ['II PND — petroquímica e nuclear', 'Substituição de importações'] },
    { ministry: 'Indústria', names: ['Luis César Ramos'], achievements: ['Abertura lenta ao capital estrangeiro', 'Modernização do parque industrial'] }
  ],
  'BRA|João Figueiredo': [
    { ministry: 'Fazenda', names: ['Kandir Vagas Tabak'], achievements: ['Pré-Plano Cruzado — indexação generalizada', 'Dívida externa crescente'] },
    { ministry: 'Planejamento', names: ['Reis Velloso'], achievements: ['Transição política “abertura”', 'Obras de infraestrutura desaceleradas'] },
    { ministry: 'Justiça', names: ['Ibrahim Abi-Ackel → Alfredo Buzaid'], achievements: ['Lei de Anistia 1979', 'Preparação da redemocratização'] }
  ],
  'BRA|José Sarney': [
    { ministry: 'Fazenda', names: ['Dílson Funaro → Luiz Carlos Bresser Pereira'], achievements: ['Plano Cruzado (1986)', 'Plano Bresser e Verão — falha contra inflação'] },
    { ministry: 'Planejamento', names: ['João Paulo dos Reis Velloso'], achievements: ['Congelamento de preços Cruzado', 'Confisco da poupança ao descongelar'] },
    { ministry: 'Saúde', names: ['Waldir Pires'], achievements: ['SUS estruturado na Constituição 1988', 'Expansão de cobertura pública'] }
  ],
  'BRA|Fernando Collor': [
    { ministry: 'Fazenda', names: ['Zélia Cardoso de Mello'], achievements: ['Plano Collor — confisco CPMF', 'Abertura comercial agressiva'] },
    { ministry: 'Economia', names: ['Zélia → Marcílio Marques Moreira'], achievements: ['Privatizações iniciais', 'Liberalização de importações'] },
    { ministry: 'Indústria', names: ['Dorothea Werneck'], achievements: ['Desmonte de proteção industrial', 'Fusões e aquisições estrangeiras'] }
  ],
  'BRA|Itamar Franco': [
    { ministry: 'Fazenda', names: ['Fernando Henrique Cardoso'], achievements: ['URV e Plano Real (1994)', 'Nova moeda estável — fim da hiperinflação'] },
    { ministry: 'Relações Exteriores', names: ['Celso Amorim'], achievements: ['Estabilização diplomática pós-Collor', 'Integração Mercosul consolidada'] },
    { ministry: 'Saúde', names: ['Adib Jatene'], achievements: ['Regulamentação inicial do SUS', 'Programas de vacinação ampliados'] }
  ],
  'BRA|Fernando Henrique Cardoso': [
    { ministry: 'Fazenda', names: ['Pedro Malan'], achievements: ['Plano Real consolidado', 'Metas de inflação <10%/ano'] },
    { ministry: 'Privatizações', names: ['Aloizio Mercadante (coord.) / BNDES'], achievements: ['Telecom, mineração, energia privatizadas', 'Real forte e importações baratas'] },
    { ministry: 'Desenvolvimento Social', names: ['Eduardo Matarazzo Suplicy'], achievements: ['Bolsa Escola — precursor do Bolsa Família', 'Renda mínima proposta'] }
  ],
  'BRA|Lula (1º e 2º)': [
    { ministry: 'Fazenda', names: ['Antônio Palocci → Guido Mantega'], achievements: ['Superávit primário inicial', 'Acumulação de reservas cambiais recorde'] },
    { ministry: 'Desenvolvimento Social', names: ['Patrus Ananias → Tereza Campello'], achievements: ['Bolsa Família — 12 milhões de famílias', 'Fome Zero e PAA'] },
    { ministry: 'Cidades', names: ['Olívio Dutra → Márcio Fortes'], achievements: ['PAC — infraestrutura urbana', 'Minha Casa Minha Vida (início)'] },
    { ministry: 'Saúde', names: ['José Gomes Temporão'], achievements: ['Mais Médicos (planejamento)', 'Expansão do SUS e farmácia popular'] }
  ],
  'BRA|Dilma Rousseff': [
    { ministry: 'Fazenda', names: ['Guido Mantega'], achievements: ['Controle de preços (energia, combustível)', 'Crédito subsidiado BNDES'] },
    { ministry: 'Planejamento', names: ['Miriam Belchior'], achievements: ['PAC 2 — R$ 1 tri em obras', 'Custo Brasil em infraestrutura'] },
    { ministry: 'Minas e Energia', names: ['Edison Lobão'], achievements: ['MP 579 — corte tarifário de energia', 'Pré-sal e Petrobras em expansão'] }
  ],
  'BRA|Michel Temer': [
    { ministry: 'Fazenda', names: ['Henrique Meirelles'], achievements: ['Teto de gastos (EC 95)', 'Reforma trabalhista aprovada'] },
    { ministry: 'Planejamento', names: ['Dyogo Oliveira'], achievements: ['Ajuste fiscal pós-impeachment', 'Privatizações Eletrobras (início)'] },
    { ministry: 'Trabalho', names: ['Ronaldo Nogueira'], achievements: ['Lei 13.467/2017 — reforma trabalhista', 'Prevalência de contratos intermitentes'] }
  ],
  'BRA|Jair Bolsonaro': [
    { ministry: 'Economia', names: ['Paulo Guedes'], achievements: ['Reforma da Previdência (EC 103)', 'Marco legal do saneamento'] },
    { ministry: 'Cidadania', names: ['Onyx Lorenzoni → João Roma'], achievements: ['Auxílio emergencial R$ 600', 'Ampliação temporária do Bolsa Família'] },
    { ministry: 'Infraestrutura', names: ['Tarcísio de Freitas'], achievements: ['Concessões rodoviárias e portuárias', 'Leilões de aeroportos'] }
  ],
  'BRA|Lula (3º)': [
    { ministry: 'Fazenda', names: ['Fernando Haddad'], achievements: ['Marco fiscal aprovado', 'Reforma tributária (transição IVA)'] },
    { ministry: 'Desenvolvimento Social', names: ['Wellington Dias'], achievements: ['Bolsa Família R$ 600', 'Busca Ativa no cadastro único'] },
    { ministry: 'Transportes', names: ['Renan Filho'], achievements: ['PAC retomado — R$ 1,7 tri', 'Obras em estradas e habitação'] }
  ],
  'ITA|Giorgia Meloni': [
    { ministry: 'Economia', names: ['Giancarlo Giorgetti'], achievements: ['PNRR italiano — fundos UE pós-COVID', 'Flat tax ampliado para autônomos'] },
    { ministry: 'Trabalho', names: ['Marina Calderone'], achievements: ['Reforma contratos precários', 'Salário mínimo por convenção'] },
    { ministry: 'Infraestruturas', names: ['Matteo Salvini'], achievements: ['Pontes e ferrovias PNRR', 'Portos do sul'] }
  ],
  'USA|Joe Biden': [
    { ministry: 'Tesouro', names: ['Janet Yellen'], achievements: ['Inflation Reduction Act', 'Estabilização pós-COVID'] },
    { ministry: 'Comércio', names: ['Gina Raimondo'], achievements: ['CHIPS Act — semicondutores', 'Reshoring manufatura'] },
    { ministry: 'Trabalho', names: ['Marty Walsh → Julie Su'], achievements: ['Emprego pleno recuperado', 'Salário mínimo federal em debate'] }
  ],
  'ARG|Javier Milei': [
    { ministry: 'Economia', names: ['Luis Caputo'], achievements: ['DNU desregulação massiva', 'Superávit fiscal mensal'] },
    { ministry: 'Desregulação', names: ['Federico Sturzenegger'], achievements: ['Eliminação de órgãos públicos', 'Liberalização de preços'] },
    { ministry: 'Relações Exteriores', names: ['Diana Mondino'], achievements: ['Realinhamento com EUA/Israel', 'Renegociação FMI'] }
  ]
};

function getLeaderExtra(code, name) {
  return LEADER_EXTRA[code + '|' + name] || null;
}

function leaderKey(code, name) {
  return code + '|' + name;
}

function getLeaderPhotoSrc(code, name) {
  const key = leaderKey(code, name);
  const cached = typeof LeaderDB !== 'undefined' ? LeaderDB.getPhoto(key) : null;
  if (cached) return cached;
  const reg = LEADER_PHOTO_REGISTRY[key];
  const ex = getLeaderExtra(code, name);
  if (ex && ex.photo) return ex.photo;
  if (reg && reg.url) return reg.url;
  if (reg && reg.local) return reg.local;
  return null;
}

async function fetchWikiLeaderPhoto(wikiTitle) {
  if (!wikiTitle) return null;
  const api = 'https://pt.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(wikiTitle) + '&prop=pageimages&format=json&pithumbsize=200&origin=*';
  try {
    const r = await fetch(api);
    if (!r.ok) return null;
    const j = await r.json();
    const pages = j.query && j.query.pages;
    if (!pages) return null;
    for (const id of Object.keys(pages)) {
      if (pages[id].thumbnail && pages[id].thumbnail.source) return pages[id].thumbnail.source;
    }
  } catch (e) { /* offline */ }
  const apiEn = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(wikiTitle) + '&prop=pageimages&format=json&pithumbsize=200&origin=*';
  try {
    const r = await fetch(apiEn);
    if (!r.ok) return null;
    const j = await r.json();
    const pages = j.query && j.query.pages;
    if (!pages) return null;
    for (const id of Object.keys(pages)) {
      if (pages[id].thumbnail && pages[id].thumbnail.source) return pages[id].thumbnail.source;
    }
  } catch (e) { /* offline */ }
  return null;
}

function leaderPhotoLoaded(img) {
  const key = img.getAttribute('data-key');
  if (!key || !img.src || img.src.indexOf('data:') === 0) return;
  if (typeof LeaderDB !== 'undefined') LeaderDB.setPhoto(key, img.src, img.src.indexOf('assets/') === 0 ? 'local' : 'wiki');
}

function leaderPhotoError(img, wikiTitle) {
  if (img.dataset.retry) return;
  img.dataset.retry = '1';
  const key = img.getAttribute('data-key');
  const reg = key ? LEADER_PHOTO_REGISTRY[key] : null;
  const wiki = wikiTitle || img.getAttribute('data-wiki') || (reg && reg.wiki) || '';
  fetchWikiLeaderPhoto(wiki).then(url => {
    if (url) {
      img.src = url;
      img.classList.remove('leader-photo-pending');
      if (key && typeof LeaderDB !== 'undefined') LeaderDB.setPhoto(key, url, 'wiki');
    }
  });
}

function leaderPhotoHtml(code, name) {
  const key = leaderKey(code, name);
  const reg = LEADER_PHOTO_REGISTRY[key] || {};
  const src = getLeaderPhotoSrc(code, name);
  const wiki = reg.wiki || name;
  const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#1a1a1a" width="64" height="64"/><text x="32" y="38" text-anchor="middle" fill="#555" font-size="11" font-family="sans-serif">…</text></svg>');
  const url = src || placeholder;
  const pending = src ? '' : ' leader-photo-pending';
  return '<img class="leader-photo' + pending + '" src="' + url + '" alt="' + name + '" loading="lazy" decoding="async" data-key="' + key + '" data-wiki="' + wiki.replace(/"/g, '') + '" onload="leaderPhotoLoaded(this)" onerror="leaderPhotoError(this)">';
}

function prefetchLeaderPhotos(code) {
  (LEADERS[code] || []).forEach(l => {
    const key = leaderKey(code, l.name);
    if (typeof LeaderDB !== 'undefined' && LeaderDB.getPhoto(key)) return;
    const src = getLeaderPhotoSrc(code, l.name);
    if (src) {
      if (typeof LeaderDB !== 'undefined') LeaderDB.setPhoto(key, src, src.indexOf('assets/') === 0 ? 'local' : 'wiki');
      return;
    }
    const reg = LEADER_PHOTO_REGISTRY[key];
    if (!reg || !reg.wiki) return;
    fetchWikiLeaderPhoto(reg.wiki).then(url => {
      if (!url) return;
      if (typeof LeaderDB !== 'undefined') LeaderDB.setPhoto(key, url, 'wiki');
      document.querySelectorAll('.leader-photo[data-key="' + key + '"]').forEach(img => {
        img.src = url;
        img.classList.remove('leader-photo-pending');
      });
    });
  });
}

function renderMinistriesHtml(code, name) {
  const list = LEADER_MINISTRIES[leaderKey(code, name)];
  if (!list || !list.length) return '';
  let html = '<div class="leader-ministries"><span class="leader-label">Ministros e feitos por ministério</span>';
  list.forEach(m => {
    html += '<div class="ministry-block"><div class="ministry-head"><strong>' + m.ministry + '</strong>';
    if (m.names && m.names.length) html += '<span class="ministry-names">' + m.names.join(' · ') + '</span>';
    html += '</div><ul>';
    (m.achievements || []).forEach(a => html += '<li>' + a + '</li>');
    html += '</ul></div>';
  });
  html += '</div>';
  return html;
}

