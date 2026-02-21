export const C = {
  bgBase: '#0E0E0E',
  bgSurface: '#161616',
  bgHover: '#1C1C1C',
  borderDefault: '#2A2A2A',
  borderAccent: 'rgba(200,241,53,0.3)',
  textPrimary: '#F0ECE4',
  textMuted: '#6B6860',
  accentLime: '#C8F135',
  accentLimeDark: '#9BBF1F',
  statusSuccess: '#4DFF91',
  statusWarning: '#F5A623',
  statusDanger: '#FF4D4D',
} as const;

export const F = {
  syne: "'Syne', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const typography = {
  displayHero: { fontFamily: F.syne, fontWeight: 800, fontSize: 48 },
  displayTitle: { fontFamily: F.syne, fontWeight: 800, fontSize: 28 },
  displayHeading: { fontFamily: F.syne, fontWeight: 700, fontSize: 22 },
  displaySubheading: { fontFamily: F.syne, fontWeight: 600, fontSize: 17 },
  bodyDefault: { fontFamily: F.syne, fontWeight: 400, fontSize: 14 },
  bodySmall: { fontFamily: F.syne, fontWeight: 400, fontSize: 12 },
  monoDefault: { fontFamily: F.mono, fontWeight: 500, fontSize: 13 },
  monoSmall: { fontFamily: F.mono, fontWeight: 400, fontSize: 11 },
  monoLabel: { fontFamily: F.mono, fontWeight: 500, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '1.2px' },
} as const;
