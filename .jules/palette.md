## 2024-05-15 - Icon Button Accessibility

**Learning:** The application extensively uses `react-icons` wrapped in `<button>` and `<motion.button>` elements without explicit text content. While `title` attributes were present for tooltips, they do not sufficiently act as accessible names for screen readers in all contexts, making these critical actions (like copying, exporting, and sending) inaccessible to visually impaired users.

**Action:** Ensure that all future icon-only interactive elements in `ChatBot.tsx`, `FloatingChat.tsx`, and similar components explicitly include an `aria-label` attribute that matches or expands upon the `title` attribute.

## 2024-05-16 - Consistent Missing aria-label on Action Icons
**Learning:** Found a recurring pattern in multiple components (like \`AIPackageAdvisor\`, \`ConfirmDialog\`, and \`BackupManager\`) where icon-only action buttons (e.g., Close, Refresh, Learn More) completely lacked an \`aria-label\`, rendering them inaccessible to screen readers. Relying solely on visual cues or context in tooltips creates significant accessibility gaps for functional UI elements.
**Action:** When working on generic components, explicitly check for and add \`aria-label\` attributes to all buttons that use icons as their sole visual content.
