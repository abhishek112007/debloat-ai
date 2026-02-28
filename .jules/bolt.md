## 2024-05-24 - React List Rendering Bottleneck
**Learning:** In a codebase dealing with potentially hundreds of items like Android packages, mapping inline components with complex styling and multiple child components inside a single `useState` array update causes severe render blocking.
**Action:** Always extract list items into separate components wrapped in `React.memo` and ensure callback references passed to them (like `toggleSelect`) are stabilized using `useCallback` and `useRef` to hold latest state without triggering re-renders of the parent function.
