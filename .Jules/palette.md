# Palette's Journal

## 2025-05-21 - Accessibility Gap in Interactive Cards
**Learning:** Interactive cards that reveal information on click often lack keyboard accessibility, leaving keyboard-only users unable to access hidden content.
**Action:** Always add `tabIndex`, `role="button"`, and `onKeyDown` handlers to clickable `div`s or use proper `<button>` elements.
