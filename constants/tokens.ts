import type { TextStyle } from 'react-native';

// Scene design tokens — the single source of truth for all styling.
// Locked in the build spec: components reference these and never hardcode
// hex values or magic numbers.

export const colors = {
  /** App background */
  background: '#0D0D0D',
  /** Cards, sheets, modals */
  surface: '#1A1A1A',
  /** Elevated surfaces, inputs */
  surfaceRaised: '#242424',
  /** CTAs, active states, highlights */
  accent: '#FF3B30',
  /** Accent backgrounds, badges (accent at 12% alpha) */
  accentMuted: '#FF3B3020',
  /** Primary text */
  text: '#FFFFFF',
  /** Secondary text, placeholders */
  textMuted: '#666666',
  /** Dividers, input borders */
  border: '#2A2A2A',
  /** Confirmations, verified badges */
  success: '#34C759',
  /** Errors, destructive actions */
  error: '#FF453A',
} as const;

/** Font family names as registered with expo-font in app/_layout.tsx. */
export const fonts = {
  /** Inter 400 — body */
  regular: 'Inter_400Regular',
  /** Inter 600 — subheadings, buttons */
  semibold: 'Inter_600SemiBold',
  /** Inter 700 — headings */
  bold: 'Inter_700Bold',
  /** JetBrains Mono 400 — role tags, experience dots, labels */
  mono: 'JetBrainsMono_400Regular',
} as const;

/**
 * Text-style presets. Weight is baked into the font family — never set
 * fontWeight alongside these, or iOS falls back to the system font.
 *
 *   <Text style={[typography.base, { color: colors.text }]} />
 */
export const typography = {
  /** 11/400 — captions, timestamps */
  xs: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14 },
  /** 13/400 — secondary body */
  sm: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  /** 15/400 — primary body */
  base: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  /** 17/600 — subheadings */
  md: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 23 },
  /** 20/700 — section headings */
  lg: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  /** 24/700 — card name, large headings */
  xl: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30 },
  /** 30/700 — hero text */
  '2xl': { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36 },
  /** 12/400 JetBrains Mono — role tags, dot labels */
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

/** 4pt spacing grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type ColorToken = keyof typeof colors;
export type TypographyToken = keyof typeof typography;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
