const UI = {
  els: {},

  init() {
    const ids = ['city-name','date-text','temp-value','temp-unit','condition-text',
      'wind-value','humidity-value','weather-icon','daily-list','hourly-track',
      'hourly-curve','hourly-items','error-toast','error-message'];
    ids.forEach(id => {
      this.els[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
    });
  },

  renderHeader(city, currentTime) {
    this.els.cityName.textContent = `${city.name}, ${city.country}`;
    this.els.dateText.textContent = `(${Utils.formatFullDate(currentTime)})`;
  },

  renderCurrent(current, units = 'celsius') {
    let temp = current.temperature;
    if (units === 'fahrenheit') temp = Utils.cToF(temp);

    this.els.tempValue.textContent = Utils.roundTemp(temp);
    this.els.tempUnit.textContent = units === 'celsius' ? 'C' : 'F';

    const info = getWeatherInfo(current.weatherCode, current.isDay);
    this.els.conditionText.textContent = info.label;
    this.els.windValue.textContent = current.windSpeed.toFixed(1);
    this.els.humidityValue.textContent = Math.round(current.humidity);
    this.els.weatherIcon.innerHTML = ICONS[info.icon] || ICONS.cloudy;
  },

  renderDaily(daily, activeIndex, units = 'celsius') {
    this.els.dailyList.innerHTML = '';
    const limit = Math.min(CONFIG.DAILY_ROWS, daily.length);
    for (let i = 0; i < limit; i++) {
      const d = daily[i];
      let temp = d.tempMax;
      if (units === 'fahrenheit') temp = Utils.cToF(temp);

      const info = getWeatherInfo(d.weatherCode, true);
      const row = document.createElement('div');
      row.className = `daily-row ${i === activeIndex ? 'active' : ''}`;
      row.dataset.index = i;
      row.innerHTML = `
        <div class="w-6 h-6 text-muted shrink-0">${SMALL_ICONS[info.icon] || SMALL_ICONS.cloudy}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">${Utils.formatDayName(d.date)}</p>
          <p class="text-xs text-muted truncate">${info.label}</p>
        </div>
        <span class="text-lg font-light shrink-0">${Utils.roundTemp(temp)}°</span>
      `;
      this.els.dailyList.appendChild(row);
    }
  },

  renderHourly(hourly, activeDayIndex, hourStartIndex, selectedIdx, units = 'celsius') {
    const baseIdx = activeDayIndex * 24 + hourStartIndex;
    const slots = [];
    for (let i = 0; i < CONFIG.HOURLY_SLOTS; i++) {
      const h = hourly[baseIdx + i];
      if (!h) break;
      slots.push(h);
    }

    this.els.hourlyItems.innerHTML = '';
    slots.forEach((h, i) => {
      let temp = h.temperature;
      if (units === 'fahrenheit') temp = Utils.cToF(temp);
      const slot = document.createElement('div');
      slot.className = `hour-slot ${i === selectedIdx ? 'selected' : ''}`;
      slot.dataset.index = i;
      slot.innerHTML = `
        <div class="hour-temp">${Utils.roundTemp(temp)}°</div>
        <div class="hour-spacer"></div>
        <div class="hour-label">${Utils.formatHour(h.time)}</div>
      `;
      this.els.hourlyItems.appendChild(slot);
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        HourlyChart.render(this.els.hourlyCurve, slots, selectedIdx);
      });
    });
  },

  showLoading() {
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

    this.els.tempValue.textContent = '--';
    this.els.conditionText.textContent = 'Loading...';
    this.els.hourlyItems.innerHTML = Array.from({ length: 8 }).map(() => `
      <div class="hour-slot">
        <div class="h-4 w-8 skeleton"></div>
        <div class="hour-spacer"></div>
        <div class="h-3 w-10 skeleton"></div>
      </div>
    `).join('');
  },

  showError(message) {
    this.els.errorMessage.textContent = message;
    this.els.errorToast.classList.remove('hidden');
    clearTimeout(this._errTimer);
    this._errTimer = setTimeout(() => this.hideError(), 6000);
  },

  hideError() {
    this.els.errorToast.classList.add('hidden');
  }
};