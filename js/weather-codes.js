const WEATHER_CODES = {
  0:  { label: 'Sunny',            icon: 'clear-day' },
  1:  { label: 'Partly Cloudy',    icon: 'partly-cloudy' },
  2:  { label: 'Partly Cloudy',    icon: 'partly-cloudy' },
  3:  { label: 'Cloudy',           icon: 'cloudy' },
  45: { label: 'Foggy',            icon: 'fog' },
  48: { label: 'Foggy',            icon: 'fog' },
  51: { label: 'Light Rain',       icon: 'drizzle' },
  53: { label: 'Light Rain',       icon: 'drizzle' },
  55: { label: 'Light Rain',       icon: 'drizzle' },
  56: { label: 'Light Rain',       icon: 'drizzle' },
  57: { label: 'Light Rain',       icon: 'drizzle' },
  61: { label: 'Rain',             icon: 'rain' },
  63: { label: 'Rain',             icon: 'rain' },
  65: { label: 'Rain',             icon: 'rain' },
  66: { label: 'Rain',             icon: 'rain' },
  67: { label: 'Rain',             icon: 'rain' },
  71: { label: 'Snow',             icon: 'snow' },
  73: { label: 'Snow',             icon: 'snow' },
  75: { label: 'Snow',             icon: 'snow' },
  77: { label: 'Snow',             icon: 'snow' },
  80: { label: 'Cloudy with Rain', icon: 'rain' },
  81: { label: 'Cloudy with Rain', icon: 'rain' },
  82: { label: 'Cloudy with Rain', icon: 'rain' },
  85: { label: 'Snow',             icon: 'snow' },
  86: { label: 'Snow',             icon: 'snow' },
  95: { label: 'Storm with Rain',  icon: 'storm' },
  96: { label: 'Storm with Rain',  icon: 'storm' },
  99: { label: 'Storm with Rain',  icon: 'storm' }
};

function getWeatherInfo(code, isDay = true) {
  if (code === 0) {
    return { label: isDay ? 'Sunny' : 'Clear', icon: isDay ? 'clear-day' : 'clear-night' };
  }
  return WEATHER_CODES[code] || { label: 'Unknown', icon: 'cloudy' };
}

