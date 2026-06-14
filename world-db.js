/* WORLDPANEL — Cache local (localStorage) para histórico World Bank */

const WP_DB_KEY = 'worldpanel_cache_v2';
const WP_DB_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h antes de refresh incremental

const WorldDB = {
  _cache: null,

  load() {
    try {
      const raw = localStorage.getItem(WP_DB_KEY);
      if (!raw) return { history: {}, meta: { savedAt: null, apiCalls: 0, points: 0 } };
      const parsed = JSON.parse(raw);
      this._cache = parsed;
      return parsed;
    } catch (e) {
      console.warn('WorldDB load failed', e);
      return { history: {}, meta: { savedAt: null, apiCalls: 0, points: 0 } };
    }
  },

  save(history, metaExtra = {}) {
    try {
      let points = 0;
      Object.values(history).forEach(country => {
        Object.values(country).forEach(series => {
          if (Array.isArray(series)) points += series.length;
        });
      });
      const payload = {
        history,
        meta: {
          savedAt: new Date().toISOString(),
          points,
          version: 2,
          ...metaExtra
        }
      };
      localStorage.setItem(WP_DB_KEY, JSON.stringify(payload));
      this._cache = payload;
      return payload.meta;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage cheio — limpando cache antigo');
        localStorage.removeItem(WP_DB_KEY);
      }
      return null;
    }
  },

  applyToApp(historyRef, dataRef) {
    const cached = this.load();
    if (!cached.history) return { restored: 0, meta: cached.meta };
    let restored = 0;
    Object.entries(cached.history).forEach(([code, indicators]) => {
      if (!historyRef[code]) historyRef[code] = {};
      Object.entries(indicators).forEach(([indId, pts]) => {
        if (!Array.isArray(pts) || !pts.length) return;
        historyRef[code][indId] = pts;
        if (dataRef[code]) dataRef[code][indId] = pts[pts.length - 1].value;
        restored++;
      });
    });
    return { restored, meta: cached.meta };
  },

  mergeSeries(existing, incoming) {
    const map = new Map();
    (existing || []).forEach(p => map.set(p.year, p.value));
    (incoming || []).forEach(p => { if (p.value != null) map.set(p.year, p.value); });
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([year, value]) => ({ year, value }));
  },

  mergeIndicator(historyRef, indId, byCountry) {
    let added = 0;
    Object.entries(byCountry).forEach(([code, pts]) => {
      if (!pts || !pts.length) return;
      if (!historyRef[code]) historyRef[code] = {};
      const merged = this.mergeSeries(historyRef[code][indId], pts);
      const before = (historyRef[code][indId] || []).length;
      historyRef[code][indId] = merged;
      added += Math.max(0, merged.length - before);
    });
    return added;
  },

  isStale() {
    const m = this.load().meta;
    if (!m.savedAt) return true;
    return Date.now() - new Date(m.savedAt).getTime() > WP_DB_MAX_AGE_MS;
  },

  needsIndicatorFetch(historyRef, indId, countries) {
    if (this.isStale()) return { fetch: true, reason: 'cache antigo (>24h)', missing: countries.length };
    const missing = countries.filter(code => {
      const pts = historyRef[code]?.[indId];
      return !pts || pts.length < 5;
    });
    return {
      fetch: missing.length > 0,
      reason: missing.length ? `${missing.length} país(es) sem série` : 'completo',
      missing: missing.length,
      codes: missing
    };
  },

  getFetchDateRange(historyRef, code, indId) {
    const pts = historyRef[code]?.[indId];
    if (!pts || !pts.length) return '1960:2025';
    const maxYear = Math.max(...pts.map(p => p.year));
    if (maxYear >= 2024) return null;
    return `${maxYear + 1}:2025`;
  },

  stats() {
    const c = this.load();
    const countries = Object.keys(c.history || {}).length;
    let series = 0, points = 0, minY = null, maxY = null;
    Object.values(c.history || {}).forEach(indicators => {
      Object.values(indicators).forEach(pts => {
        if (!Array.isArray(pts)) return;
        series++;
        points += pts.length;
        pts.forEach(p => {
          if (minY === null || p.year < minY) minY = p.year;
          if (maxY === null || p.year > maxY) maxY = p.year;
        });
      });
    });
    return {
      countries, series, points,
      range: minY ? `${minY}–${maxY}` : '—',
      savedAt: c.meta?.savedAt,
      sizeKB: Math.round((localStorage.getItem(WP_DB_KEY)?.length || 0) / 1024)
    };
  },

  clear() {
    localStorage.removeItem(WP_DB_KEY);
    this._cache = null;
  }
};

/* Cache de fotos de governantes (Wikipedia → localStorage) */
const WP_LEADERS_KEY = 'worldpanel_leaders_v1';

const LeaderDB = {
  _cache: null,

  load() {
    try {
      const raw = localStorage.getItem(WP_LEADERS_KEY);
      if (!raw) return { photos: {}, meta: { savedAt: null } };
      const parsed = JSON.parse(raw);
      this._cache = parsed;
      return parsed;
    } catch (e) {
      return { photos: {}, meta: { savedAt: null } };
    }
  },

  save(data) {
    try {
      const payload = {
        photos: data.photos || {},
        meta: { savedAt: new Date().toISOString(), version: 1 }
      };
      localStorage.setItem(WP_LEADERS_KEY, JSON.stringify(payload));
      this._cache = payload;
      return payload;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        const slim = { photos: {}, meta: { savedAt: new Date().toISOString(), version: 1 } };
        Object.entries(data.photos || {}).slice(0, 40).forEach(([k, v]) => { slim.photos[k] = v; });
        localStorage.setItem(WP_LEADERS_KEY, JSON.stringify(slim));
      }
      return null;
    }
  },

  getPhoto(key) {
    const p = this.load().photos[key];
    return p ? p.url : null;
  },

  setPhoto(key, url, source) {
    const data = this.load();
    data.photos[key] = { url, source: source || 'wiki', savedAt: new Date().toISOString() };
    this.save(data);
  },

  stats() {
    const c = this.load();
    return { count: Object.keys(c.photos || {}).length, savedAt: c.meta?.savedAt };
  }
};
