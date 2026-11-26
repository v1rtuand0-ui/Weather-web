const WEATHER_CODES = {
  0:  { label: 'Sunny',            icon: 'clear-day' },
  1:  { label: 'Mostly Clear',     icon: 'partly-cloudy' },
  2:  { label: 'Partly Cloudy',    icon: 'partly-cloudy' },
  3:  { label: 'Cloudy',           icon: 'cloudy' },
  45: { label: 'Foggy',            icon: 'fog' },
  48: { label: 'Foggy',            icon: 'fog' },
  51: { label: 'Light Drizzle',    icon: 'drizzle' },
  53: { label: 'Drizzle',          icon: 'drizzle' },
  55: { label: 'Heavy Drizzle',    icon: 'drizzle' },
  56: { label: 'Freezing Drizzle', icon: 'drizzle' },
  57: { label: 'Freezing Drizzle', icon: 'drizzle' },
  61: { label: 'Light Rain',       icon: 'rain' },
  63: { label: 'Rain',             icon: 'rain' },
  65: { label: 'Heavy Rain',       icon: 'rain' },
  66: { label: 'Freezing Rain',    icon: 'rain' },
  67: { label: 'Freezing Rain',    icon: 'rain' },
  71: { label: 'Light Snow',       icon: 'snow' },
  73: { label: 'Snow',             icon: 'snow' },
  75: { label: 'Heavy Snow',       icon: 'snow' },
  77: { label: 'Snow Grains',      icon: 'snow' },
  80: { label: 'Light Showers',    icon: 'rain' },
  81: { label: 'Rain Showers',     icon: 'rain' },
  82: { label: 'Heavy Showers',    icon: 'rain' },
  85: { label: 'Snow Showers',     icon: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'snow' },
  95: { label: 'Storm with Rain',  icon: 'storm' },
  96: { label: 'Storm with Hail',  icon: 'storm' },
  99: { label: 'Severe Storm',     icon: 'storm' }
};

const GLOW_CATEGORY = {
  'clear-day': 'day', 'clear-night': 'night',
  'partly-cloudy': 'day', 'partly-cloudy-night': 'night',
  'cloudy': 'fog', 'fog': 'fog',
  'drizzle': 'rain', 'rain': 'rain', 'storm': 'storm',
  'snow': 'snow'
};

function getWeatherInfo(code, isDay = true) {
  if (code === 0) {
    return { label: isDay ? 'Sunny' : 'Clear', icon: isDay ? 'clear-day' : 'clear-night' };
  }
  if ((code === 1 || code === 2) && !isDay) {
    return { label: WEATHER_CODES[code].label, icon: 'partly-cloudy-night' };
  }
  return WEATHER_CODES[code] || { label: 'Unknown', icon: 'cloudy' };
}

