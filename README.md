# Weather App

Dark minimalis, data real-time dari Open-Meteo (gratis, tanpa API key).

## Jalankan
1. Buka folder di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
   (atau double-click `index.html` — langsung jalan)

## Fitur
- Cuaca saat ini (suhu, kondisi, wind, humidity)
- Prakiraan 7 hari (6 baris di panel kanan)
- Timeline per jam (8 slot, bisa digeser dengan panah)
- Ganti kota lewat search dropdown
- Cache `localStorage` (kota terakhir + data)
- Atribusi Open-Meteo di footer

## API
- **Geocoding:** `https://geocoding-api.open-meteo.com/v1/search`
- **Forecast:** `https://api.open-meteo.com/v1/forecast`

Data by [Open-Meteo.com](https://open-meteo.com/) — CC BY 4.0.