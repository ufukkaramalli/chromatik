---
description: Rule for theme-aware component and view development (Light & Dark mode support)
---

# Theme-Aware Styling Rule

When developing or modifying views and components in the frontend (`frontend/src`), you MUST follow these theme-aware styling rules:

### 1. Replacement Mapping
| Prohibited Pattern | Theme-Aware Replacement |
|---|---|
| `text-white` (body or headings) | `text-high-emphasis` |
| `text-grey-lighten-*`, `opacity-60` | `text-medium-emphasis` |
| `text-grey`, `text-grey-darken-1` | `text-disabled` or `text-medium-emphasis` |
| `bg-black`, `bg-grey-darken-4` | `bg-background` or `bg-surface` |
| `bg-grey-darken-3` | `bg-surface-light` |
| `theme="dark"` (on cards/tables) | Omit / use default theme context |
| `color="white"` (on buttons) | `variant="outlined"` / `color="primary"` |
| `bg-color="black"` (on inputs) | `bg-color="surface-light"` or default |
| `border-white-10`, `border-white-20` | `border` prop on Vuetify component or `.ck-border-subtle` |
| Hardcoded dark glass | `.ck-glass` or `.ck-glass--strong` |

### 2. Exceptions (Always White / High Contrast)
- Elements directly overlaid on dark cover art / media: use `.ck-on-media` or white text.
- Primary buttons (`color="primary"` flat/elevated): white text is expected because the background is red.
