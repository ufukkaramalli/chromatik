---
description: Rule for adhering to application theme colors and aesthetics
---

# Theme Colors and Aesthetics Rule

When making any styling or UI changes, you MUST STRICTLY adhere to the established theme colors and tones of the Chromatik application:

1. **Theme Fidelity**: Do not introduce random or generic colors (like basic blue, green, or yellow) into the UI. Always use the primary color palettes defined by the application.
2. **Primary Palette (Red/Crimson)**: The default application theme (and 'WaveField'/'FlowField' canvases) relies heavily on dark backgrounds (`#121212`, `#1E1E1E`) accented with shades of primary red (`#ff5252`), crimson (`#d32f2f`), and deep red (`#9a0007`).
3. **Pillars Theme**: For the 'Pillars' theme variants, strictly use the curated neon palette: Light Blue (`#3296ff`), Purple (`#8c37c8`), and Deep Blue (`#0a5adc`).
4. **Premium Feel**: Always aim for a premium, dark-mode, glassmorphism aesthetic. Utilize `rgba` values of the theme colors, background blurs (`backdrop-filter`), and subtle gradients rather than flat colors.
5. **Consistency**: If building new components, inspect existing components for the exact RGB/HEX values and mimic their exact usage of shadows, glows, and opacities.