// ===== Large icons (SVG inline) =====
const ICONS = {
  'clear-day': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFE082"/><stop offset="60%" stop-color="#F5A524"/><stop offset="100%" stop-color="#E08700"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="22" fill="url(#sunGrad)"/>
    <g stroke="#F5A524" stroke-width="3" stroke-linecap="round" opacity="0.85">
      <line x1="50" y1="16" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="84"/>
      <line x1="16" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="84" y2="50"/>
      <line x1="26" y1="26" x2="32" y2="32"/><line x1="68" y1="68" x2="74" y2="74"/>
      <line x1="26" y1="74" x2="32" y2="68"/><line x1="68" y1="32" x2="74" y2="26"/>
    </g>
  </svg>`,

  'clear-night': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><radialGradient id="moonGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="60%" stop-color="#D4D4E0"/><stop offset="100%" stop-color="#8A8AA0"/>
    </radialGradient></defs>
    <path d="M70 25 A30 30 0 1 0 75 75 A25 25 0 1 1 70 25 Z" fill="url(#moonGrad)"/>
  </svg>`,

  'partly-cloudy': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs>
      <radialGradient id="sunG2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFE082"/><stop offset="100%" stop-color="#F5A524"/>
      </radialGradient>
      <linearGradient id="cloudG2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F0F0F5"/><stop offset="100%" stop-color="#8A8AA0"/>
      </linearGradient>
    </defs>
    <circle cx="35" cy="38" r="16" fill="url(#sunG2)"/>
    <path d="M32 78 Q20 78 20 66 Q20 55 32 55 Q34 44 47 44 Q58 38 68 46 Q80 42 85 56 Q93 60 93 70 Q93 78 83 78 Z" fill="url(#cloudG2)"/>
  </svg>`,

  'cloudy': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="cl3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F0F0F5"/><stop offset="100%" stop-color="#8A8AA0"/>
    </linearGradient></defs>
    <path d="M28 72 Q15 72 15 58 Q15 45 30 45 Q32 33 47 33 Q60 26 72 35 Q86 32 90 47 Q98 52 98 62 Q98 72 86 72 Z" fill="url(#cl3)"/>
  </svg>`,

  'fog': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="clf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E0E0E8"/><stop offset="100%" stop-color="#8A8AA0"/>
    </linearGradient></defs>
    <path d="M30 62 Q20 62 20 52 Q20 42 32 42 Q34 32 47 32 Q58 27 68 34 Q78 32 82 44 Q88 48 88 55 Q88 62 78 62 Z" fill="url(#clf)"/>
    <g stroke="#B0B0C0" stroke-width="3" stroke-linecap="round">
      <line x1="20" y1="75" x2="80" y2="75"/><line x1="28" y1="83" x2="72" y2="83"/>
    </g>
  </svg>`,

  'drizzle': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="cld" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8E8F0"/><stop offset="100%" stop-color="#7A7A90"/>
    </linearGradient></defs>
    <path d="M30 60 Q20 60 20 50 Q20 40 32 40 Q34 30 47 30 Q58 25 68 32 Q78 30 82 42 Q88 46 88 53 Q88 60 78 60 Z" fill="url(#cld)"/>
    <g stroke="#6BB6FF" stroke-width="2.5" stroke-linecap="round">
      <line x1="35" y1="70" x2="35" y2="76"/><line x1="50" y1="70" x2="50" y2="76"/><line x1="65" y1="70" x2="65" y2="76"/>
    </g>
  </svg>`,

  'rain': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="clr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E0E0E8"/><stop offset="100%" stop-color="#7A7A90"/>
    </linearGradient></defs>
    <path d="M30 60 Q20 60 20 50 Q20 40 32 40 Q34 30 47 30 Q58 25 68 32 Q78 30 82 42 Q88 46 88 53 Q88 60 78 60 Z" fill="url(#clr)"/>
    <g stroke="#5AA9F0" stroke-width="3" stroke-linecap="round">
      <line x1="30" y1="70" x2="27" y2="80"/><line x1="45" y1="70" x2="42" y2="80"/><line x1="60" y1="70" x2="57" y2="80"/><line x1="75" y1="70" x2="72" y2="80"/>
    </g>
  </svg>`,

  'storm': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs>
      <linearGradient id="clst" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D8D8E4"/><stop offset="100%" stop-color="#6A6A80"/>
      </linearGradient>
    </defs>
    <path d="M30 58 Q20 58 20 48 Q20 38 32 38 Q34 28 47 28 Q58 23 68 30 Q78 28 82 40 Q88 44 88 51 Q88 58 78 58 Z" fill="url(#clst)"/>
    <path d="M52 58 L42 78 L52 78 L46 92 L64 70 L54 70 L60 58 Z" fill="#F5A524"/>
  </svg>`,

  'snow': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="cls" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F0F0F8"/><stop offset="100%" stop-color="#8A8AA0"/>
    </linearGradient></defs>
    <path d="M30 58 Q20 58 20 48 Q20 38 32 38 Q34 28 47 28 Q58 23 68 30 Q78 28 82 40 Q88 44 88 51 Q88 58 78 58 Z" fill="url(#cls)"/>
    <g stroke="#FFFFFF" stroke-width="2" stroke-linecap="round">
      <g transform="translate(35,74)"><line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="-3" y1="-3" x2="3" y2="3"/><line x1="-3" y1="3" x2="3" y2="-3"/></g>
      <g transform="translate(55,80)"><line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="-3" y1="-3" x2="3" y2="3"/><line x1="-3" y1="3" x2="3" y2="-3"/></g>
      <g transform="translate(72,72)"><line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="-3" y1="-3" x2="3" y2="3"/><line x1="-3" y1="3" x2="3" y2="-3"/></g>
    </g>
  </svg>`
};

// ===== Small icons (line-based, untuk panel harian) =====
const SMALL_ICONS = {
  'clear-day': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19" y2="19"/><line x1="5" y1="19" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19" y2="5"/></svg>`,
  'clear-night': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  'partly-cloudy': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><circle cx="8" cy="8" r="2.5"/><line x1="8" y1="2" x2="8" y2="3"/><line x1="2" y1="8" x2="3" y2="8"/><line x1="3.8" y1="3.8" x2="4.6" y2="4.6"/><path d="M10 18h8a3 3 0 1 0-1-5.83A4 4 0 0 0 9 13"/></svg>`,
  'cloudy': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 17h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 17z"/></svg>`,
  'fog': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M4 12h16M4 16h16M6 8h12"/></svg>`,
  'drizzle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 13h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 13z"/><line x1="9" y1="17" x2="9" y2="18"/><line x1="13" y1="17" x2="13" y2="18"/><line x1="17" y1="17" x2="17" y2="18"/></svg>`,
  'rain': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 13h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 13z"/><line x1="8" y1="16" x2="7" y2="20"/><line x1="12" y1="16" x2="11" y2="20"/><line x1="16" y1="16" x2="15" y2="20"/></svg>`,
  'storm': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M18 12h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 12z"/><path d="M13 13l-3 5h4l-1 4 4-6h-3l2-3z"/></svg>`,
  'snow': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 13h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 13z"/><line x1="8" y1="17" x2="8" y2="19"/><line x1="7" y1="18" x2="9" y2="18"/><line x1="13" y1="17" x2="13" y2="19"/><line x1="12" y1="18" x2="14" y2="18"/><line x1="17" y1="17" x2="17" y2="19"/><line x1="16" y1="18" x2="18" y2="18"/></svg>`
};