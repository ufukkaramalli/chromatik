---
description: Rule for adhering to application theme colors, dual-theme support, and aesthetics
---

# Theme Colors and Aesthetics Rule

When making any styling or UI changes, you MUST STRICTLY adhere to the established theme colors and dual-theme (Light & Dark) architecture of the Chromatik application:

1. **Theme Fidelity**: Do not introduce random or generic colors (like basic blue, green, or yellow) into the UI. Always use the primary color palettes defined by the application.
2. **Primary Palette (Red/Crimson)**: The core brand palette accents both themes with shades of primary red (`#ff5252`), crimson (`#d32f2f`), and deep red (`#9a0007`).
3. **Pillars Theme**: For the 'Pillars' theme variants, strictly use the curated neon palette: Light Blue (`#3296ff`), Purple (`#8c37c8`), and Deep Blue (`#0a5adc`).
4. **Dual-Theme Support (Dark & Light)**:
   - **Never hardcode dark surfaces or text colors**: Never use `bg-black`, `bg-grey-darken-*`, `theme="dark"`, or `text-white` for general layout or cards.
   - **Use Semantic Tokens**: Use Vuetify semantic tokens (`bg-surface`, `bg-background`, `text-high-emphasis`, `text-medium-emphasis`).
   - **Use Standard Theme Utilities**: Use `@/scss/_theme-utilities.scss` (`.ck-glass`, `.ck-glass--strong`, `.ck-border-subtle`, `.ck-hover-lift`).
   - **Exception for Media**: Elements directly overlaid on top of dark artwork/media photos MUST use `.ck-on-media` to maintain white text and readability in both themes.
5. **Consistency**: Always aim for a premium, clean glassmorphic aesthetic using backdrop filters, theme-based CSS variables (`rgba(var(--v-theme-...), ...)`), and subtle ambient glows.
