const API = {
  async _fetch(url, { timeoutMs = CONFIG.FETCH_TIMEOUT_MS, signal } = {}) {
    const controller = new AbortController();
    const onUserAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', onUserAbort, { once: true });
    }
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } catch (e) {
      if (timedOut) {
        const t = new Error('Request timed out');
        t.name = 'TimeoutError';
        throw t;
      }
      throw e;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onUserAbort);
    }
  },

  async searchCity(query, { signal } = {}) {
    const trimmed = (query || '').trim();
    if (trimmed.length < CONFIG.SEARCH_MIN_CHARS) return [];
    const url = `${CONFIG.GEOCODING_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;
    const res = await this._fetch(url, { signal });
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    return data.results || [];
  },

  async getWeather(lat, lon, { signal } = {}) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: CONFIG.CURRENT_FIELDS.join(','),
      hourly: CONFIG.HOURLY_FIELDS.join(','),
      daily: CONFIG.DAILY_FIELDS.join(','),
      timezone: 'auto',
      forecast_days: CONFIG.FORECAST_DAYS,
      wind_speed_unit: 'kmh'
    });
    const res = await this._fetch(`${CONFIG.FORECAST_URL}?${params}`, { signal });
    if (!res.ok) throw new Error('Weather request failed');
    return await res.json();
  },

  normalizeWeather(raw) {
    const current = {
      time: raw.current.time,
      temperature: raw.current.temperature_2m,
      humidity: raw.current.relative_humidity_2m,
      windSpeed: raw.current.wind_speed_10m,
      weatherCode: raw.current.weather_code,
      isDay: raw.current.is_day === 1
    };

    const daily = raw.daily.time.map((date, i) => ({
      date,
      weatherCode: raw.daily.weather_code[i],
      tempMax: raw.daily.temperature_2m_max[i],
      sunrise: raw.daily.sunrise?.[i] || null,
      sunset: raw.daily.sunset?.[i] || null
    }));

    const hourly = raw.hourly.time.map((time, i) => {
      const dateStr = time.slice(0, 10);
      const day = daily.find(d => d.date === dateStr);
      let isDay;
      if (day && day.sunrise && day.sunset) {
        isDay = time >= day.sunrise && time < day.sunset;
      } else {
        const h = parseInt(time.slice(11, 13), 10);
        isDay = h >= 6 && h < 18;
      }
      return {
        time,
        temperature: raw.hourly.temperature_2m[i],
        weatherCode: raw.hourly.weather_code[i],
        humidity: raw.hourly.relative_humidity_2m[i],
        windSpeed: raw.hourly.wind_speed_10m[i],
        isDay
      };
    });

    return { current, hourly, daily };
  }
};