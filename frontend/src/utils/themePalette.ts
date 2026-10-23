/**
 * Artist profile theme palettes (see .agents/rules/theme_colors.md).
 * Values are "r, g, b" triplets so they can be used as rgba(var(--x), alpha) in CSS.
 */
export type ArtistTheme = 'ribbons' | 'flowfield' | 'pillars'

export interface ThemePalette {
  /** Main glow / highlight colour */
  accent: string
  /** Secondary colour (gradients, chromatic split) */
  accent2: string
  /** Deep tone for tints and gradient ends */
  deep: string
}

export const THEME_PALETTES: Record<ArtistTheme, ThemePalette> = {
  // WaveField (default): Primary Red, Crimson, Deep Red
  ribbons: { accent: '255, 82, 82', accent2: '211, 47, 47', deep: '154, 0, 7' },
  // FlowField: Primary Red, White (halftone), Crimson
  flowfield: { accent: '255, 82, 82', accent2: '255, 255, 255', deep: '211, 47, 47' },
  // Pillars: Light Blue, Purple, Deep Blue
  pillars: { accent: '50, 150, 255', accent2: '140, 55, 200', deep: '10, 90, 220' }
}

export const LIGHT_THEME_PALETTES: Record<ArtistTheme, ThemePalette> = {
  // WaveField: High-contrast reds for light surface
  ribbons: { accent: '211, 47, 47', accent2: '180, 20, 30', deep: '120, 10, 20' },
  // FlowField: Contrast crimson and slate accents instead of invisible white
  flowfield: { accent: '211, 47, 47', accent2: '180, 20, 30', deep: '120, 10, 20' },
  // Pillars: Deeper sapphire, violet and cobalt for crisp light visibility
  pillars: { accent: '30, 120, 240', accent2: '120, 40, 180', deep: '10, 60, 180' }
}

export function getThemePalette(theme?: string | null, isDark = true): ThemePalette {
  const map = isDark ? THEME_PALETTES : LIGHT_THEME_PALETTES
  return map[theme as ArtistTheme] ?? map.ribbons
}
