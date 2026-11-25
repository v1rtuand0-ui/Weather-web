const Utils = {
  formatFullDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  },

  formatDayName(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  },

  formatHour(isoString) {
    const t = isoString.split('T')[1];
    return t ? t.substring(0, 5) : '--:--';
  },

  roundTemp(v) {
    return Math.round(v);
  },

  getHour(isoString) {
    const t = isoString.split('T')[1];
    return t ? parseInt(t.substring(0, 2), 10) : 0;
  },

  cToF(c) { return c * 9 / 5 + 32; },

  storageGet(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },

  storageSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },

  debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }
};