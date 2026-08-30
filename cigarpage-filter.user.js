// ==UserScript==
// @name         CigarPage Multi-Filter
// @namespace    cigarpage-filter
// @version      1.7.0
// @description  Floating filter panel for cigarpage.com (grid tables + grouped deal items) — filter by price, gauge, length, Brand, and Pack; brands fold to their parent house so each product belongs to exactly one brand (title first, description as fallback); right-click a brand to preview or permanently purge it
// @author       Shmshka
// @match        https://www.cigarpage.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'cigarpage-filter-state';

  const TAB_CONFIG = [
    { id: 'general', label: 'General', type: 'range'    },
    { id: 'brand',   label: 'Brand',   type: 'checkbox' },
    { id: 'pack',    label: 'Packaging', type: 'checkbox' },
  ];

  const RANGE_CONFIG = [
    {
      id: 'price',
      label: 'Price',
      dataKey: 'price',
      minKey: 'priceMin',
      maxKey: 'priceMax',
      stateKey: 'priceRange',
      step: 0.25,
      format: value => '$' + value.toFixed(2),
    },
    {
      id: 'gauge',
      label: 'Gauge',
      dataKey: 'sizeGauge',
      minKey: 'gaugeMin',
      maxKey: 'gaugeMax',
      stateKey: 'gaugeRange',
      step: 1,
      format: value => String(value),
    },
    {
      id: 'length',
      label: 'Length',
      dataKey: 'sizeLength',
      minKey: 'lengthMin',
      maxKey: 'lengthMax',
      stateKey: 'lengthRange',
      step: 0.05,
      format: value => Number(value.toFixed(2)).toString() + '"',
    },
  ];

  const CHECKBOX_TABS = TAB_CONFIG.filter(tab => tab.type === 'checkbox');

  const KNOWN_BRANDS = [
    '1875 Romeo y Julieta',
    '601',
    'A. Flores',
    'ACID',
    'Aganorsa Leaf',
    'Aging Room',
    'Airliner',
    'AJ Fernandez',
    'Aksum',
    'Aladino',
    'Alec Bradley',
    'All Saints',
    'Angelenos',
    'Antihero',
    'Antonio y Cleopatra',
    'Arturo Fuente',
    'Ashton',
    'Asylum',
    'Avanti',
    'Avo',
    'Baccarat',
    'Back Forty',
    'Backwoods',
    'BDL',
    'Big House',
    'Black & Mild',
    'Black Label Trading Co.',
    'Black Works Studio',
    'Blackened',
    'Blackened by Drew Estate',
    'Blackstone',
    'Blackwatch',
    'Bolivar',
    'Brick House',
    'Buena Vista',
    'Cain',
    'Caldwell',
    'Camacho',
    'CAO',
    'Casa 1910',
    'Casa Fernandez',
    'Casa Magna',
    'Casa Turrent',
    'Cavalier',
    'Charter Oak',
    'Chateau Real',
    'Chillin\' Moose',
    'Class 34',
    'CLE',
    'Cohiba',
    'Crowned Heads',
    'Crux',
    'Cuba Aliados',
    'Cuesta Rey',
    'Cumbal',
    'Curivari',
    'Cusano',
    'Dapper',
    'Davidoff',
    'DBL',
    'De Nobili',
    'Deadwood',
    'Diamond Crown',
    'Diesel',
    'Dissident',
    'Don Diego',
    'Don Duarte',
    'Don Elias',
    'Don Felix',
    'Don Pepin',
    'Don Pepin Garcia',
    'Drew Estate',
    'Dunbarton',
    'Dutch Masters',
    'E.P. Carrillo',
    'Eiroa',
    'El Baton',
    'El Coto',
    'El Galan',
    'El Mago',
    'El Pulpo',
    'El Rey del Mundo',
    'El Septimo',
    'El Titan de Bronze',
    'El Viejo Continente',
    'Emilio Cigars',
    'Espinosa',
    'Esteban Carreras',
    'Exactus',
    'Excalibur',
    'Ferio Tego',
    'Flor de las Antillas',
    'Florida Man',
    'Fonseca',
    'Foundation',
    'Fratello',
    'Free Will',
    'Garcia y Vega',
    'Gellis Family Cigars',
    'Gispert',
    'Got Your 6',
    'Gran Cantera',
    'Grande y Gordo',
    'Graycliff',
    'Guardian of the Farm',
    'Gurkha',
    'H. Upmann',
    'Havana Q',
    'Hellas',
    'Henry Clay',
    'Herederos',
    'Herrera Esteli',
    'Hombre de Oro',
    'Hondurenos',
    'Hoofty',
    'Hooten Young',
    'Hoyo de Monterrey',
    'Hoyo La Amistad',
    'HVC',
    'Illusione',
    'Jaime Garcia',
    'Jas Sum Kral',
    'Java',
    'Jawn',
    'JFR',
    'John Sr.',
    'Joya',
    'Joya de Nicaragua',
    'Kristoff',
    'La Aroma de Cuba',
    'La Aurora',
    'La Flor Dominicana',
    'La Gloria Cubana',
    'La Palina',
    'Last of My Kind',
    'Leaf by Oscar',
    'League of Fat Bastards',
    'Les Deplorables',
    'Liga Privada',
    'Liga Undercrown',
    'Light Me Up',
    'Luciano',
    'Macanudo',
    'Mas Igneus',
    'Mayflower',
    'Megilla',
    'Megilla Miami',
    'Merchants Queen',
    'Montecristo',
    'Montesino',
    'Murcielago',
    'My Father',
    'NF Cigars',
    'Nica Rustica',
    'No Step On Snek',
    'Nub',
    'Odyssey',
    'Oliva',
    'Oliveros',
    'Olmec',
    'Omar Ortez',
    'One More',
    'Onyx',
    'Oscar',
    'OZ Family Cigars',
    'Padilla',
    'Padron',
    'Parodi',
    'Partagas',
    'Patina',
    'PDR',
    'Peggy O\'Neal',
    'Penn Standard',
    'Perdomo',
    'Perla del Mar',
    'Phillies',
    'Pichardo',
    'Pirate\'s Gold',
    'Pirates Gold',
    'Plasencia',
    'Prime Minister',
    'Punch',
    'Pure Craft',
    'Puro Ambar',
    'Puros Indios',
    'Quesada',
    'Quorum',
    'Ramon Allones',
    'Record Bond',
    'Remington Cigars',
    'Roasty Jones',
    'Rocky Patel',
    'Rojas',
    'RoMa Craft',
    'Romeo y Julieta',
    'Room 101',
    'Saint Luis Rey',
    'San Cristobal',
    'Sancho Panza',
    'Sarzedas',
    'Seal of Minneapolis',
    'Sinistro',
    'Southern Draw',
    'Swisher Sweets',
    'Tabak Especial',
    'Tambor Bombero',
    'Tatiana',
    'Tatuaje',
    'Te Amo',
    'Teufel',
    'Texas Toast',
    'The Brand',
    'The Founder',
    'The Griffin\'s',
    'The Tabernacle',
    'The Upsetters',
    'The Wise Man',
    'Toasty Jones',
    'Toscanello',
    'Toscano',
    'Trader Jacks',
    'Trinidad',
    'Unclaimed',
    'Undercrown',
    'Vega Fina',
    'Vega Magna',
    'VegaFina',
    'Villa Vieja',
    'Villiger',
    'Warped',
    'West Tampa',
    'Wynwood Hills',
    'Your Mom',
    'Zino'
  ];

  const defaults = {
    pos: { x: null, y: null },
    collapsed: false,
    activeTab: 'general',
    unchecked: Object.fromEntries(CHECKBOX_TABS.map(t => [t.id, []])),
    purgedBrands: [],
    ignoredBrands: [],
    priceRange: { min: null, max: null },
    gaugeRange: { min: null, max: null },
    lengthRange: { min: null, max: null },
    hideSoldOut: false,
    filtersEnabled: true,
    // Panel font-size scale as a percentage (100 = default).
    fontSize: 100,
  };

  let state = loadState();
  let rowData = new Map();
  let panel = null;
  let tabContents = {};
  let observer = null;
  let previewBrand = null;
  let contextMenu = null;
  let contextMenuBrand = null;
  // null = page order; array = snapshot of the original DOM order while sorted
  let alphabeticalOrder = null;
  // Whether the "Details" action has injected the product details into the rows.
  let detailsExpanded = false;
  let detailsTimer = null;

  state.unchecked = Object.fromEntries(CHECKBOX_TABS.map(t => [t.id, []]));
  if (!Array.isArray(state.purgedBrands)) state.purgedBrands = [];
  if (!Array.isArray(state.ignoredBrands)) state.ignoredBrands = [];
  state.priceRange = { min: null, max: null };
  state.gaugeRange = { min: null, max: null };
  state.lengthRange = { min: null, max: null };
  state.hideSoldOut = false;
  state.filtersEnabled = state.filtersEnabled !== false;
  if (!Number.isFinite(state.fontSize) || state.fontSize < 50 || state.fontSize > 200) state.fontSize = 100;
  if (!TAB_CONFIG.find(t => t.id === state.activeTab)) state.activeTab = 'general';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, defaults, parsed, {
          unchecked: Object.assign({}, defaults.unchecked, parsed.unchecked || {}),
        });
      }
    } catch (_) {}
    return JSON.parse(JSON.stringify(defaults));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Packaging descriptors are case/type normalized so equivalent packagings
  // collapse into one filter value. Any non-box packaging (bundle, pack,
  // sampler, loose cigars, etc.) of N cigars becomes "N Cigars"; BOX packaging
  // stays distinct as "Box of N". So "Bundle of 10" == "10 Cigars" == "10 CIGARS",
  // but neither equals "Box of 10 Cigars".
  function normalizePack(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (!s) return s;
    const lower = s.toLowerCase();
    const isBox = /\bbox\b/.test(lower);
    const countMatch = lower.match(/(\d+)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : null;
    if (isBox) return count !== null ? 'Box of ' + count : 'Box';
    if (count !== null) return count + ' Cigars';
    return null;
  }

  // Extract a packaging descriptor from a deal item's name, which varies:
  // "- 20 Cigars", "20-Cigar Sampler", "40-Cigar Super Set", "6-Cigar Collection",
  // "Box of 10". Returns the canonical value or null when no countable unit.
  function derivePackFromName(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    const isBox = /\bbox\b/.test(lower);
    const m = lower.match(
      /(\d+)\s*[- ]?\s*(?:cigar|pack|sampler|box|bundle)|(?:cigar|pack|sampler|box|bundle)s?\s*of\s*(\d+)/
    );
    const count = m ? parseInt(m[1] || m[2], 10) : null;
    if (isBox) return count !== null ? 'Box of ' + count : 'Box';
    if (count !== null) return count + ' Cigars';
    return null;
  }

  // Drop periods and collapse whitespace so "A. Flores" == "A.Flores" and
  // "AJ Fernandez" == "A.J. Fernandez" when matching.
  function nominalBrand(brand) {
    return brand.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  }

  function buildBrandRegex(brand) {
    const words = nominalBrand(brand).split(' ').filter(Boolean);
    // Between the letters of a word allow optional periods ("A.J." -> "AJ"),
    // and between words allow any run of whitespace/periods ("A. Flores").
    const wordRe = words.map(word =>
      Array.from(word)
        .map((c, i) => (i > 0 ? '\\.?' : '') + escapeRegExp(c))
        .join(''));
    return new RegExp('(^|[^\\w])' + wordRe.join('[\\s.]+') + '($|[^\\w])', 'i');
  }

  // Map a raw brand name as it appears on the page to its canonical brand
  // group. Sub-brands fold into their parent house and never appear as their
  // own group, so a product ends up in exactly one brand.
  const BRAND_FOLD = {
    // Drew Estate — infused/flavored lines
    'ACID': 'Drew Estate (infused)',
    'Deadwood': 'Drew Estate (infused)',
    'Java': 'Drew Estate (infused)',
    'Tabak Especial': 'Drew Estate (infused)',
    'Isla Del Sol': 'Drew Estate (infused)',
    // Drew Estate — premium lines
    'Blackened': 'Drew Estate',
    'Blackened by Drew Estate': 'Drew Estate',
    'Chateau Real': 'Drew Estate',
    'Herrera Esteli': 'Drew Estate',
    'Nica Rustica': 'Drew Estate',
    // Undercrown (Liga Undercrown is part of the Undercrown line)
    'Liga Undercrown': 'Undercrown',
    // Espinosa
    '601': 'Espinosa',
    'Murcielago': 'Espinosa',
    // Foundation
    'Charter Oak': 'Foundation',
    'The Tabernacle': 'Foundation',
    'The Upsetters': 'Foundation',
    'The Wise Man': 'Foundation',
    // Aganorsa Leaf
    'Casa Fernandez': 'Aganorsa Leaf',
    'Guardian of the Farm': 'Aganorsa Leaf',
    'JFR': 'Aganorsa Leaf',
    // Quesada
    'Casa Magna': 'Quesada',
    'Vega Magna': 'Quesada',
    'Fonseca': 'Quesada',
    // Toscano
    'Avanti': 'Toscano',
    'Toscanello': 'Toscano',
    // My Father
    'Flor de las Antillas': 'My Father',
    'Jaime Garcia': 'My Father',
    // Hoyo de Monterrey
    'Excalibur': 'Hoyo de Monterrey',
    'Hoyo La Amistad': 'Hoyo de Monterrey',
    // CLE
    'Hondurenos': 'CLE',
    // Black Label Trading Co.
    'Black Works Studio': 'Black Label Trading Co.',
    // PDR
    'A. Flores': 'PDR',
    // Joya de Nicaragua
    'Joya': 'Joya de Nicaragua',
    // Spelling/shorthand consolidations
    '1875 Romeo y Julieta': 'Romeo y Julieta',
    'Pirates Gold': "Pirate's Gold",
    'Vega Fina': 'VegaFina',
    'Don Pepin': 'Don Pepin Garcia',
    'La Gloria': 'La Gloria Cubana',
  };

  function canonicalBrand(brand) {
    return BRAND_FOLD[brand] || brand;
  }

  // Re-map stored sub-brand names to their canonical group so purges, ignores,
  // and unchecked boxes from a previous version keep working after the fold.
  // Runs once here, after BRAND_FOLD is defined (state was loaded earlier).
  function migrateStoredBrands() {
    const foldList = (list) => {
      if (!Array.isArray(list)) return;
      const mapped = list.map(canonicalBrand).filter(Boolean);
      list.length = 0;
      for (const b of new Set(mapped)) list.push(b);
    };
    foldList(state.purgedBrands);
    foldList(state.ignoredBrands);
    for (const tabId of Object.keys(state.unchecked || {})) {
      foldList(state.unchecked[tabId]);
    }
  }

  // Fold any stored sub-brand names to their canonical groups, then persist the
  // one-time result. Re-folding canonical names is a no-op, so this is safe to
  // run every load.
  migrateStoredBrands();
  saveState();

  // A brand group that acts as an "umbrella" over narrower groups. When both
  // an umbrella name and its sub-line appear in one title, the more specific
  // sub-line wins — so "Drew Estate Undercrown 10" groups as Undercrown, not
  // as the umbrella Drew Estate.
  const GROUP_PARENT = {
    'Drew Estate (infused)': 'Drew Estate',
    'Undercrown': 'Drew Estate',
    'Liga Privada': 'Drew Estate',
  };

  // Returns whether parentGroup is an umbrella (ancestor) of childGroup.
  function isAncestorOf(parentGroup, childGroup) {
    let cur = childGroup;
    while (GROUP_PARENT[cur]) {
      cur = GROUP_PARENT[cur];
      if (cur === parentGroup) return true;
    }
    return false;
  }

  // Extra raw brand names to detect on the page beyond the regular brand
  // names. These are alias/shorthand spellings that fold into a canonical
  // brand above (e.g. bare "La Gloria" means La Gloria Cubana; "Isla Del Sol"
  // is a Drew Estate infused line).
  const BRAND_ALIASES = ['La Gloria', 'Isla Del Sol'];

  // Longest brands first so compound names win over brands they contain
  // (e.g. "Hoyo de Monterrey" before "Hoyo", "Don Pepin Garcia" before "Don").
  // Aliases are appended last so a canonical match always wins when both hit
  // (the canonical matcher is longer and runs first anyway).
  const BRAND_MATCHERS = [
    ...KNOWN_BRANDS
      .sort((a, b) => nominalBrand(b).length - nominalBrand(a).length)
      .map(brand => ({
        raw: brand,
        canonical: canonicalBrand(brand),
        regex: buildBrandRegex(brand),
      })),
    ...BRAND_ALIASES.map(raw => ({
      raw,
      canonical: canonicalBrand(raw),
      regex: buildBrandRegex(raw),
    })),
  ];

  // Returns every raw brand name contained in the text, longest-first with
  // subsumed names dropped. Callers fold these into canonical groups and then
  // pick one primary brand.
  function findBrandsInText(text) {
    if (!text) return [];
    const found = [];
    for (const matcher of BRAND_MATCHERS) {
      if (!matcher.regex.test(text)) continue;
      const raw = matcher.raw;
      // Skip a brand already covered by a matched brand name (a longer name,
      // or the same name matched via an alias such as "La Gloria").
      if (found.some(other => other.includes(raw))) continue;
      found.push(raw);
    }
    return found;
  }

  // Fold raw brand names into distinct canonical groups in encounter order.
  function canonicalizeBrands(rawList) {
    const out = [];
    for (const raw of rawList) {
      const c = canonicalBrand(raw);
      if (!out.includes(c)) out.push(c);
    }
    return out;
  }

  // Resolve a set of raw title matches to exactly one canonical brand. When the
  // title has no brand at all, fall back to the description (a fallback, never
  // an additional source), then to "Unknown". Among competing brands the most
  // specific wins: umbrella groups are dropped when a sub-line is also named,
  // and the longest raw name breaks any remaining tie.
  function resolvePrimaryBrand(rawTitleMatches, rawDescMatches) {
    const raws = rawTitleMatches.length ? rawTitleMatches : rawDescMatches;
    if (raws.length === 0) return 'Unknown';

    const entries = raws.map(raw => ({ raw, group: canonicalBrand(raw) }));

    // Drop an umbrella group when a narrower sub-line is also present.
    const survivors = entries.filter(e =>
      !entries.some(o => o.group !== e.group && isAncestorOf(e.group, o.group)));

    survivors.sort((a, b) => b.raw.length - a.raw.length);
    return survivors[0].group;
  }

  function isBrandPurged(brand) {
    return state.purgedBrands.includes(brand);
  }

  function isBrandIgnored(brand) {
    return state.ignoredBrands.includes(brand);
  }

  // A brand lives in at most one of the two lists — the newest action wins.
  function refreshAfterBrandChange() {
    saveState();
    exitPreview();
    renderTab('brand');
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function purgeBrand(brand) {
    state.ignoredBrands = state.ignoredBrands.filter(b => b !== brand);
    if (!isBrandPurged(brand)) state.purgedBrands.push(brand);
    refreshAfterBrandChange();
  }

  function ignoreBrand(brand) {
    state.purgedBrands = state.purgedBrands.filter(b => b !== brand);
    if (!isBrandIgnored(brand)) state.ignoredBrands.push(brand);
    refreshAfterBrandChange();
  }

  function restoreBrand(brand) {
    state.purgedBrands = state.purgedBrands.filter(b => b !== brand);
    state.ignoredBrands = state.ignoredBrands.filter(b => b !== brand);
    refreshAfterBrandChange();
  }

  function exitPreview() {
    if (previewBrand === null) return;
    previewBrand = null;
    updatePanelPreviewUi();
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function startPreview(brand) {
    previewBrand = brand;
    updatePanelPreviewUi();
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function extractElementData(el) {
    const data = {};
    let name = '';

    if (el.tagName === 'TR') {
      const altName = el.querySelector('.cigar-alt-name');
      name = altName ? altName.textContent.trim() : '';
      const attrRows = el.querySelectorAll('.cigar-attr-row');
      for (const attrRow of attrRows) {
        const label = attrRow.querySelector('.cigar-attr-label');
        if (!label) continue;
        const labelText = label.textContent.trim();
        const valueEl = attrRow.querySelector('.cigar-attr-value');
        switch (labelText) {
          case 'Size':
            if (valueEl) {
              const raw = valueEl.textContent.trim();
              const lenMatch = raw.match(/([\d.]+)"/);
              if (lenMatch) data.sizeLength = parseFloat(lenMatch[1]);
              const gaugeMatch = raw.match(/x\s*(\d+)\s*\)/);
              if (gaugeMatch) data.sizeGauge = parseInt(gaugeMatch[1], 10);
            }
            break;
          case 'Pack':
            if (valueEl) data.pack = normalizePack(valueEl.textContent);
            break;
        }
      }
      data.soldOut = el.querySelector('p.availability.out-of-stock') !== null;
    } else {
      // Grouped deal item (div.default-item) loaded by GroupedLoader AJAX.
      const nameEl = el.querySelector('.item-name');
      name = nameEl ? nameEl.textContent.trim() : '';
      const sizeMatch = name.match(/\((\d+(?:\.\d+)?)"\s*x\s*(\d+)\)/);
      if (sizeMatch) {
        data.sizeLength = parseFloat(sizeMatch[1]);
        data.sizeGauge = parseInt(sizeMatch[2], 10);
      }
      data.pack = derivePackFromName(name);
      data.soldOut = /out of stock/i.test(el.textContent);
    }

    data.name = name;

    const priceSpan = el.querySelector('span.price');
    if (priceSpan) {
      const match = priceSpan.textContent.match(/\$([\d.]+)/);
      if (match) data.price = parseFloat(match[1]);
    }

    // Brand resolution. The title is the source of truth: if it names any
    // brand, we use it and never dig into the description. The description is
    // a fallback only, for products whose title carries no brand.
    const titleRaws = findBrandsInText(name);
    const popover = el.querySelector('.popoverBtn[data-content]');
    const descRaws = popover
      ? findBrandsInText(decodeHtml(popover.getAttribute('data-content') || ''))
      : [];

    // primaryBrand: exactly one group per product, for grouping/filtering/
    // sorting/counts. Resolved from the title first, description as fallback.
    data.primaryBrand = resolvePrimaryBrand(titleRaws, descRaws);

    // brands: the folded brands for purge/ignore rules, which stay bundle-aware
    // so a mixed sampler is still caught when any of its brands is purged.
    data.brands = canonicalizeBrands(
      Array.from(new Set([...titleRaws, ...descRaws]))
    );
    // The product's assigned group must always be in its brand list, otherwise
    // purging the group it belongs to would fail to hide it (brands can end up
    // empty/Unknown on an AJAX rescan even when a title brand resolved).
    if (!data.brands.includes(data.primaryBrand)) data.brands.push(data.primaryBrand);
    if (data.brands.length === 0) data.brands = ['Unknown'];
    return data;
  }

  function getProductRowEntries() {
    const entries = [];
    for (const tr of document.querySelectorAll('table.cigar-grid tbody tr')) {
      entries.push({ el: tr, hideTarget: tr });
    }
    for (const item of document.querySelectorAll('#grouped-items-container .default-item')) {
      if (item.closest('.remove')) continue;
      entries.push({ el: item, hideTarget: item.closest('[class*="col-"]') || item });
    }
    return entries;
  }

  function extractRowData() {
    rowData.clear();
    const rangeStats = new Map(RANGE_CONFIG.map(config => [config.id, {
      min: Infinity,
      max: -Infinity,
    }]));
    for (const entry of getProductRowEntries()) {
      const data = extractElementData(entry.el);
      for (const config of RANGE_CONFIG) {
        const value = data[config.dataKey];
        if (!Number.isFinite(value)) continue;
        const stats = rangeStats.get(config.id);
        if (value < stats.min) stats.min = value;
        if (value > stats.max) stats.max = value;
      }
      rowData.set(entry.el, {
        data,
        hideTarget: entry.hideTarget,
      });
    }
    for (const config of RANGE_CONFIG) {
      const stats = rangeStats.get(config.id);
      state[config.minKey] = stats.min !== Infinity
        ? roundRangeValue(stats.min, config.step, 'down')
        : null;
      state[config.maxKey] = stats.max !== -Infinity
        ? roundRangeValue(stats.max, config.step, 'up')
        : null;
    }
    saveState();
    return rowData.size > 0;
  }

  function roundRangeValue(value, step, direction) {
    const quotient = value / step;
    const epsilon = 1e-9;
    const rounded = direction === 'down'
      ? Math.floor(quotient + epsilon)
      : Math.ceil(quotient - epsilon);
    return Number((rounded * step).toFixed(10));
  }

  function getUniqueValues(tabId) {
    const values = new Set();
    for (const [, entry] of rowData) {
      if (tabId === 'brand') {
        // Each product belongs to exactly one brand group.
        values.add(entry.data.primaryBrand);
        continue;
      }
      const v = entry.data[tabId];
      if (v !== undefined && v !== null && v !== '') values.add(v);
    }
    const sorted = [...values].sort((a, b) => String(a).localeCompare(String(b)));
    return sorted;
  }

  function isTabValueUnchecked(tabId, data) {
    const unchecked = state.unchecked[tabId];
    if (!unchecked || unchecked.length === 0) return false;
    if (tabId === 'brand') {
      // A product lives in exactly one brand group; it hides only when that
      // group is unchecked.
      return unchecked.includes(data.primaryBrand);
    }
    const rowVal = data[tabId];
    if (rowVal === undefined || rowVal === null || rowVal === '') return false;
    return unchecked.includes(rowVal);
  }

  // skipTabId lets count queries exclude one tab's own filter so its
  // checkboxes don't zero out their own counts.
  function rowPassesFilters(data, skipTabId) {
    if (!state.filtersEnabled) return true;
    // Preview focuses a single brand group (the one the product belongs to).
    if (previewBrand !== null && data.primaryBrand !== previewBrand) return false;
    if (previewBrand === null && state.hideSoldOut && data.soldOut) return false;
    // Purged: any match hides the product, even in mixed-brand bundles.
    if (data.brands.some(brand => isBrandPurged(brand))) return false;
    // Ignored: only products made up exclusively of ignored brands are hidden.
    if (data.brands.length > 0 && data.brands.every(brand => isBrandIgnored(brand))) return false;

    for (const config of RANGE_CONFIG) {
      const range = state[config.stateKey];
      const value = data[config.dataKey];
      if (!Number.isFinite(value)) continue;
      if (range.min !== null && value < range.min) return false;
      if (range.max !== null && value > range.max) return false;
    }

    for (const tab of CHECKBOX_TABS) {
      if (tab.id === skipTabId) continue;
      if (isTabValueUnchecked(tab.id, data)) return false;
    }
    return true;
  }

  function isRowFilteredOut(entry) {
    if (!entry) return false;
    return !rowPassesFilters(entry.data, null);
  }

  function applyFilters() {
    for (const [, entry] of rowData) {
      const hide = isRowFilteredOut(entry);
      // Details live inside the row, so hiding the row hides them too.
      entry.hideTarget.style.display = hide ? 'none' : '';
    }
    // Re-measure injected details now that rows' visibility changed; hidden
    // rows were skipped during injection, and rows becoming visible need their
    // overlay width/top (re)computed.
    relayoutInjectedDetails();
  }

  function getSortGroups() {
    // Group movable nodes by their parent so multiple tables/containers
    // on one page are each sorted among themselves.
    const groups = new Map();
    for (const [el, entry] of rowData) {
      // Details live inside the row, so they move with it as a single node.
      const nodes = [entry.hideTarget];
      const parent = entry.hideTarget.parentNode;
      if (!parent) continue;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push({
        nodes,
        brand: String(entry.data.primaryBrand || '').toLowerCase(),
        name: String(entry.data.name || '').toLowerCase(),
      });
    }
    return groups;
  }

  function sortRowsByBrand() {
    const groups = getSortGroups();
    if (alphabeticalOrder === null) {
      alphabeticalOrder = [];
      for (const [, list] of groups) {
        for (const g of list) alphabeticalOrder.push(g.nodes);
      }
    }
    for (const [parent, list] of groups) {
      list.sort((a, b) =>
        a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
      for (const g of list) {
        for (const node of g.nodes) parent.appendChild(node);
      }
    }
  }

  function restoreRowOrder() {
    if (alphabeticalOrder === null) return;
    for (const nodes of alphabeticalOrder) {
      const parent = nodes[0] && nodes[0].parentNode;
      if (!parent) continue;
      for (const node of nodes) parent.appendChild(node);
    }
    alphabeticalOrder = null;
  }

  function refreshSorting() {
    // Keep newly loaded/rescanned rows in sorted order.
    if (alphabeticalOrder !== null) sortRowsByBrand();
  }

  function rowHasValue(tabId, data, value) {
    if (tabId === 'brand') return data.primaryBrand === value;
    return data[tabId] === value;
  }

  // A checkbox row shows "visible/total": how many items with this value are
  // currently visible (after all filtering) versus how many there are before any
  // filtering. total ignores filters entirely, so it never drops to 0, and the
  // visible side reflects real visibility so zero-visible rows can gray out.
  function getCountsFor(tabId, value) {
    let visible = 0;
    let total = 0;
    for (const [, entry] of rowData) {
      if (!rowHasValue(tabId, entry.data, value)) continue;
      total++;
      if (rowPassesFilters(entry.data, null)) visible++;
    }
    return { visible, total };
  }

  function updateAllCheckboxCounts() {
    if (!panel || !panel.parentNode) return;
    // The per-tab bar counts (visible/total) apply to every tab.
    updateTabCounts();
    const activeTabId = state.activeTab;
    const activeTab = TAB_CONFIG.find(tab => tab.id === activeTabId);
    if (!activeTab || activeTab.type !== 'checkbox') return;
    const tabBody = tabContents[activeTabId];
    if (!tabBody) return;
    const checkboxes = tabBody.querySelectorAll('input[type="checkbox"]');
    for (const cb of checkboxes) {
      const rawValue = cb.dataset.rawValue;
      const counts = getCountsFor(activeTabId, rawValue);
      const item = cb.closest('.cp-checkbox-item');
      if (item) item.classList.toggle('cp-zero-visible', counts.visible === 0);
      const countSpan = cb.parentElement.querySelector('.filter-count');
      if (countSpan) countSpan.textContent = counts.visible + '/' + counts.total;
    }
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'cigarpage-filter-styles';
    style.textContent = `
#cp-filter-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 284px;
  max-height: 70vh;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 14px rgba(0,0,0,0.18);
  z-index: 999999;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}
#cp-filter-panel.cp-collapsed {
  width: auto;
  max-height: none;
  overflow: visible;
}
#cp-filter-panel.cp-collapsed .cp-tab-bar,
#cp-filter-panel.cp-collapsed .cp-actions,
#cp-filter-panel.cp-collapsed .cp-controls,
#cp-filter-panel.cp-collapsed .cp-tab-content,
#cp-filter-panel.cp-collapsed .cp-footer {
  display: none;
}
#cp-filter-panel .cp-drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
  background: #f5f5f5;
  border-radius: 6px 6px 0 0;
  gap: 4px;
  flex-shrink: 0;
  min-height: 32px;
}
#cp-filter-panel.cp-collapsed .cp-drag-handle {
  border-radius: 6px;
  border-bottom: none;
}
#cp-filter-panel .cp-collapse-btn,
#cp-filter-panel .cp-copy-btn,
#cp-filter-panel .cp-action-btn,
#cp-filter-panel .cp-font-btn {
  cursor: pointer;
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.4;
  color: #555;
  white-space: nowrap;
}
#cp-filter-panel .cp-collapse-btn:hover,
#cp-filter-panel .cp-copy-btn:hover,
#cp-filter-panel .cp-action-btn:hover,
#cp-filter-panel .cp-font-btn:hover {
  background: #e8e8e8;
}
#cp-filter-panel .cp-font-controls {
  display: flex;
  gap: 2px;
  align-items: center;
}
#cp-filter-panel .cp-font-controls .cp-font-btn {
  flex-shrink: 0;
}
#cp-filter-panel .cp-action-btn.cp-active {
  background: #2e7d32;
  color: #fff;
  border-color: #1b5e20;
}
#cp-filter-panel .cp-action-btn.cp-active:hover {
  background: #1b5e20;
}
#cp-filter-panel .cp-action-btn.cp-enabled-btn {
  min-width: 38px;
  font-weight: 700;
}
#cp-filter-panel .cp-tab-bar {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #ddd;
  background: #fafafa;
  flex-shrink: 0;
}
#cp-filter-panel .cp-tab {
  padding: 6px 10px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
#cp-filter-panel .cp-tab-count {
  margin-left: auto;
  padding: 6px 10px;
  font-weight: 400;
  opacity: 0.7;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}
#cp-filter-panel .cp-tab:hover {
  color: #1976D2;
}
#cp-filter-panel .cp-tab.active {
  color: #1565C0;
  border-bottom-color: #1E88E5;
}
#cp-filter-panel .cp-actions {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  flex-shrink: 0;
}
#cp-filter-panel .cp-controls {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}
#cp-filter-panel .cp-controls button {
  flex: 1;
  font-size: 11px;
  padding: 3px 0;
  cursor: pointer;
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  color: #555;
}
#cp-filter-panel .cp-controls button:hover {
  background: #e8e8e8;
}
#cp-filter-panel .cp-tab-content {
  overflow-y: auto;
  max-height: 300px;
  flex: 1;
}
#cp-filter-panel .cp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 5px 8px;
  border-top: 1px solid #ddd;
  background: #f5f5f5;
  flex-shrink: 0;
  font-size: 10px;
  line-height: 1;
}
#cp-filter-panel .cp-footer a {
  color: #777;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}
#cp-filter-panel .cp-footer a:hover {
  color: #1976D2;
  text-decoration: underline;
}
#cp-filter-panel .cp-checkbox-item {
  display: flex;
  align-items: center;
  padding: 3px 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  gap: 6px;
}
#cp-filter-panel .cp-checkbox-item:hover {
  background: #f8f8f8;
}
#cp-filter-panel .cp-checkbox-item.cp-zero-visible {
  background: rgba(128, 128, 128, 0.15);
  opacity: 0.6;
}
#cp-filter-panel .cp-checkbox-item input[type="checkbox"] {
  margin: 0;
  flex-shrink: 0;
}
#cp-filter-panel .cp-checkbox-item .cp-value-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#cp-filter-panel .cp-checkbox-item .filter-count {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
  margin-left: 4px;
}
#cp-filter-panel .cp-no-data {
  padding: 12px;
  text-align: center;
  color: #999;
  font-style: italic;
}
#cp-filter-panel .cp-preview-chip {
  display: none;
  cursor: pointer;
  background: #1565C0;
  color: #fff;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
#cp-filter-panel .cp-preview-chip:hover {
  background: #0D47A1;
}
#cp-filter-panel .cp-purged-header {
  padding: 6px 8px 3px;
  font-size: 10px;
  font-weight: 700;
  color: #B71C1C;
  text-transform: uppercase;
}
#cp-filter-panel .cp-ignored-header {
  padding: 6px 8px 3px;
  font-size: 10px;
  font-weight: 700;
  color: #E65100;
  text-transform: uppercase;
}
#cp-filter-panel .cp-checkbox-item.cp-purged-item {
  color: #999;
}
#cp-filter-panel .cp-checkbox-item.cp-purged-item .cp-value-label {
  text-decoration: line-through;
}
#cp-filter-panel .cp-restore-btn {
  cursor: pointer;
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 10px;
  color: #555;
  flex-shrink: 0;
}
#cp-filter-panel .cp-restore-btn:hover {
  background: #e8e8e8;
}
#cp-context-menu {
  display: none;
  position: fixed;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  z-index: 1000000;
  min-width: 170px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  user-select: none;
}
#cp-context-menu .cp-context-item {
  padding: 7px 12px;
  cursor: pointer;
  white-space: nowrap;
}
#cp-context-menu .cp-context-item:hover {
  background: #e8f0fe;
}
#cp-context-menu .cp-context-item.cp-context-danger {
  color: #B71C1C;
}
#cp-context-menu .cp-context-item.cp-context-danger:hover {
  background: #fdecea;
}
#cp-context-menu .cp-context-item.cp-context-warn {
  color: #E65100;
}
#cp-context-menu .cp-context-item.cp-context-warn:hover {
  background: #fff3e0;
}
#cp-filter-panel .cp-range-section {
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}
#cp-filter-panel .cp-range-section .cp-range-title {
  font-size: 11px;
  color: #333;
  font-weight: 700;
  margin-bottom: 4px;
}
#cp-filter-panel .cp-range-section .cp-range-values {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #333;
  font-weight: 600;
}
#cp-filter-panel .cp-range-section .cp-range-wrapper {
  position: relative;
  height: 20px;
  margin: 4px 0;
}
#cp-filter-panel .cp-range-section input[type="range"] {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
}
#cp-filter-panel .cp-range-section input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: #ddd;
  border-radius: 2px;
}
#cp-filter-panel .cp-range-section input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1976D2;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  cursor: pointer;
  pointer-events: auto;
  margin-top: -5px;
}
#cp-filter-panel .cp-range-section input[type="range"]::-moz-range-track {
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  border: none;
}
#cp-filter-panel .cp-range-section input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1976D2;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  cursor: pointer;
  pointer-events: auto;
}
#cp-filter-panel .cp-range-section button {
  font-size: 10px;
  padding: 2px 6px;
  cursor: pointer;
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  color: #555;
  margin-top: 4px;
  width: 100%;
}
#cp-filter-panel .cp-range-section button:hover {
  background: #e8e8e8;
}
/* Details injected inside a grid row's second <td>, overlaying the full row. */
table.cigar-grid .cigar-details.injected_by_userscript {
  padding: 6px 8px;
  font-size: 11px;
  line-height: 1.4;
  color: #333;
  background: #f9f9f9;
  border-top: 1px dashed #ddd;
  box-sizing: border-box;
}
/* In-flow spacer that reserves the details' height without taking up width. */
table.cigar-grid .cigar-details-spacer {
  height: 0;
}
`;
    document.head.appendChild(style);
  }

  function buildFooterLinks() {
    const footer = document.createElement('div');
    footer.className = 'cp-footer';
    const share = document.createElement('a');
    share.href = 'https://github.com/shmshka/cigarpage-multifilter-userscript';
    share.target = '_blank';
    share.rel = 'noopener noreferrer';
    share.textContent = '\u{1F4E2} Share this script';
    const buy = document.createElement('a');
    buy.href = 'https://www.paypal.me/shmshka';
    buy.target = '_blank';
    buy.rel = 'noopener noreferrer';
    buy.textContent = '\u{1F4B8} Buy me a smoke.';
    footer.appendChild(share);
    footer.appendChild(buy);
    return footer;
  }

  function buildPanel() {
    const existing = document.getElementById('cp-filter-panel');
    if (existing) existing.remove();
    const strayBadge = document.getElementById('cp-filter-badge');
    if (strayBadge) strayBadge.remove();

    const container = document.createElement('div');
    container.id = 'cp-filter-panel';
    if (state.collapsed) container.classList.add('cp-collapsed');

    const dragHandle = document.createElement('div');
    dragHandle.className = 'cp-drag-handle';
    // "Filters" title is replaced by font-size controls (🗚 increases, 🗛
    // decreases) that scale the whole overlay by 5% per click.
    const fontControls = document.createElement('span');
    fontControls.className = 'cp-font-controls';
    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'cp-font-btn';
    increaseBtn.textContent = '\u{1F5DA}';
    increaseBtn.title = 'Increase font size';
    increaseBtn.addEventListener('click', () => adjustFontSize(1.05));
    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'cp-font-btn';
    decreaseBtn.textContent = '\u{1F5DB}';
    decreaseBtn.title = 'Decrease font size';
    decreaseBtn.addEventListener('click', () => adjustFontSize(1 / 1.05));
    fontControls.appendChild(increaseBtn);
    fontControls.appendChild(decreaseBtn);
    const spacer = document.createElement('span');
    spacer.style.cssText = 'flex:1;';
    const enabledBtn = document.createElement('button');
    enabledBtn.className = 'cp-action-btn cp-enabled-btn';
    enabledBtn.title = 'Toggle all filters on/off';
    enabledBtn.addEventListener('click', toggleFilters);
    enabledBtn.appendChild(document.createTextNode('ON'));
    dragHandle.appendChild(fontControls);
    dragHandle.appendChild(spacer);
    dragHandle.appendChild(enabledBtn);
    const previewChip = document.createElement('span');
    previewChip.className = 'cp-preview-chip';
    previewChip.title = 'Exit preview (Esc)';
    previewChip.style.display = 'none';
    previewChip.addEventListener('click', () => exitPreview());
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'cp-collapse-btn';
    // ❌ when expanded (click to collapse), 🔷 when collapsed (click to expand).
    collapseBtn.textContent = state.collapsed ? '\u{1F537}' : '\u274C';
    collapseBtn.title = state.collapsed ? 'Expand' : 'Collapse';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'cp-copy-btn';
    copyBtn.textContent = '\u{1F4CB}';
    copyBtn.title = 'Copy visible list';
    dragHandle.appendChild(previewChip);
    dragHandle.appendChild(copyBtn);
    dragHandle.appendChild(collapseBtn);

    const tabBar = document.createElement('div');
    tabBar.className = 'cp-tab-bar';
    for (const cfg of TAB_CONFIG) {
      const tab = document.createElement('div');
      tab.className = 'cp-tab';
      tab.dataset.tabId = cfg.id;
      tab.textContent = cfg.label;
      if (cfg.id === state.activeTab) tab.classList.add('active');
      tab.addEventListener('click', () => switchTab(cfg.id));
      tabBar.appendChild(tab);
    }
    // A single overall visible/total count, in-line with the tabs but separate
    // from them, right-aligned on the same row.
    const overallCount = document.createElement('span');
    overallCount.className = 'cp-tab-count';
    tabBar.appendChild(overallCount);

    const actions = document.createElement('div');
    actions.className = 'cp-actions';
    const expandBtn = document.createElement('button');
    expandBtn.className = 'cp-action-btn';
    expandBtn.id = 'cp-details-btn';
    expandBtn.textContent = 'Details';
    expandBtn.title = 'Expand Blend Info and inject Details for all products (click again to collapse)';
    expandBtn.addEventListener('click', showAllDetails);
    const soldOutBtn = document.createElement('button');
    soldOutBtn.className = 'cp-action-btn';
    soldOutBtn.id = 'cp-soldout-btn';
    soldOutBtn.textContent = 'Stock';
    soldOutBtn.title = 'Show only in-stock items';
    soldOutBtn.addEventListener('click', () => {
      exitPreview();
      state.hideSoldOut = !state.hideSoldOut;
      saveState();
      soldOutBtn.classList.toggle('cp-active', state.hideSoldOut);
      applyFilters();
      updateAllCheckboxCounts();
      updateBadgeText();
    });
    if (state.hideSoldOut) soldOutBtn.classList.add('cp-active');
    const alphaBtn = document.createElement('button');
    alphaBtn.className = 'cp-action-btn';
    alphaBtn.id = 'cp-alphabetize-btn';
    alphaBtn.textContent = 'Alphabetize';
    alphaBtn.title = 'Sort products by brand, then title (click again to restore original order)';
    alphaBtn.addEventListener('click', () => {
      if (alphabeticalOrder === null) {
        sortRowsByBrand();
        alphaBtn.classList.add('cp-active');
      } else {
        restoreRowOrder();
        alphaBtn.classList.remove('cp-active');
      }
    });
    actions.appendChild(alphaBtn);
    actions.appendChild(expandBtn);
    actions.appendChild(soldOutBtn);

    const controls = document.createElement('div');
    controls.className = 'cp-controls';
    controls.style.display = state.activeTab === 'general' ? 'none' : '';
    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = 'Select All';
    selectAllBtn.addEventListener('click', () => setAllChecked(state.activeTab, true));
    const deselectAllBtn = document.createElement('button');
    deselectAllBtn.textContent = 'Deselect All';
    deselectAllBtn.addEventListener('click', () => setAllChecked(state.activeTab, false));
    controls.appendChild(selectAllBtn);
    controls.appendChild(deselectAllBtn);

    tabContents = {};
    for (const cfg of TAB_CONFIG) {
      const div = document.createElement('div');
      div.className = 'cp-tab-content';
      div.dataset.tabId = cfg.id;
      if (cfg.id !== state.activeTab) div.style.display = 'none';
      tabContents[cfg.id] = div;
    }

    container.appendChild(dragHandle);
    container.appendChild(tabBar);
    container.appendChild(actions);
    container.appendChild(controls);
    for (const cfg of TAB_CONFIG) {
      container.appendChild(tabContents[cfg.id]);
    }
    container.appendChild(buildFooterLinks());

    if (state.pos.x !== null && state.pos.y !== null) {
      container.style.left = state.pos.x + 'px';
      container.style.top = state.pos.y + 'px';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    }

    document.body.appendChild(container);
    panel = container;

    setupDrag(dragHandle, container);
    collapseBtn.addEventListener('click', () => {
      state.collapsed = !state.collapsed;
      saveState();
      // Collapse/expand simply toggles the bar view; the container keeps its
      // fixed position throughout, so there is no badge overlay and no jump.
      container.classList.toggle('cp-collapsed', state.collapsed);
      collapseBtn.textContent = state.collapsed ? '\u{1F537}' : '\u274C';
      collapseBtn.title = state.collapsed ? 'Expand' : 'Collapse';
      updateBadgeText();
    });

    copyBtn.addEventListener('click', () => {
      const lines = [];
      for (const [el] of rowData) {
        if (el.style.display === 'none') continue;
        let name = '';
        let size = '';
        if (el.tagName === 'TR') {
          const nameEl = el.querySelector('.cigar-alt-name');
          if (!nameEl) continue;
          name = nameEl.textContent.trim();
          const attrRows = el.querySelectorAll('.cigar-attr-row');
          for (const ar of attrRows) {
            const lbl = ar.querySelector('.cigar-attr-label');
            if (lbl && lbl.textContent.trim() === 'Size') {
              const val = ar.querySelector('.cigar-attr-value');
              if (val) size = val.textContent.trim();
              break;
            }
          }
        } else {
          const nameEl = el.querySelector('.item-name');
          if (!nameEl) continue;
          name = nameEl.textContent.trim();
        }
        lines.push(name + '\t' + size);
      }
      if (lines.length) {
        navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
      }
    });

    container.addEventListener('contextmenu', onPanelContextMenu);

    renderAllTabs();
    updateBadgeText();
    updatePanelPreviewUi();
    updateEnabledToggleUi();
    updateTabCounts();
    applyFontSize();

    return container;
  }

  function updatePanelPreviewUi() {
    const chip = panel ? panel.querySelector('.cp-preview-chip') : null;
    if (!chip) return;
    if (previewBrand !== null) {
      chip.textContent = '\u2715 ' + previewBrand;
      chip.style.display = '';
      chip.classList.add('cp-active');
    } else {
      chip.style.display = 'none';
      chip.classList.remove('cp-active');
    }
  }

  function onPanelContextMenu(e) {
    if (state.activeTab !== 'brand') return;
    const item = e.target.closest('.cp-checkbox-item');
    if (!item) return;
    // Managed (purged/ignored) rows carry their brand in data-brand.
    if (!item.querySelector('input[type="checkbox"]')) {
      if (!item.dataset.brand) return;
      e.preventDefault();
      openBrandContextMenu(item.dataset.brand, e.clientX, e.clientY);
      return;
    }
    const cb = item.querySelector('input[type="checkbox"]');
    e.preventDefault();
    openBrandContextMenu(cb.dataset.rawValue, e.clientX, e.clientY);
  }

  function ensureContextMenu() {
    if (contextMenu && contextMenu.parentNode) return contextMenu;
    contextMenu = document.createElement('div');
    contextMenu.id = 'cp-context-menu';

    const previewItem = document.createElement('div');
    previewItem.className = 'cp-context-item';
    previewItem.textContent = '\u{1F50D} Focus';
    previewItem.addEventListener('click', () => {
      const brand = contextMenuBrand;
      closeBrandContextMenu();
      if (brand !== null) startPreview(brand);
    });

    const purgeItem = document.createElement('div');
    purgeItem.className = 'cp-context-item cp-context-danger';
    purgeItem.addEventListener('click', () => {
      const brand = contextMenuBrand;
      closeBrandContextMenu();
      if (brand === null) return;
      if (isBrandPurged(brand)) restoreBrand(brand);
      else purgeBrand(brand);
    });

    const ignoreItem = document.createElement('div');
    ignoreItem.className = 'cp-context-item cp-context-warn';
    ignoreItem.addEventListener('click', () => {
      const brand = contextMenuBrand;
      closeBrandContextMenu();
      if (brand === null) return;
      if (isBrandIgnored(brand)) restoreBrand(brand);
      else ignoreBrand(brand);
    });

    contextMenu.appendChild(previewItem);
    contextMenu.appendChild(ignoreItem);
    contextMenu.appendChild(purgeItem);
    document.body.appendChild(contextMenu);
    return contextMenu;
  }

  function openBrandContextMenu(brand, x, y) {
    contextMenuBrand = brand;
    const menu = ensureContextMenu();
    const [, ignoreItem, purgeItem] = menu.querySelectorAll('.cp-context-item');
    ignoreItem.textContent = isBrandIgnored(brand)
      ? '\u21A9 Un-remove'
      : '\u26A0\uFE0F Hide When Not Bundled';
    purgeItem.textContent = isBrandPurged(brand)
      ? '\u21A9 Un-hide'
      : '\u{1F6AB} Hide Always';
    menu.style.visibility = 'hidden';
    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 4);
    const top = Math.min(y, window.innerHeight - rect.height - 4);
    menu.style.left = Math.max(0, left) + 'px';
    menu.style.top = Math.max(0, top) + 'px';
    menu.style.visibility = '';
  }

  function closeBrandContextMenu() {
    contextMenuBrand = null;
    if (contextMenu) contextMenu.style.display = 'none';
  }

  document.addEventListener('click', e => {
    if (contextMenu && !contextMenu.contains(e.target)) closeBrandContextMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeBrandContextMenu();
    exitPreview();
  });

  function setupDrag(handle, container) {
    let dragging = false;
    let startX, startY, elStartX, elStartY;

    function getZoom(el) {
      const z = parseFloat(getComputedStyle(el).zoom);
      return Number.isFinite(z) && z > 0 ? z : 1;
    }

    function onMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      dragging = true;
      const rect = container.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      // getBoundingClientRect is scaled by zoom, but mouse coords are not, so
      // track the visual (viewport) start and undo zoom when setting left/top.
      elStartX = rect.left;
      elStartY = rect.top;
      e.preventDefault();
    }

    function onMouseMove(e) {
      if (!dragging) return;
      const zoom = getZoom(container);
      const visualX = elStartX + (e.clientX - startX);
      const visualY = elStartY + (e.clientY - startY);
      // Mouse deltas are viewport px; converting to layout px divides out zoom.
      container.style.left = Math.max(0, visualX / zoom) + 'px';
      container.style.top = Math.max(0, visualY / zoom) + 'px';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      // offsetLeft/offsetTop are unscaled layout coords, so persisting them
      // reproduces the same on-screen position at the same zoom next session.
      state.pos = { x: container.offsetLeft, y: container.offsetTop };
      saveState();
    }

    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function renderAllTabs() {
    for (const cfg of TAB_CONFIG) {
      renderTab(cfg.id);
    }
  }

  function renderTab(tabId) {
    const body = tabContents[tabId];
    if (!body) return;
    body.innerHTML = '';

    if (tabId === 'general') {
      renderGeneralTab(body);
      return;
    }

    const purged = tabId === 'brand' ? state.purgedBrands : [];
    const ignored = tabId === 'brand' ? state.ignoredBrands : [];
    const values = getUniqueValues(tabId)
      .filter(v => !purged.includes(v) && !ignored.includes(v));
    if (values.length === 0 && purged.length === 0 && ignored.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'cp-no-data';
      msg.textContent = 'No values found';
      body.appendChild(msg);
      return;
    }

    const unchecked = state.unchecked[tabId] || [];

    for (const raw of values) {
      body.appendChild(buildCheckboxItem(tabId, raw, unchecked));
    }

    // "Hidden when not bundled" (ignored) comes first, then "always hidden".
    if (ignored.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'cp-ignored-header';
      divider.textContent = 'Hide When Not Bundled';
      body.appendChild(divider);
      for (const brand of [...ignored].sort((a, b) => a.localeCompare(b))) {
        body.appendChild(buildManagedBrandRow(brand, brand + ' — hidden when not bundled. Click Restore to show again.'));
      }
    }

    if (purged.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'cp-purged-header';
      divider.textContent = 'Hide Always';
      body.appendChild(divider);
      for (const brand of [...purged].sort((a, b) => a.localeCompare(b))) {
        body.appendChild(buildManagedBrandRow(brand, brand + ' — always hidden. Click Restore to show again.'));
      }
    }
  }

  function buildManagedBrandRow(brand, tooltip) {
    const row = document.createElement('div');
    row.className = 'cp-checkbox-item cp-purged-item';
    row.dataset.brand = brand;
    const label = document.createElement('span');
    label.className = 'cp-value-label';
    label.textContent = brand;
    label.title = tooltip;
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'cp-restore-btn';
    restoreBtn.textContent = 'Restore';
    restoreBtn.addEventListener('click', e => {
      e.stopPropagation();
      restoreBrand(brand);
    });
    row.appendChild(label);
    row.appendChild(restoreBtn);
    return row;
  }

  function buildCheckboxItem(tabId, raw, unchecked) {
    const item = document.createElement('label');
    item.className = 'cp-checkbox-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.rawValue = String(raw);
    cb.checked = !unchecked.includes(raw);
    cb.addEventListener('change', () => onCheckboxChange(tabId, raw, cb.checked));

    const label = document.createElement('span');
    label.className = 'cp-value-label';
    label.textContent = raw;
    label.title = String(raw);

    const count = document.createElement('span');
    count.className = 'filter-count';
    const counts = getCountsFor(tabId, raw);
    count.textContent = counts.visible + '/' + counts.total;
    if (counts.visible === 0) item.classList.add('cp-zero-visible');

    item.appendChild(cb);
    item.appendChild(label);
    item.appendChild(count);
    return item;
  }

  function renderGeneralTab(body) {
    for (const config of RANGE_CONFIG) {
      body.appendChild(renderRangeControl(config));
    }
  }

  function renderRangeControl(config) {
    const section = document.createElement('div');
    section.className = 'cp-range-section';

    const minBound = state[config.minKey];
    const maxBound = state[config.maxKey];
    const title = document.createElement('div');
    title.className = 'cp-range-title';
    title.textContent = config.label;
    section.appendChild(title);

    if (!Number.isFinite(minBound) || !Number.isFinite(maxBound)) {
      const msg = document.createElement('div');
      msg.className = 'cp-no-data';
      msg.textContent = `No ${config.label.toLowerCase()} range available`;
      section.appendChild(msg);
      return section;
    }

    const range = state[config.stateKey];
    const currentMin = range.min !== null ? range.min : minBound;
    const currentMax = range.max !== null ? range.max : maxBound;

    if (minBound === maxBound) {
      const onlyValue = document.createElement('div');
      onlyValue.className = 'cp-range-values';
      onlyValue.textContent = 'Only: ' + config.format(minBound);
      section.appendChild(onlyValue);
      return section;
    }

    const values = document.createElement('div');
    values.className = 'cp-range-values';

    const wrapper = document.createElement('div');
    wrapper.className = 'cp-range-wrapper';

    const rangeMin = document.createElement('input');
    rangeMin.type = 'range';
    rangeMin.min = String(minBound);
    rangeMin.max = String(maxBound);
    rangeMin.step = String(config.step);
    rangeMin.value = String(currentMin);
    rangeMin.setAttribute('aria-label', `${config.label} minimum`);

    const rangeMax = document.createElement('input');
    rangeMax.type = 'range';
    rangeMax.min = String(minBound);
    rangeMax.max = String(maxBound);
    rangeMax.step = String(config.step);
    rangeMax.value = String(currentMax);
    rangeMax.setAttribute('aria-label', `${config.label} maximum`);

    rangeMin.addEventListener('input', () => {
      handleRangeInput(config, 'min', parseFloat(rangeMin.value), rangeMin, rangeMax, values);
    });
    rangeMax.addEventListener('input', () => {
      handleRangeInput(config, 'max', parseFloat(rangeMax.value), rangeMin, rangeMax, values);
    });
    rangeMin.addEventListener('change', applyRangeFilter);
    rangeMax.addEventListener('change', applyRangeFilter);

    wrapper.appendChild(rangeMin);
    wrapper.appendChild(rangeMax);

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear Range';
    clearBtn.addEventListener('click', () => {
      state[config.stateKey] = { min: null, max: null };
      saveState();
      applyFilters();
      updateAllCheckboxCounts();
      updateBadgeText();
      if (tabContents.general) renderTab('general');
    });

    section.appendChild(wrapper);
    section.appendChild(values);
    section.appendChild(clearBtn);
    updateRangeValues(config, values);

    return section;
  }

  function updateRangeValues(config, valuesElement) {
    const range = state[config.stateKey];
    const minValue = range.min !== null ? range.min : state[config.minKey];
    const maxValue = range.max !== null ? range.max : state[config.maxKey];
    valuesElement.innerHTML = '';
    const minLabel = document.createElement('span');
    minLabel.textContent = 'Min: ' + config.format(minValue);
    const maxLabel = document.createElement('span');
    maxLabel.textContent = 'Max: ' + config.format(maxValue);
    valuesElement.appendChild(minLabel);
    valuesElement.appendChild(maxLabel);
  }

  function handleRangeInput(config, which, value, rangeMin, rangeMax, valuesElement) {
    const range = state[config.stateKey];
    const defaultMin = state[config.minKey];
    const defaultMax = state[config.maxKey];
    const otherValue = which === 'min'
      ? (range.max !== null ? range.max : defaultMax)
      : (range.min !== null ? range.min : defaultMin);

    value = roundRangeValue(value, config.step, which === 'min' ? 'down' : 'up');
    if (which === 'min') {
      range.min = Math.min(value, otherValue);
      rangeMin.value = String(range.min);
    } else {
      range.max = Math.max(value, otherValue);
      rangeMax.value = String(range.max);
    }
    updateRangeValues(config, valuesElement);
  }

  function applyRangeFilter() {
    exitPreview();
    saveState();
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function onCheckboxChange(tabId, raw, checked) {
    exitPreview();
    if (!state.unchecked[tabId]) state.unchecked[tabId] = [];
    if (checked) {
      state.unchecked[tabId] = state.unchecked[tabId].filter(v => v !== raw);
    } else {
      if (!state.unchecked[tabId].includes(raw)) {
        state.unchecked[tabId].push(raw);
      }
    }
    saveState();
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function switchTab(tabId) {
    const tabConfig = TAB_CONFIG.find(tab => tab.id === tabId);
    if (!tabConfig) return;
    exitPreview();
    state.activeTab = tabId;
    saveState();
    const tabs = panel.querySelectorAll('.cp-tab');
    for (const t of tabs) {
      t.classList.toggle('active', t.dataset.tabId === tabId);
    }
    for (const cfg of TAB_CONFIG) {
      const body = tabContents[cfg.id];
      if (body) body.style.display = cfg.id === tabId ? '' : 'none';
    }
    const controls = panel.querySelector('.cp-controls');
    if (controls) controls.style.display = tabConfig.type === 'checkbox' ? '' : 'none';
    updateAllCheckboxCounts();
  }

  function setAllChecked(tabId, checked) {
    const tabConfig = TAB_CONFIG.find(tab => tab.id === tabId);
    if (!tabConfig || tabConfig.type !== 'checkbox') return;
    exitPreview();
    if (!state.unchecked[tabId]) state.unchecked[tabId] = [];
    const values = getUniqueValues(tabId);
    if (checked) {
      state.unchecked[tabId] = [];
    } else {
      state.unchecked[tabId] = [...values];
    }
    saveState();
    renderTab(tabId);
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function toggleFilters() {
    // Drop any active preview so the chip doesn't contradict the toggle —
    // whether turning filters on or off, a leftover preview is misleading.
    if (previewBrand !== null) exitPreview();
    state.filtersEnabled = !state.filtersEnabled;
    saveState();
    updateEnabledToggleUi();
    applyFilters();
    updateAllCheckboxCounts();
    updateBadgeText();
  }

  function updateEnabledToggleUi() {
    if (!panel) return;
    const btn = panel.querySelector('.cp-enabled-btn');
    if (!btn) return;
    if (state.filtersEnabled) {
      btn.textContent = 'ON';
      btn.classList.add('cp-active');
    } else {
      btn.textContent = 'OFF';
      btn.classList.remove('cp-active');
    }
  }

  // Scale every control in the floating overlay by changing the panel's zoom,
  // which scales text and layout proportionally. fontSize is stored as a
  // percentage so it persists between sessions.
  function applyFontSize() {
    if (!panel) return;
    panel.style.zoom = String(state.fontSize / 100);
  }

  function adjustFontSize(factor) {
    let next = state.fontSize * factor;
    next = Math.max(50, Math.min(200, next));
    if (next === state.fontSize) return;
    state.fontSize = next;
    saveState();
    applyFontSize();
  }

  function getOverallCounts() {
    let hiddenCount = 0;
    for (const [, entry] of rowData) {
      if (isRowFilteredOut(entry)) hiddenCount++;
    }
    return { visible: rowData.size - hiddenCount, total: rowData.size };
  }

  // The tab bar shows one overall visible/total item count, right-aligned on
  // the tab row and separate from the tabs themselves.
  function updateTabCounts() {
    if (!panel) return;
    const countEl = panel.querySelector('.cp-tab-count');
    if (!countEl) return;
    const counts = getOverallCounts();
    countEl.textContent = counts.visible + '/' + counts.total;
  }

  function updateBadgeText() {
    // The "Filter x/y" collapsed pill was removed at the user's request; the
    // collapsed state is now just the small drag bar. Kept as a no-op so all
    // call sites remain valid.
  }

  function showAllDetails() {
    const btn = panel ? panel.querySelector('#cp-details-btn') : null;

    // Second click: undo everything the Details action did.
    if (detailsExpanded) {
      if (detailsTimer !== null) {
        clearTimeout(detailsTimer);
        detailsTimer = null;
      }
      removeAllDetails();
      if (btn) btn.classList.remove('cp-active');
      detailsExpanded = false;
      return;
    }

    expandAllBlendInfo();
    detailsTimer = setTimeout(() => {
      detailsTimer = null;
      injectAllDetails();
      if (extractRowData()) {
        refreshSorting();
        renderAllTabs();
        applyFilters();
        updateAllCheckboxCounts();
        updateBadgeText();
      }
    }, 800);
    if (btn) btn.classList.add('cp-active');
    detailsExpanded = true;
  }

  // Reverse of the Details action: remove every injected details block, restore
  // the site's toggles, and collapse expanded blend info back to its initial state.
  function removeAllDetails() {
    for (const details of document.querySelectorAll('.injected_by_userscript')) {
      const spacer = details.previousElementSibling;
      if (spacer && spacer.classList.contains('cigar-details-spacer')) spacer.remove();
      details.remove();
    }
    for (const btn of document.querySelectorAll('table.cigar-grid .popoverBtn')) btn.style.display = '';
    for (const btn of document.querySelectorAll('table.cigar-grid .prodDetailsBtn')) btn.style.display = '';
    for (const toggle of document.querySelectorAll('.cigar-attr-toggle')) toggle.style.display = 'none';
    for (const tr of document.querySelectorAll('table.cigar-grid tbody tr')) tr.style.position = '';
  }

  function expandAllBlendInfo() {
    const toggles = document.querySelectorAll('.cigar-attr-toggle');
    let clicked = 0;
    for (const toggle of toggles) {
      if (getComputedStyle(toggle).display !== 'none') continue;
      const productId = toggle.id.replace('cigarAttrToggler_', '');
      const btn = document.querySelector('.prodDetailsBtn[data-productid="' + productId + '"]');
      if (btn) {
        btn.click();
        clicked++;
      }
    }
    return clicked;
  }

  function decodeHtml(html) {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  function injectAllDetails() {
    const tables = document.querySelectorAll('table.cigar-grid');
    let injected = 0;
    for (const table of tables) {
      const rows = table.querySelectorAll('tbody tr');
      for (const tr of rows) {
        const popover = tr.querySelector('.popoverBtn[data-content]');
        if (!popover) continue;
        const raw = popover.getAttribute('data-content');
        if (!raw) continue;
        // Details live inside the row so they sort/hide with it — and a row
        // that already carries them is left untouched on re-inject.
        if (tr.querySelector('.injected_by_userscript')) continue;
        const targetTd = tr.children[1];
        if (!targetTd) continue;

        // The injected details replace the site's popover, so hide its toggle
        // and the adjacent "Blend Info" button.
        const showBtn = tr.querySelector('.popoverBtn');
        if (showBtn) showBtn.style.display = 'none';
        const blendBtn = tr.querySelector('.prodDetailsBtn');
        if (blendBtn) blendBtn.style.display = 'none';

        const details = document.createElement('div');
        details.className = 'cigar-details injected_by_userscript';
        details.innerHTML = decodeHtml(raw);
        targetTd.appendChild(details);

        positionInjectedDetails(details);
        injected++;
      }
    }
    return injected;
  }

  // Lay out an injected details div as a full-row-width overlay. It is taken out
  // of flow (absolute) so it sits on top of the sibling <td>s instead of growing
  // the auto table layout; an in-flow spacer reserves its height so the row still
  // grows vertically without overlapping the next row.
  function positionInjectedDetails(details) {
    const targetTd = details.parentElement;
    const tr = targetTd && targetTd.parentElement;
    if (!targetTd || !tr) return;

    // Anchor absolutely-positioned children to the row.
    tr.style.position = 'relative';

    // In-flow spacer that reserves the space the details occupy.
    let spacer = details.previousElementSibling;
    if (!spacer || !spacer.classList.contains('cigar-details-spacer')) {
      spacer = document.createElement('div');
      spacer.className = 'cigar-details-spacer';
      targetTd.insertBefore(spacer, details);
    }

    // Overlay the details across the whole row, cleared of any prior margins.
    details.style.position = 'absolute';
    details.style.left = '0';
    details.style.marginLeft = '0';

    // Hidden rows report zero-size rects, so measuring would lock in bogus
    // dimensions. Leave them for the next relayout once the row is shown (the
    // row is re-laid-out from applyFilters whenever filter visibility changes).
    if (tr.offsetWidth === 0 || tr.getBoundingClientRect().width === 0) return;

    details.style.width = tr.getBoundingClientRect().width + 'px';
    spacer.style.height = details.offsetHeight + 'px';
    details.style.top = spacer.offsetTop + 'px';
  }

  // Recompute the full-row span of injected details (e.g. after a resize) so
  // they stay aligned with their row's columns.
  function relayoutInjectedDetails() {
    for (const details of document.querySelectorAll('.injected_by_userscript')) {
      positionInjectedDetails(details);
    }
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(mutations => {
      let needsRescan = false;
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.nodeType !== 1) continue;
          // Sorting/restoring re-appends rows we already track, and those
          // moves show up here as additions. Rescanning them would re-run
          // the sort, which moves rows again — an infinite loop that pins
          // the CPU and can crash the tab. Only an untracked row is a
          // genuinely new product worth a rescan.
          if (node.matches && (node.matches('table.cigar-grid tbody tr') || node.matches('.default-item'))) {
            if (!rowData.has(node)) {
              needsRescan = true;
              break;
            }
            continue;
          }
          if (node.querySelectorAll) {
            const rows = node.querySelectorAll('table.cigar-grid tbody tr');
            const items = node.querySelectorAll('.default-item');
            for (const row of rows) {
              if (!rowData.has(row)) { needsRescan = true; break; }
            }
            if (!needsRescan) {
              for (const item of items) {
                if (!rowData.has(item)) { needsRescan = true; break; }
              }
            }
            if (needsRescan) break;
          }
        }
        if (needsRescan) break;
      }
      if (needsRescan) {
        extractRowData();
        refreshSorting();
        renderAllTabs();
        applyFilters();
        updateAllCheckboxCounts();
        updateBadgeText();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function waitForTables(maxAttempts, interval, callback) {
    let attempts = 0;
    function check() {
      const tables = document.querySelectorAll('table.cigar-grid');
      const items = document.querySelectorAll('#grouped-items-container .default-item');
      const hasData = (tables.length > 0 && document.querySelectorAll('.cigar-attr-label').length > 0)
        || items.length > 0;
      if (hasData) {
        callback(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(check, interval);
      } else {
        callback(false);
      }
    }
    check();
  }

  function init() {
    injectStyles();

    // Grouped deal pages load their items via AJAX after page load,
    // so allow a longer wait there before giving up.
    const isGroupedPage = document.querySelector('#grouped-items-container') !== null;
    waitForTables(isGroupedPage ? 120 : 40, 250, function (found) {
      if (!found) {
        console.log('[CigarPage Filter] No product tables found on this page.');
        return;
      }

      if (!extractRowData()) {
        console.log('[CigarPage Filter] No product rows found.');
        return;
      }

      buildPanel();
      applyFilters();
      updateAllCheckboxCounts();
      updateBadgeText();
      setupObserver();
      window.addEventListener('resize', () => relayoutInjectedDetails());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
