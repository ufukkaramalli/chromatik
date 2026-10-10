---
trigger: always_on
description: Enforces the use of standard reusable audio components (like BoxPlayer) instead of implementing custom track cards.
---

# Reusable Audio Components Rule

When developing or modifying views and components in the frontend (`/srv/chromatik/app/frontend`), you MUST STRICTLY follow these rules regarding audio and track UI components:

1. **Do Not Recreate Audio/Track Cards**: Never create custom, ad-hoc track cards, custom play/pause overlays, custom track cover art containers, or separate like buttons in pages (such as Profile, Home, Tracks, Playlists, etc.).
2. **Use Standard `BoxPlayer`**: For displaying tracks in a grid or card layout, always use the standard component:
   - Component Path: `@/components/Audio/BoxPlayer.vue`
   - Usage: `<BoxPlayer :track="track" />`
3. **Data Contract for `BoxPlayer`**:
   - Ensure the `track` object provided to `BoxPlayer` contains the required properties:
     - `id` (or `_id`)
     - `name`
     - `art`
     - `user`: `{ name, slug, _id }` (If the track list is loaded in a context where `user` is not populated on each track—e.g. User Profile—map the tracks with the parent user information before passing to `BoxPlayer`).
4. **Check Existing Reusable Components First**: Before building any new audio-related UI element, inspect `@/components/Audio/` and existing shared components to reuse and maintain consistency across the entire application.
