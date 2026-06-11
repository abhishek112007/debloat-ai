## 2024-05-15 - Icon Button Accessibility

**Learning:** The application extensively uses `react-icons` wrapped in `<button>` and `<motion.button>` elements without explicit text content. While `title` attributes were present for tooltips, they do not sufficiently act as accessible names for screen readers in all contexts, making these critical actions (like copying, exporting, and sending) inaccessible to visually impaired users.

**Action:** Ensure that all future icon-only interactive elements in `ChatBot.tsx`, `FloatingChat.tsx`, and similar components explicitly include an `aria-label` attribute that matches or expands upon the `title` attribute.
## 2024-05-16 - Icon Button ARIA Labels
**Learning:** Some interactive buttons (`<motion.button>`) in `AIPackageAdvisor.tsx` and `BackupManager.tsx` contained only React Icons (e.g., `<FiX>`, `<FiRefreshCw>`) without any text or `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Ensure that all icon-only buttons always have a descriptive `aria-label` attribute (e.g., `aria-label="Close AI Advisor"`) for accessibility.
