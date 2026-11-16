# Project memory

## Product intent & audience

- Mobile-style reading/translation/scan app built with Vite + React.
- Core modes: Scan, Translate, Read; plus Home, Auth (sign-in), Catalog, Settings, Customization, and an Effects layer.
- Users can install visual effects (e.g. glass-blur) as a chosen feature.

## Brand personality & voice

- Practical, utility-focused app; clarity over decoration.

## Visual design & UX direction

- **Colors:** solid theme colors only — blues, teals, slates. No gradients. Explicitly no indigo, purple, or violet accents.
- **Cards:** plain translucent fills, flat — no outlined boxes, no gradient fills, no glow shadows.
- **Icon tiles & logo:** flat solid-color tiles, no glows or shine effects.
- **Badges:** neutral styling (e.g. "AI" badge is neutral, not colored).
- **Buttons:** solid theme color, no gradient fills.
- **Effects:** glass-blur effects from the installed effects layer are retained as a feature. Phone frame outer shadow is retained.
- **Responsive:** app rendered inside a phone frame.

## Decisions, constraints & rationale

- Simplified design across all screens to remove gradients, indigo/purple, and heavy shadows in favor of flatter, clearer solid-color styling.
- Build passes after changes; verified via code reading and build, not browser preview.
- Effects-layer glass blur and phone-frame shadow intentionally preserved.

## Open questions & assumptions

- Browser visual verification still pending; changes validated only via code review and build.
- Catalog and Settings theme availability confirmed, but full visual QA not done.