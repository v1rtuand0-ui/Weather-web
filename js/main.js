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
  return Math.min(dayIdx * 24 + 8, maxHourStart());
}

function defaultSelectedForDay(dayIdx) {
  if (dayIdx === 0) return state.currentHourIdx;
  return Math.min(dayIdx * 24 + 12, (state.weather?.hourly.length || 1) - 1);
}

function getDisplayData() {
  const { weather, selectedHourAbsIdx, currentHourIdx } = state;
  if (!weather) return null;
  const nowTime = weather.current.time;
  if (selectedHourAbsIdx === currentHourIdx) {
    return { ...weather.current, isNow: true, nowTime };
  }
  const h = weather.hourly[selectedHourAbsIdx];
  if (!h) return { ...weather.current, isNow: true, nowTime };
  return {
    temperature: h.temperature,
    weatherCode: h.weatherCode,
    isDay: typeof h.isDay === 'boolean' ? h.isDay : true,
    humidity: h.humidity,
    windSpeed: h.windSpeed,
    time: h.time,
    isNow: false,
    nowTime
  };
}

function renderAll() {
  if (!state.city || !state.weather) return;
  UI.renderHeader(state.city, state.weather.current.time);
  UI.renderCurrent(getDisplayData(), state.units);
  UI.renderDaily(state.weather.daily, state.activeDayIndex, state.units, state.weather.current);
  UI.renderHourly(state.weather.hourly, state.hourStartIndex, state.selectedHourAbsIdx, state.units);
  updateArrowButtons();
}

function renderCurrentOnly() {
  UI.renderCurrent(getDisplayData(), state.units);
}

function renderDailyOnly() {
  if (!state.weather) return;
  UI.renderDaily(state.weather.daily, state.activeDayIndex, state.units, state.weather.current);
}

function renderHourlyOnly() {
  if (!state.weather) return;
  UI.renderHourly(state.weather.hourly, state.hourStartIndex, state.selectedHourAbsIdx, state.units);
  updateArrowButtons();
}

function updateArrowButtons() {
  UI.els.hourPrev.disabled = state.hourStartIndex <= 0;
  UI.els.hourNext.disabled = state.hourStartIndex >= maxHourStart();
}

function syncActiveDayFromWindow() {
  if (!state.weather) return;
  const visibleStart = state.hourStartIndex;
  const visibleEnd = visibleStart + CONFIG.HOURLY_SLOTS - 1;
  const sel = state.selectedHourAbsIdx;
  const refIdx = (sel >= visibleStart && sel <= visibleEnd) ? sel : visibleStart;
  const refHour = state.weather.hourly[refIdx];
  if (!refHour) return;
  const dateStr = refHour.time.slice(0, 10);
  const dayIdx = state.weather.daily.findIndex(d => d.date === dateStr);
  if (dayIdx >= 0 && dayIdx !== state.activeDayIndex) {
    state.activeDayIndex = dayIdx;
    renderDailyOnly();
  }
}

function saveCache() {
  Utils.storageSet(CONFIG.STORAGE_KEYS.CACHE, {
    city: state.city,
    data: state.weather,
    savedAt: Date.now()
  });
}

async function loadWeather(city, { silent = false } = {}) {
  const token = ++state.weatherToken;
  state.loading = true;

  const wasOnNow = silent && state.weather && state.selectedHourAbsIdx === state.currentHourIdx;
  const prevSelectedTime = state.weather?.hourly[state.selectedHourAbsIdx]?.time || null;
  const prevStartTime = state.weather?.hourly[state.hourStartIndex]?.time || null;

  if (!silent) {
    UI.showLoading();
    UI.hideError();
  }

  if (state.weatherAbort) state.weatherAbort.abort();
  state.weatherAbort = new AbortController();

  try {
    const raw = await API.getWeather(city.latitude, city.longitude, { signal: state.weatherAbort.signal });
    if (token !== state.weatherToken) return;

    const data = API.normalizeWeather(raw);
    state.city = city;
    state.weather = data;
    state.currentHourIdx = findCurrentHourIndex(data);

    if (silent) {
      if (wasOnNow) {
        state.selectedHourAbsIdx = state.currentHourIdx;
        state.hourStartIndex = Math.max(0, Math.min(state.currentHourIdx - 1, maxHourStart()));
      } else {
        const selIdx = prevSelectedTime ? data.hourly.findIndex(h => h.time === prevSelectedTime) : -1;
        if (selIdx >= 0) {
          const startIdx = prevStartTime ? data.hourly.findIndex(h => h.time === prevStartTime) : -1;
          state.selectedHourAbsIdx = selIdx;
          state.hourStartIndex = Math.max(0, Math.min(startIdx >= 0 ? startIdx : selIdx - 1, maxHourStart()));
        } else {
          state.selectedHourAbsIdx = state.currentHourIdx;
          state.hourStartIndex = defaultHourStartForDay(0);
        }
      }
      const d = data.hourly[state.selectedHourAbsIdx]?.time.slice(0, 10);
      const di = data.daily.findIndex(x => x.date === d);
      state.activeDayIndex = di >= 0 ? di : 0;
    } else {
      state.activeDayIndex = 0;
      state.selectedHourAbsIdx = state.currentHourIdx;
      state.hourStartIndex = defaultHourStartForDay(0);
    }

    Utils.storageSet(CONFIG.STORAGE_KEYS.CITY, city);
    saveCache();
    UI.hideError();
    renderAll();
  } catch (err) {
    if (token !== state.weatherToken) return;
    console.error('[weather]', err);
    if (silent) {
      UI.showError('Refresh failed. Showing previous data.');
    } else {
      await tryCacheOrFail(city, err);
    }
  } finally {
    if (token === state.weatherToken) state.loading = false;
  }
}