// ===== Large icons (SVG) =====
const ICONS = {
  'clear-day': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><radialGradient id="sunGrad" cx="45%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#FFEEB0"/><stop offset="40%" stop-color="#FFD370"/>
      <stop offset="75%" stop-color="#F5A524"/><stop offset="100%" stop-color="#C77A00"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="24" fill="url(#sunGrad)"/>
    <g stroke="#F5A524" stroke-width="3" stroke-linecap="round" opacity="0.85">
      <line x1="50" y1="14" x2="50" y2="22"/><line x1="50" y1="78" x2="50" y2="86"/>
      <line x1="14" y1="50" x2="22" y2="50"/><line x1="78" y1="50" x2="86" y2="50"/>
      <line x1="25" y1="25" x2="31" y2="31"/><line x1="69" y1="69" x2="75" y2="75"/>
      <line x1="25" y1="75" x2="31" y2="69"/><line x1="69" y1="31" x2="75" y2="25"/>
    </g>
  </svg>`,

  'clear-night': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><radialGradient id="moonGrad" cx="40%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#D8D8E8"/>
      <stop offset="100%" stop-color="#7A7A9A"/>
    </radialGradient></defs>
    <path d="M70 25 A30 30 0 1 0 75 75 A25 25 0 1 1 70 25 Z" fill="url(#moonGrad)"/>
    <g fill="#E8E8F5" opacity="0.7">
      <circle cx="30" cy="25" r="1.2"/><circle cx="20" cy="45" r="1"/>
      <circle cx="40" cy="70" r="1.3"/><circle cx="55" cy="15" r="0.9"/>
    </g>
  </svg>`,

  'partly-cloudy': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs>
      <radialGradient id="sunG2" cx="45%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#FFEEB0"/><stop offset="70%" stop-color="#F5A524"/>
        <stop offset="100%" stop-color="#C77A00"/>
      </radialGradient>
      <linearGradient id="cloudG2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/><stop offset="60%" stop-color="#C8C8D8"/>
        <stop offset="100%" stop-color="#8A8AA0"/>
      </linearGradient>
    </defs>
    <circle cx="34" cy="36" r="17" fill="url(#sunG2)"/>
    <path d="M32 80 Q18 80 18 66 Q18 54 32 54 Q34 42 48 42 Q60 36 70 44 Q82 40 87 54 Q95 58 95 69 Q95 80 82 80 Z" fill="url(#cloudG2)"/>
  </svg>`,

  'partly-cloudy-night': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs>
      <radialGradient id="moonG3" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#9A9AB8"/>
      </radialGradient>
      <linearGradient id="cloudG3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D8D8E8"/><stop offset="100%" stop-color="#6A6A80"/>
      </linearGradient>
    </defs>
    <path d="M52 20 A22 22 0 1 0 60 58 A18 18 0 1 1 52 20 Z" fill="url(#moonG3)"/>
    <path d="M32 80 Q18 80 18 66 Q18 54 32 54 Q34 42 48 42 Q60 36 70 44 Q82 40 87 54 Q95 58 95 69 Q95 80 82 80 Z" fill="url(#cloudG3)"/>
  </svg>`,

  'cloudy': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="cl3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8F8FC"/><stop offset="60%" stop-color="#B8B8C8"/>
      <stop offset="100%" stop-color="#7A7A90"/>
    </linearGradient></defs>
    <ellipse cx="42" cy="54" rx="20" ry="14" fill="url(#cl3)" opacity="0.9"/>
    <path d="M28 74 Q14 74 14 60 Q14 47 30 47 Q32 35 48 35 Q61 28 73 37 Q87 33 92 48 Q100 53 100 64 Q100 74 87 74 Z" fill="url(#cl3)"/>
  </svg>`,

  'fog': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="clf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8E8F0"/><stop offset="100%" stop-color="#8A8AA0"/>
    </linearGradient></defs>
    <path d="M30 62 Q20 62 20 52 Q20 42 32 42 Q34 32 47 32 Q58 27 68 34 Q78 32 82 44 Q88 48 88 55 Q88 62 78 62 Z" fill="url(#clf)"/>
    <g stroke="#B0B0C0" stroke-width="3" stroke-linecap="round">
      <line x1="18" y1="74" x2="82" y2="74"/><line x1="26" y1="82" x2="74" y2="82"/>
      <line x1="22" y1="90" x2="70" y2="90" opacity="0.5"/>
    </g>
  </svg>`,

  'drizzle': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="cld" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8E8F0"/><stop offset="100%" stop-color="#7A7A90"/>
    </linearGradient></defs>
    <path d="M30 60 Q20 60 20 50 Q20 40 32 40 Q34 30 47 30 Q58 25 68 32 Q78 30 82 42 Q88 46 88 53 Q88 60 78 60 Z" fill="url(#cld)"/>
    <g stroke="#7CC0FF" stroke-width="2.5" stroke-linecap="round">
      <line x1="35" y1="68" x2="35" y2="74"/><line x1="50" y1="68" x2="50" y2="74"/><line x1="65" y1="68" x2="65" y2="74"/>
      <line x1="42" y1="80" x2="42" y2="86"/><line x1="57" y1="80" x2="57" y2="86"/>
    </g>
  </svg>`,

  'rain': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="clr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D8D8E4"/><stop offset="100%" stop-color="#6A6A80"/>
    </linearGradient></defs>
    <path d="M30 58 Q20 58 20 48 Q20 38 32 38 Q34 28 47 28 Q58 23 68 30 Q78 28 82 40 Q88 44 88 51 Q88 58 78 58 Z" fill="url(#clr)"/>
    <g stroke="#5AA9F0" stroke-width="3" stroke-linecap="round">
      <line x1="30" y1="68" x2="27" y2="80"/><line x1="45" y1="68" x2="42" y2="80"/>
      <line x1="60" y1="68" x2="57" y2="80"/><line x1="75" y1="68" x2="72" y2="80"/>
    </g>
  </svg>`,

  'storm': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs>
      <linearGradient id="clst" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D0D0DC"/><stop offset="100%" stop-color="#5A5A70"/>
      </linearGradient>
      <linearGradient id="boltG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFD370"/><stop offset="100%" stop-color="#F5A524"/>
      </linearGradient>
      <filter id="boltGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M30 56 Q18 56 18 46 Q18 36 30 36 Q32 26 45 26 Q56 21 66 28 Q76 26 80 38 Q86 42 86 49 Q86 56 76 56 Z" fill="url(#clst)"/>
    <path d="M52 56 L40 80 L52 80 L46 96 L66 70 L54 70 L60 56 Z" fill="url(#boltG)" filter="url(#boltGlow)"/>
  </svg>`,

  'snow': `<svg viewBox="0 0 100 100" class="w-full h-full">
    <defs><linearGradient id="cls" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F4F4FC"/><stop offset="100%" stop-color="#8A8AA8"/>
    </linearGradient></defs>
    <path d="M30 58 Q20 58 20 48 Q20 38 32 38 Q34 28 47 28 Q58 23 68 30 Q78 28 82 40 Q88 44 88 51 Q88 58 78 58 Z" fill="url(#cls)"/>
    <g stroke="#FFFFFF" stroke-width="2" stroke-linecap="round">
      <g transform="translate(32,74)"><line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="-3" y1="-3" x2="3" y2="3"/><line x1="-3" y1="3" x2="3" y2="-3"/></g>
      <g transform="translate(52,82)"><line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="-3" y1="-3" x2="3" y2="3"/><line x1="-3" y1="3" x2="3" y2="-3"/></g>
      <g transform="translate(72,74)"><line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="-3" y1="-3" x2="3" y2="3"/><line x1="-3" y1="3" x2="3" y2="-3"/></g>
    </g>
  </svg>`
};

const SMALL_ICONS = {
  'clear-day': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19" y2="19"/><line x1="5" y1="19" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19" y2="5"/></svg>`,
  'clear-night': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  'partly-cloudy': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><circle cx="8" cy="8" r="2.5"/><line x1="8" y1="2" x2="8" y2="3"/><line x1="2" y1="8" x2="3" y2="8"/><line x1="3.8" y1="3.8" x2="4.6" y2="4.6"/><path d="M10 18h8a3 3 0 1 0-1-5.83A4 4 0 0 0 9 13"/></svg>`,
  'partly-cloudy-night': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M15 4 A6 6 0 1 0 20 15 A5 5 0 1 1 15 4z"/><path d="M10 18h8a3 3 0 1 0-1-5.83A4 4 0 0 0 9 13"/></svg>`,
  'cloudy': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 17h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 17z"/></svg>`,
  'fog': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M4 12h16M4 16h16M6 8h12"/></svg>`,
  'drizzle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 13h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 13z"/><line x1="9" y1="17" x2="9" y2="18"/><line x1="13" y1="17" x2="13" y2="18"/><line x1="17" y1="17" x2="17" y2="18"/></svg>`,
  'rain': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 13h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 13z"/><line x1="8" y1="16" x2="7" y2="20"/><line x1="12" y1="16" x2="11" y2="20"/><line x1="16" y1="16" x2="15" y2="20"/></svg>`,
  'storm': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M18 12h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 12z"/><path d="M13 13l-3 5h4l-1 4 4-6h-3l2-3z"/></svg>`,
  'snow': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="w-full h-full"><path d="M18 13h-8a3.5 3.5 0 1 1 .5-7 4 4 0 0 1 7.5 1A3 3 0 0 1 18 13z"/><line x1="8" y1="17" x2="8" y2="19"/><line x1="7" y1="18" x2="9" y2="18"/><line x1="13" y1="17" x2="13" y2="19"/><line x1="12" y1="18" x2="14" y2="18"/><line x1="17" y1="17" x2="17" y2="19"/><line x1="16" y1="18" x2="18" y2="18"/></svg>`
};