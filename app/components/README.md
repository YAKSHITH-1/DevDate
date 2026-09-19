# Components Directory

This directory contains reusable components for the DevDate application.

## Design System: Playful Pop Art x Doodle Art

All components follow the DevDate visual system:

- **Pop Art elements**: Bold borders, offset shadows, comic-inspired badges and cards
- **Doodle accents**: Hand-drawn sparkles, stars, arrows, code symbols, and terminals
- **DiceBear voxel avatars**: 3D generated profile images via DiceBear API
- **Design tokens**: Consistent use of `COLORS`, `BORDERS`, `BORDER_RADIUS`, `BRUTAL_SHADOWS`, `TYPOGRAPHY` from `styles/theme.js`

## Component Guidelines

- Reuse existing React Native components when possible
- Keep components focused on a single responsibility
- All interactive elements use accessible touch targets
- Proper visual feedback and interaction states
- Zero Unicode emojis — use DoodleElements for visual accents