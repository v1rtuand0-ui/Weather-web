const state = {
  city: null,
  weather: null,
  currentHourIdx: 0,
  hourStartIndex: 0,
  selectedHourAbsIdx: 0,
  activeDayIndex: 0,
  units: 'celsius',
  loading: false,
  weatherAbort: null,
  searchAbort: null,
  searchToken: 0,
  weatherToken: 0
};

function findCurrentHourIndex(weather) {
  const prefix = weather.current.time.substring(0, 13);
  const idx = weather.hourly.findIndex(h => h.time.substring(0, 13) === prefix);
  return idx >= 0 ? idx : 0;
}

function maxHourStart() {
  return Math.max(0, (state.weather?.hourly.length || 0) - CONFIG.HOURLY_SLOTS);
}

function defaultHourStartForDay(dayIdx) {
  if (dayIdx === 0) return Math.max(0, Math.min(state.currentHourIdx - 1, maxHourStart()));
  return Math.min(dayIdx * 24, maxHourStart());
}

function defaultSelectedForDay(dayIdx) {
  if (dayIdx === 0) return state.currentHourIdx;
  return Math.min(dayIdx * 24, (state.weather?.hourly.length || 1) - 1);
}

function getDisplayData() {
  const { weather, selectedHourAbsIdx, currentHourIdx } = state;
  if (!weather) return null;
  if (selectedHourAbsIdx === currentHourIdx) {
    return { ...weather.current, isNow: true };
  }
  const h = weather.hourly[selectedHourAbsIdx];
  if (!h) return { ...weather.current, isNow: true };
  return {
    temperature: h.temperature,
    weatherCode: h.weatherCode,
    isDay: isDayAtTime(h.time),
    humidity: h.humidity,
    windSpeed: h.windSpeed,
    time: h.time,
    isNow: false
  };
}

function renderAll() {
  if (!state.city || !state.weather) return;
  UI.renderHeader(state.city, state.weather.current.time);
  UI.renderCurrent(getDisplayData(), state.units);
  UI.renderDaily(state.weather.daily, state.activeDayIndex, state.units, state.weather.current);
  UI.renderHourly(state.weather.hourly, state.hourStartIndex, state.selectedHourAbsIdx, state.units);
  updateArrowButtons();
  saveCache();
}

function renderCurrentOnly() {
  UI.renderCurrent(getDisplayData(), state.units);
}

function renderDailyOnly() {
  UI.renderDaily(state.weather.daily, state.activeDayIndex, state.units, state.weather.current);
}

function renderHourlyOnly() {
  UI.renderHourly(state.weather.hourly, state.hourStartIndex, state.selectedHourAbsIdx, state.units);
  updateArrowButtons();
}

function updateArrowButtons() {
  const prev = document.getElementById('hour-prev');
  const next = document.getElementById('hour-next');
  if (prev) prev.disabled = state.hourStartIndex <= 0;
  if (next) next.disabled = state.hourStartIndex >= maxHourStart();
}

function saveCache() {
  Utils.storageSet(CONFIG.STORAGE_KEYS.CACHE, {
    city: state.city,
    data: state.weather,
    savedAt: Date.now()
  });
}

async function loadWeather(city) {
  const token = ++state.weatherToken;
  state.loading = true;
  UI.showLoading();
  UI.hideError();

  if (state.weatherAbort) state.weatherAbort.abort();
  state.weatherAbort = new AbortController();

  try {
    const raw = await API.getWeather(city.latitude, city.longitude, { signal: state.weatherAbort.signal });
    if (token !== state.weatherToken) return;

    const data = API.normalizeWeather(raw);
    state.city = city;
    state.weather = data;
    state.currentHourIdx = findCurrentHourIndex(data);
    state.activeDayIndex = 0;
    state.hourStartIndex = defaultHourStartForDay(0);
    state.selectedHourAbsIdx = state.currentHourIdx;

    Utils.storageSet(CONFIG.STORAGE_KEYS.CITY, city);
    UI.hideError();
    renderAll();
  } catch (err) {
    if (err.name === 'AbortError' && token !== state.weatherToken) return;
    if (token !== state.weatherToken) return;
    console.error('[weather]', err);
    await tryCacheOrFail(city, err);
  } finally {
    if (token === state.weatherToken) state.loading = false;
  }
}

async function tryCacheOrFail(city, err) {
  const cached = Utils.storageGet(CONFIG.STORAGE_KEYS.CACHE);
  const fresh = cached && (Date.now() - (cached.savedAt || 0) < CONFIG.CACHE_MAX_AGE_MS);

  if (fresh && cached.data && cached.city) {
    state.city = cached.city;
    state.weather = cached.data;
    state.currentHourIdx = findCurrentHourIndex(cached.data);
    state.activeDayIndex = 0;
    state.hourStartIndex = defaultHourStartForDay(0);
    state.selectedHourAbsIdx = state.currentHourIdx;
    renderAll();
    const mins = Math.round((Date.now() - cached.savedAt) / 60000);
    UI.showError(`Offline — showing cached data (${mins} min old)`);
    return;
  }

  UI.showErrorState();
  const isOffline = !navigator.onLine;
  UI.showError(isOffline ? 'You appear to be offline.' : 'Failed to load weather data.');
  state.city = city;
}

function onDailyClick(e) {
  const btn = e.target.closest('.daily-row');
  if (!btn || !state.weather) return;
  const idx = parseInt(btn.dataset.index, 10);
  if (Number.isNaN(idx)) return;

  state.activeDayIndex = idx;
  state.hourStartIndex = defaultHourStartForDay(idx);
  state.selectedHourAbsIdx = defaultSelectedForDay(idx);

  renderDailyOnly();
  renderHourlyOnly();
  renderCurrentOnly();
}