async function tryCacheOrFail(city, err) {
  const cached = Utils.storageGet(CONFIG.STORAGE_KEYS.CACHE);
  const fresh = cached && (Date.now() - (cached.savedAt || 0) < CONFIG.CACHE_MAX_AGE_MS);
  const sameCity = fresh && cached.city &&
    Math.round((cached.city.latitude || 0) * 100) === Math.round((city.latitude || 0) * 100) &&
    Math.round((cached.city.longitude || 0) * 100) === Math.round((city.longitude || 0) * 100);

  if (sameCity && cached.data) {
    state.city = cached.city;
    state.weather = cached.data;
    state.currentHourIdx = findCurrentHourIndex(cached.data);
    state.activeDayIndex = 0;
    state.hourStartIndex = defaultHourStartForDay(0);
    state.selectedHourAbsIdx = state.currentHourIdx;
    renderAll();
    const mins = Math.round((Date.now() - cached.savedAt) / 60000);
    const age = `${mins} min old`;
    UI.showError(navigator.onLine
      ? `Couldn't refresh — showing cached data (${age})`
      : `Offline — showing cached data (${age})`);
    return;
  }

  state.city = city;
  UI.showErrorState();
  const isOffline = !navigator.onLine;
  UI.showError(isOffline ? 'You appear to be offline.' : 'Failed to load weather data.');
}

function onDailyClick(e) {
  if (e.target.closest('[data-action="retry"]')) {
    loadWeather(state.city || Utils.storageGet(CONFIG.STORAGE_KEYS.CITY, CONFIG.DEFAULT_CITY));
    return;
  }
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
  syncActiveDayFromWindow();
  renderHourlyOnly();
  renderCurrentOnly();
}

function onHourPrev() {
  if (!state.weather || state.hourStartIndex <= 0) return;
  state.hourStartIndex--;
  syncActiveDayFromWindow();
  renderHourlyOnly();
}

function onHourNext() {
  if (!state.weather || state.hourStartIndex >= maxHourStart()) return;
  state.hourStartIndex++;
  syncActiveDayFromWindow();
  renderHourlyOnly();
}

function onUnitToggle() {
  state.units = state.units === 'celsius' ? 'fahrenheit' : 'celsius';
  Utils.storageSet(CONFIG.STORAGE_KEYS.UNITS, state.units);
  UI.els.unitToggle.textContent = state.units === 'celsius' ? '°C' : '°F';
  if (state.weather) {
    renderCurrentOnly();
    renderDailyOnly();
    renderHourlyOnly();
  }
}

