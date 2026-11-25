const state = {
  city: null,
  weather: null,
  activeDayIndex: 0,
  hourStartIndex: 0,
  selectedHourIdx: 0,
  units: 'celsius'
};

async function loadWeather(city) {
  UI.showLoading();
  try {
    const raw = await API.getWeather(city.latitude, city.longitude);
    const data = API.normalizeWeather(raw);

    state.city = city;
    state.weather = data;

    Utils.storageSet(CONFIG.STORAGE_KEYS.CITY, city);

    const nowHour = Utils.getHour(data.current.time);
    state.activeDayIndex = 0;
    state.hourStartIndex = Math.max(0, nowHour - 1);
    state.hourStartIndex = Math.min(state.hourStartIndex, 24 - CONFIG.HOURLY_SLOTS);
    state.selectedHourIdx = Math.min(nowHour - state.hourStartIndex, CONFIG.HOURLY_SLOTS - 1);

    renderAll();
    UI.hideError();
  } catch (err) {
    console.error(err);
    const cached = Utils.storageGet(CONFIG.STORAGE_KEYS.CACHE);
    if (cached && cached.city) {
      state.city = cached.city;
      state.weather = cached.data;
      renderAll();
      UI.showError('Offline — showing cached data');
    } else {
      UI.showError('Failed to load weather data');
    }
  }
}

function renderAll() {
  const { city, weather, activeDayIndex, hourStartIndex, selectedHourIdx, units } = state;
  UI.renderHeader(city, weather.current.time);
  UI.renderCurrent(weather.current, units);
  UI.renderDaily(weather.daily, activeDayIndex, units);
  UI.renderHourly(weather.hourly, activeDayIndex, hourStartIndex, selectedHourIdx, units);

  Utils.storageSet(CONFIG.STORAGE_KEYS.CACHE, {
    city,
    data: weather,
    savedAt: Date.now()
  });
}

function onDailyClick(e) {
  const row = e.target.closest('.daily-row');
  if (!row || !state.weather) return;

  state.activeDayIndex = parseInt(row.dataset.index, 10);

  if (state.activeDayIndex === 0) {
    const nowHour = Utils.getHour(state.weather.current.time);
    state.hourStartIndex = Math.max(0, nowHour - 1);
    state.hourStartIndex = Math.min(state.hourStartIndex, 24 - CONFIG.HOURLY_SLOTS);
    state.selectedHourIdx = Math.min(nowHour - state.hourStartIndex, CONFIG.HOURLY_SLOTS - 1);
  } else {
    state.hourStartIndex = 0;
    state.selectedHourIdx = 0;
  }

  UI.renderDaily(state.weather.daily, state.activeDayIndex, state.units);
  UI.renderHourly(state.weather.hourly, state.activeDayIndex, state.hourStartIndex, state.selectedHourIdx, state.units);
}

function onHourClick(e) {
  const slot = e.target.closest('.hour-slot');
  if (!slot || !state.weather) return;
  state.selectedHourIdx = parseInt(slot.dataset.index, 10);
  UI.renderHourly(state.weather.hourly, state.activeDayIndex, state.hourStartIndex, state.selectedHourIdx, state.units);
}

function onHourPrev() {
  if (state.hourStartIndex <= 0) return;
  state.hourStartIndex--;
  state.selectedHourIdx = Math.max(0, state.selectedHourIdx - 1);
  UI.renderHourly(state.weather.hourly, state.activeDayIndex, state.hourStartIndex, state.selectedHourIdx, state.units);
}

function onHourNext() {
  const maxStart = 24 - CONFIG.HOURLY_SLOTS;
  if (state.hourStartIndex >= maxStart) return;
  state.hourStartIndex++;
  state.selectedHourIdx = Math.min(CONFIG.HOURLY_SLOTS - 1, state.selectedHourIdx + 1);
  UI.renderHourly(state.weather.hourly, state.activeDayIndex, state.hourStartIndex, state.selectedHourIdx, state.units);
}

const doSearch = Utils.debounce(async (query) => {
  const ul = document.getElementById('search-results');
  if (!query.trim()) { ul.innerHTML = ''; return; }
  try {
    const results = await API.searchCity(query);
    if (results.length === 0) {
      ul.innerHTML = '<li class="text-muted text-xs">City not found</li>';
      return;
    }
    ul.innerHTML = results.map((r, i) => `
      <li data-idx="${i}">
        <div class="font-medium">${r.name}${r.admin1 ? ', ' + r.admin1 : ''}</div>
        <div class="text-xs text-muted">${r.country}</div>
      </li>
    `).join('');
    ul.querySelectorAll('li[data-idx]').forEach(li => {
      li.addEventListener('click', () => {
        const r = results[parseInt(li.dataset.idx, 10)];
        const city = {
          name: r.name,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone
        };
        document.getElementById('search-panel').classList.add('hidden');
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
        loadWeather(city);
      });
    });
  } catch (err) {
    console.error(err);
    ul.innerHTML = '<li class="text-muted text-xs">Search failed</li>';
  }
}, 400);

function onCityButtonClick() {
  const panel = document.getElementById('search-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    document.getElementById('search-input').focus();
  }
}

function init() {
  UI.init();

  state.units = Utils.storageGet(CONFIG.STORAGE_KEYS.UNITS, 'celsius');
  const lastCity = Utils.storageGet(CONFIG.STORAGE_KEYS.CITY, CONFIG.DEFAULT_CITY);

  document.getElementById('city-button').addEventListener('click', onCityButtonClick);
  document.getElementById('search-input').addEventListener('input', e => doSearch(e.target.value));
  document.getElementById('daily-list').addEventListener('click', onDailyClick);
  document.getElementById('hourly-items').addEventListener('click', onHourClick);
  document.getElementById('hour-prev').addEventListener('click', onHourPrev);
  document.getElementById('hour-next').addEventListener('click', onHourNext);
  document.getElementById('error-retry').addEventListener('click', () => loadWeather(state.city || lastCity));

  document.addEventListener('click', e => {
    const panel = document.getElementById('search-panel');
    const btn = document.getElementById('city-button');
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.add('hidden');
    }
  });

  window.addEventListener('resize', Utils.debounce(() => {
    if (state.weather) {
      UI.renderHourly(state.weather.hourly, state.activeDayIndex, state.hourStartIndex, state.selectedHourIdx, state.units);
    }
  }, 150));

  loadWeather(lastCity);
}

document.addEventListener('DOMContentLoaded', init);