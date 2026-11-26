const CONFIG = {
  FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
  GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',

  DEFAULT_CITY: {
    name: 'Jakarta',
    country: 'Indonesia',
    latitude: -6.2088,
    longitude: 106.8456
  },

  FORECAST_DAYS: 7,
  HOURLY_SLOTS: 8,
  DAILY_ROWS: 6,

  CURRENT_FIELDS: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m', 'weather_code', 'is_day'],
  HOURLY_FIELDS: ['temperature_2m', 'weather_code', 'relative_humidity_2m', 'wind_speed_10m'],
  DAILY_FIELDS: ['weather_code', 'temperature_2m_max', 'sunrise', 'sunset'],

  CACHE_MAX_AGE_MS: 30 * 60 * 1000,
  AUTO_REFRESH_MS: 15 * 60 * 1000,
  FETCH_TIMEOUT_MS: 10000,
  SEARCH_DEBOUNCE_MS: 400,
  SEARCH_MIN_CHARS: 2,

  STORAGE_KEYS: {
    CITY: 'weather_app_city',
    CACHE: 'weather_app_cache',
    UNITS: 'weather_app_units'
  }
};