function onHourClick(e) {
  const btn = e.target.closest('.hour-slot');
  if (!btn || !state.weather) return;
  const absIdx = parseInt(btn.dataset.absIdx, 10);
  if (Number.isNaN(absIdx)) return;
  state.selectedHourAbsIdx = absIdx;
  renderHourlyOnly();
  renderCurrentOnly();
}

function onHourPrev() {
  if (!state.weather || state.hourStartIndex <= 0) return;
  state.hourStartIndex--;
  renderHourlyOnly();
}

function onHourNext() {
  if (!state.weather || state.hourStartIndex >= maxHourStart()) return;
  state.hourStartIndex++;
  renderHourlyOnly();
}

function onUnitToggle() {
  state.units = state.units === 'celsius' ? 'fahrenheit' : 'celsius';
  Utils.storageSet(CONFIG.STORAGE_KEYS.UNITS, state.units);
  document.getElementById('unit-toggle').textContent = state.units === 'celsius' ? '°C' : '°F';
  if (state.weather) {
    renderCurrentOnly();
    renderDailyOnly();
    renderHourlyOnly();
  }
}

async function doSearch(query) {
  const ul = document.getElementById('search-results');
  const trimmed = (query || '').trim();

  if (trimmed.length < CONFIG.SEARCH_MIN_CHARS) {
    ul.innerHTML = trimmed.length > 0
      ? `<li class="text-muted text-xs">Type at least ${CONFIG.SEARCH_MIN_CHARS} characters</li>`
      : '';
    return;
  }

  if (state.searchAbort) state.searchAbort.abort();
  state.searchAbort = new AbortController();
  const token = ++state.searchToken;

  ul.innerHTML = '<li class="text-muted text-xs">Searching...</li>';

  try {
    const results = await API.searchCity(trimmed, { signal: state.searchAbort.signal });
    if (token !== state.searchToken) return;

    if (!results.length) {
      ul.innerHTML = '<li class="text-muted text-xs">City not found</li>';
      return;
    }

    ul.innerHTML = results.map((r, i) => {
      const line1 = [r.name, r.admin1].filter(Boolean).map(Utils.escapeHTML).join(', ');
      const line2 = Utils.escapeHTML(r.country || '');
      return `<li data-idx="${i}" role="option">
        <div class="font-medium">${line1}</div>
        <div class="text-xs text-muted">${line2}</div>
      </li>`;
    }).join('');

    ul.querySelectorAll('li[data-idx]').forEach(li => {
      li.addEventListener('click', () => {
        const r = results[parseInt(li.dataset.idx, 10)];
        if (!r) return;
        const city = {
          name: r.name,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude
        };
        closeSearchPanel();
        loadWeather(city);
      });
    });
  } catch (err) {
    if (err.name === 'AbortError') return;
    if (token !== state.searchToken) return;
    console.error('[search]', err);
    ul.innerHTML = '<li class="text-muted text-xs">Search failed</li>';
  }
}

function closeSearchPanel() {
  const panel = document.getElementById('search-panel');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  panel.classList.add('hidden');
  input.value = '';
  results.innerHTML = '';
}

function onCityButtonClick() {
  const panel = document.getElementById('search-panel');
  const input = document.getElementById('search-input');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) input.focus();
}

function init() {
  UI.init();

  state.units = Utils.storageGet(CONFIG.STORAGE_KEYS.UNITS, 'celsius');
  document.getElementById('unit-toggle').textContent = state.units === 'celsius' ? '°C' : '°F';

  const lastCity = Utils.storageGet(CONFIG.STORAGE_KEYS.CITY, CONFIG.DEFAULT_CITY);

  document.getElementById('city-button').addEventListener('click', onCityButtonClick);

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', Utils.debounce(e => doSearch(e.target.value), CONFIG.SEARCH_DEBOUNCE_MS));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = document.querySelector('#search-results li[data-idx="0"]');
      if (first) first.click();
    } else if (e.key === 'Escape') {
      closeSearchPanel();
    }
  });

  document.getElementById('daily-list').addEventListener('click', onDailyClick);
  document.getElementById('hourly-items').addEventListener('click', onHourClick);
  document.getElementById('hour-prev').addEventListener('click', onHourPrev);
  document.getElementById('hour-next').addEventListener('click', onHourNext);
  document.getElementById('unit-toggle').addEventListener('click', onUnitToggle);
  document.getElementById('error-retry').addEventListener('click', () => loadWeather(state.city || lastCity));
  document.getElementById('error-dismiss').addEventListener('click', UI.hideError.bind(UI));

  document.addEventListener('click', (e) => {
    const panel = document.getElementById('search-panel');
    const btn = document.getElementById('city-button');
    if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !btn.contains(e.target)) {
      closeSearchPanel();
    }
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(Utils.debounce(() => {
      if (state.weather) renderHourlyOnly();
    }, 150)).observe(document.getElementById('hourly-track'));
  } else {
    window.addEventListener('resize', Utils.debounce(() => {
      if (state.weather) renderHourlyOnly();
    }, 150));
  }

  setInterval(() => {
    if (state.city && !state.loading && document.visibilityState === 'visible') {
      loadWeather(state.city);
    }
  }, CONFIG.AUTO_REFRESH_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !state.city || state.loading) return;
    const cached = Utils.storageGet(CONFIG.STORAGE_KEYS.CACHE);
    if (cached && (Date.now() - (cached.savedAt || 0)) > 10 * 60 * 1000) {
      loadWeather(state.city);
    }
  });

  loadWeather(lastCity);
}

document.addEventListener('DOMContentLoaded', init);