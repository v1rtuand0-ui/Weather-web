const CONFIG = {
  FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
  GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',

  DEFAULT_CITY: {
    name: 'Jakarta',
    country: 'Indonesia',
    latitude: -6.2088,
    longitude: 106.8456,
    timezone: 'Asia/Jakarta'
  },

  FORECAST_DAYS: 7,
  HOURLY_SLOTS: 8,
  DAILY_ROWS: 6,

  CURRENT_FIELDS: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m', 'weather_code', 'is_day'],
  HOURLY_FIELDS: ['temperature_2m', 'weather_code'],
  DAILY_FIELDS: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],

  STORAGE_KEYS: {
    CITY: 'weather_app_city',
    CACHE: 'weather_app_cache',
    UNITS: 'weather_app_units'
  }
};