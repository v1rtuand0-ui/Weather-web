const UI = {
  els: {},

  init() {
    const ids = ['city-name','date-text','temp-value','temp-unit','condition-text','time-label',
      'wind-value','wind-unit','humidity-value','weather-icon','weather-glow',
      'daily-list','hourly-track','hourly-curve','hourly-items',
      'error-toast','error-message','search-panel','search-input','search-results','unit-toggle'];
    ids.forEach(id => {
      this.els[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
    });
  },

  renderHeader(city, currentTime) {
    const label = [city?.name, city?.country].filter(Boolean).join(', ') || 'Unknown location';
    this.els.cityName.textContent = label;
    this.els.dateText.textContent = currentTime ? `(${Utils.formatFullDate(currentTime)})` : '';
  },

  renderCurrent(display, units = 'celsius') {
    if (!display) return;
    let temp = display.temperature;
    if (typeof temp === 'number' && units === 'fahrenheit') temp = Utils.cToF(temp);

    this.els.tempValue.textContent = Utils.safeRound(temp);
    this.els.tempUnit.textContent = units === 'celsius' ? 'C' : 'F';

    const info = getWeatherInfo(display.weatherCode, display.isDay);
    this.els.conditionText.textContent = info.label;

    // Wind
    let wind = display.windSpeed;
    if (typeof wind === 'number' && units === 'fahrenheit') wind = Utils.kmhToMph(wind);
    this.els.windValue.textContent = Utils.safeFixed(wind, 1);
    this.els.windUnit.textContent = units === 'celsius' ? 'km/h' : 'mph';

    this.els.humidityValue.textContent = Utils.safeRound(display.humidity);

    // Icon + glow
    this.els.weatherIcon.innerHTML = ICONS[info.icon] || ICONS.cloudy;
    const glowCat = GLOW_CATEGORY[info.icon] || 'day';
    this.els.weatherGlow.className = `absolute inset-0 glow-bg glow-${glowCat} rounded-full`;

    // Time label (forecast vs now)
    if (display.isNow) {
      this.els.timeLabel.textContent = '';
    } else {
      this.els.timeLabel.textContent = `${Utils.formatHour(display.time)} forecast`;
    }
  },

  renderDaily(daily, activeIndex, units = 'celsius') {
    this.els.dailyList.innerHTML = '';
    const limit = Math.min(CONFIG.DAILY_ROWS, daily.length);
    for (let i = 0; i < limit; i++) {
      const d = daily[i];
      let temp = d.tempMax;
      if (typeof temp === 'number' && units === 'fahrenheit') temp = Utils.cToF(temp);

      const info = getWeatherInfo(d.weatherCode, true);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `daily-row ${i === activeIndex ? 'active' : ''}`;
      btn.dataset.index = i;
      btn.setAttribute('aria-label', `${Utils.formatDayName(d.date)}, ${info.label}, ${Utils.safeRound(temp)} degrees`);
      btn.innerHTML = `
        <div class="w-6 h-6 text-muted shrink-0">${SMALL_ICONS[info.icon] || SMALL_ICONS.cloudy}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">${Utils.formatDayName(d.date)}</p>
          <p class="text-xs text-muted truncate">${info.label}</p>
        </div>
        <span class="text-lg font-light shrink-0">${Utils.safeRound(temp)}°</span>
      `;
      this.els.dailyList.appendChild(btn);
    }
  },

  renderHourly(hourly, hourStartIndex, selectedHourAbsIdx, units = 'celsius') {
    const slots = [];
    for (let i = 0; i < CONFIG.HOURLY_SLOTS; i++) {
      const h = hourly[hourStartIndex + i];
      if (!h) break;
      slots.push({ data: h, absIdx: hourStartIndex + i });
    }

    this.els.hourlyItems.innerHTML = '';
    slots.forEach(({ data: h, absIdx }) => {
      let temp = h.temperature;
      if (typeof temp === 'number' && units === 'fahrenheit') temp = Utils.cToF(temp);
      const info = getWeatherInfo(h.weatherCode, isDayAtTime(h.time));
      const isSelected = absIdx === selectedHourAbsIdx;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `hour-slot ${isSelected ? 'selected' : ''}`;
      btn.dataset.absIdx = absIdx;
      btn.setAttribute('aria-label', `${Utils.formatHour(h.time)}, ${info.label}, ${Utils.safeRound(temp)} degrees${isSelected ? ', selected' : ''}`);
      btn.innerHTML = `
        <div class="hour-dot"></div>
        <div class="hour-icon">${SMALL_ICONS[info.icon] || SMALL_ICONS.cloudy}</div>
        <div class="hour-temp">${Utils.safeRound(temp)}°</div>
        <div class="hour-spacer"></div>
        <div class="hour-label">${Utils.formatHour(h.time)}</div>
      `;
      this.els.hourlyItems.appendChild(btn);
    });

    requestAnimationFrame(() => {
      HourlyChart.render(this.els.hourlyCurve, slots.map(s => s.data));
    });
  },

  showLoading() {
    this.els.tempValue.textContent = '--';
    this.els.conditionText.textContent = 'Loading...';
    this.els.timeLabel.textContent = '';
    this.els.windValue.textContent = '--';
    this.els.humidityValue.textContent = '--';
    this.els.weatherIcon.innerHTML = '';
    this.els.dateText.textContent = '';

    this.els.dailyList.innerHTML = Array.from({ length: 6 }).map(() => `
      <div class="daily-row">
        <div class="w-6 h-6 skeleton rounded"></div>
        <div class="flex-1 space-y-1">
          <div class="h-3 w-16 skeleton"></div>
          <div class="h-2 w-20 skeleton"></div>
        </div>
        <div class="h-4 w-8 skeleton"></div>
      </div>
    `).join('');

    this.els.hourlyItems.innerHTML = Array.from({ length: 8 }).map(() => `
      <div class="hour-slot">
        <div class="h-4 w-8 skeleton"></div>
        <div class="hour-spacer"></div>
        <div class="h-3 w-10 skeleton"></div>
      </div>
    `).join('');
    this.els.hourlyCurve.innerHTML = '';
  },

  showErrorState() {
    this.els.tempValue.textContent = '--';
    this.els.conditionText.textContent = 'Failed to load';
    this.els.timeLabel.textContent = '';
    this.els.windValue.textContent = '--';
    this.els.humidityValue.textContent = '--';
    this.els.weatherIcon.innerHTML = '';
    this.els.dailyList.innerHTML = '';
    this.els.hourlyItems.innerHTML = '';
    this.els.hourlyCurve.innerHTML = '';
  },

  showError(message) {
    this.els.errorMessage.textContent = message;
    this.els.errorToast.classList.remove('hidden');
  },

  hideError() {
    this.els.errorToast.classList.add('hidden');
  }
};