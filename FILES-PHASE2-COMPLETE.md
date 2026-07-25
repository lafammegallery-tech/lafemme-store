# Phase 2 UI Library Files

All new reusable components live under `src/components/ui/`. Existing App Router pages were not migrated or redesigned.

- `index.ts`: single public export surface for the UI library and tokens.
- `Button.tsx`: typed action button with variants, sizes, loading and disabled states.
- `IconButton.tsx`: accessible icon-only button requiring an explicit label.
- `Card.tsx`: composable surface container.
- `ProductCard.tsx`: business-logic-free product presentation component.
- `Badge.tsx`: semantic compact status label.
- `PriceDisplay.tsx`: locale-aware display-only price formatter.
- `Input.tsx`, `Textarea.tsx`, `Select.tsx`: ref-forwarding native form controls.
- `Checkbox.tsx`, `Radio.tsx`, `Switch.tsx`: accessible selection controls.
- `Modal.tsx`, `Dialog.tsx`, `Drawer.tsx`: portal-based overlays with dialog semantics and Escape handling.
- `Toast.tsx`: provider, live region and publishing hook for transient messages.
- `Breadcrumb.tsx`, `Tabs.tsx`, `Accordion.tsx`, `Pagination.tsx`: reusable navigation/disclosure patterns.
- `SearchBar.tsx`: semantic search form.
- `Loading.tsx`, `Skeleton.tsx`: accessible loading primitives.
- `EmptyState.tsx`, `ErrorState.tsx`: reusable feedback states.
- `Typography.tsx`: semantic typography primitive mapped to the approved scale.
- `tokens/*`: typed color, typography, spacing, radius, shadow and animation systems.
- `utilities/animations.css`: Tailwind-layer animation, focus and reduced-motion utilities.
- `lib/cn.ts`: deterministic class-name composition helper.
- `hooks/useEscapeKey.ts`: shared keyboard-dismissal behavior for overlays.