async function doSearch(query) {
  const ul = UI.els.searchResults;
  const trimmed = (query || '').trim();

  if (trimmed.length < CONFIG.SEARCH_MIN_CHARS) {
    if (state.searchAbort) state.searchAbort.abort();
    state.searchToken++;
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
    if (token !== state.searchToken) return [];

    if (!results.length) {
      ul.innerHTML = '<li class="text-muted text-xs">City not found</li>';
      return [];
    }

    ul.innerHTML = results.map((r, i) => {
      const line1 = [r.name, r.admin1].filter(Boolean).map(Utils.escapeHTML).join(', ');
      const line2 = Utils.escapeHTML(r.country || '');
      return `<li id="search-opt-${i}" data-idx="${i}" role="option" aria-selected="false">
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

    return results;
  } catch (err) {
    if (err.name === 'AbortError') return [];
    if (token !== state.searchToken) return [];
    if (err.name === 'TimeoutError') {
      ul.innerHTML = '<li class="text-muted text-xs">Search timed out. Try again.</li>';
      return [];
    }
    console.error('[search]', err);
    ul.innerHTML = '<li class="text-muted text-xs">Search failed</li>';
    return [];
  }
}

function moveSearchSelection(dir) {
  const ul = UI.els.searchResults;
  const items = ul.querySelectorAll('li[data-idx]');
  if (!items.length) return;
  let current = -1;
  items.forEach((li, i) => { if (li.getAttribute('aria-selected') === 'true') current = i; });
  let next = current + dir;
  if (next < 0) next = items.length - 1;
  if (next >= items.length) next = 0;
  items.forEach((li, i) => li.setAttribute('aria-selected', i === next ? 'true' : 'false'));
  UI.els.searchInput.setAttribute('aria-activedescendant', items[next].id);
}

function closeSearchPanel() {
  UI.els.searchPanel.classList.add('hidden');
  UI.els.cityButton.setAttribute('aria-expanded', 'false');
  UI.els.searchInput.setAttribute('aria-expanded', 'false');
  UI.els.searchInput.value = '';
  UI.els.searchResults.innerHTML = '';
  UI.els.searchInput.removeAttribute('aria-activedescendant');
}

function onCityButtonClick() {
  const panel = UI.els.searchPanel;
  panel.classList.toggle('hidden');
  const isOpen = !panel.classList.contains('hidden');
  UI.els.cityButton.setAttribute('aria-expanded', String(isOpen));
  UI.els.searchInput.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) UI.els.searchInput.focus();
}

function init() {
  UI.init();

  state.units = Utils.storageGet(CONFIG.STORAGE_KEYS.UNITS, 'celsius');
  UI.els.unitToggle.textContent = state.units === 'celsius' ? '°C' : '°F';

  const lastCity = Utils.storageGet(CONFIG.STORAGE_KEYS.CITY, CONFIG.DEFAULT_CITY);

  UI.els.cityButton.addEventListener('click', onCityButtonClick);

  const searchInput = UI.els.searchInput;
  searchInput.addEventListener('input', Utils.debounce(e => doSearch(e.target.value), CONFIG.SEARCH_DEBOUNCE_MS));
  searchInput.addEventListener('keydown', async (e) => {
    const pickResult = () =>
      UI.els.searchResults.querySelector('li[aria-selected="true"]') ||
      UI.els.searchResults.querySelector('li[data-idx="0"]');
    if (e.key === 'Enter') {
      const first = pickResult();
      if (first) {
        first.click();
      } else if (searchInput.value.trim().length >= CONFIG.SEARCH_MIN_CHARS) {
        await doSearch(searchInput.value);
        const f = pickResult();
        if (f) f.click();
      }
    } else if (e.key === 'Escape') {
      closeSearchPanel();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveSearchSelection(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveSearchSelection(-1);
    }
  });

  UI.els.dailyList.addEventListener('click', onDailyClick);
  UI.els.hourlyItems.addEventListener('click', onHourClick);
  UI.els.hourPrev.addEventListener('click', onHourPrev);
  UI.els.hourNext.addEventListener('click', onHourNext);
  UI.els.unitToggle.addEventListener('click', onUnitToggle);
  UI.els.errorRetry.addEventListener('click', () => loadWeather(state.city || lastCity));
  UI.els.errorDismiss.addEventListener('click', UI.hideError.bind(UI));

  document.addEventListener('click', (e) => {
    const panel = UI.els.searchPanel;
    const btn = UI.els.cityButton;
    if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !btn.contains(e.target)) {
      closeSearchPanel();
    }
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(Utils.debounce(() => {
      if (state.weather) renderHourlyOnly();
    }, 150)).observe(UI.els.hourlyTrack);
  } else {
    window.addEventListener('resize', Utils.debounce(() => {
      if (state.weather) renderHourlyOnly();
    }, 150));
  }

  setInterval(() => {
    if (state.city && !state.loading && document.visibilityState === 'visible') {
      loadWeather(state.city, { silent: true });
    }
  }, CONFIG.AUTO_REFRESH_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !state.city || state.loading) return;
    const cached = Utils.storageGet(CONFIG.STORAGE_KEYS.CACHE);
    if (cached && (Date.now() - (cached.savedAt || 0)) > 10 * 60 * 1000) {
      loadWeather(state.city, { silent: true });
    }
  });

  loadWeather(lastCity);
}

document.addEventListener('DOMContentLoaded', init);