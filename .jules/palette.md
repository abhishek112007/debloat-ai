## 2024-05-15 - Icon Button Accessibility

**Learning:** The application extensively uses `react-icons` wrapped in `<button>` and `<motion.button>` elements without explicit text content. While `title` attributes were present for tooltips, they do not sufficiently act as accessible names for screen readers in all contexts, making these critical actions (like copying, exporting, and sending) inaccessible to visually impaired users.

**Action:** Ensure that all future icon-only interactive elements in `ChatBot.tsx`, `FloatingChat.tsx`, and similar components explicitly include an `aria-label` attribute that matches or expands upon the `title` attribute.

## 2024-05-16 - Icon Button Accessibility Additions

**Learning:** It is common for icon-only buttons (like `FiX` for clear actions) to be visually self-explanatory but lack proper accessibility. The "Clear selection" `<motion.button>` in `App.tsx` relied only on a `title` attribute for tooltips, which screen readers may not consistently announce.
**Action:** When auditing or touching interactive elements, particularly icon-only buttons, check for both `title` (for mouse users) and `aria-label` (for screen reader accessibility). Always add `aria-label` if missing.
