const API = {
  async searchCity(query) {
    if (!query.trim()) return [];
    const url = `${CONFIG.GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    return data.results || [];
  },

  async getWeather(lat, lon) {
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
    const url = `${CONFIG.FORECAST_URL}?${params.toString()}`;
    const res = await fetch(url);
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

    const hourly = raw.hourly.time.map((time, i) => ({
      time,
      temperature: raw.hourly.temperature_2m[i],
      weatherCode: raw.hourly.weather_code[i]
    }));

    const daily = raw.daily.time.map((date, i) => ({
      date,
      weatherCode: raw.daily.weather_code[i],
      tempMax: raw.daily.temperature_2m_max[i],
      tempMin: raw.daily.temperature_2m_min[i]
    }));

    return { current, hourly, daily };
  }
};