const Utils = {
  formatFullDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  },

  formatDayName(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  },

  formatHour(isoString) {
    const t = (isoString || '').split('T')[1];
    return t ? t.substring(0, 5) : '--:--';
  },

  formatSlotLabel(time, nowTime) {
    const slotDate = (time || '').slice(0, 10);
    const todayDate = (nowTime || '').slice(0, 10);
    const hhmm = this.formatHour(time);
    if (!slotDate) return hhmm;
    if (slotDate === todayDate) return `Today ${hhmm}`;
    const d = new Date(slotDate + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return hhmm;
    return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${hhmm}`;
  },

  getHour(isoString) {
    const t = (isoString || '').split('T')[1];
    return t ? parseInt(t.substring(0, 2), 10) : 0;
  },

  safeRound(v, fallback = '--') {
    if (v === null || v === undefined || Number.isNaN(v)) return fallback;
    return Math.round(v);
  },

  safeFixed(v, decimals = 1, fallback = '--') {
    if (v === null || v === undefined || Number.isNaN(v)) return fallback;
    return Number(v).toFixed(decimals);
  },

  cToF(c) { return c * 9 / 5 + 32; },
  kmhToMph(v) { return v * 0.621371; },

  escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  },

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