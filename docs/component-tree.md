# La Femme UI Library — Component Tree

> Scope: reusable Design System only. No Phase 2 page migration or page-specific UI was added.

```text
src/components/ui/
├── Accordion.tsx
├── Badge.tsx
├── Breadcrumb.tsx
├── Button.tsx
├── Card.tsx
├── Checkbox.tsx
├── Dialog.tsx
├── Drawer.tsx
├── EmptyState.tsx
├── ErrorState.tsx
├── IconButton.tsx
├── Input.tsx
├── Loading.tsx
├── Modal.tsx
├── Pagination.tsx
├── PriceDisplay.tsx
├── ProductCard.tsx
├── Radio.tsx
├── SearchBar.tsx
├── Select.tsx
├── Skeleton.tsx
├── Switch.tsx
├── Tabs.tsx
├── Textarea.tsx
├── Toast.tsx
├── Typography.tsx
├── hooks/
│   └── useEscapeKey.ts
├── lib/
│   └── cn.ts
├── tokens/
│   ├── animations.ts
│   ├── colors.ts
│   ├── index.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   └── typography.ts
├── utilities/
│   └── animations.css
└── index.ts
```

## Composition tree

```text
UI Library
├── Foundations
│   ├── Color tokens
│   ├── Typography tokens
│   ├── Spacing tokens
│   ├── Radius tokens
│   ├── Shadow tokens
│   └── Animation tokens and utilities
├── Primitives
│   ├── Typography
│   ├── Button
│   ├── IconButton
│   ├── Card
│   ├── Badge
│   ├── PriceDisplay
│   ├── Loading
│   └── Skeleton
├── Forms
│   ├── Input
│   ├── Textarea
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Switch
│   └── SearchBar
├── Navigation
│   ├── Breadcrumb
│   ├── Tabs
│   ├── Accordion
│   └── Pagination
├── Overlays
│   ├── Modal
│   ├── Dialog
│   └── Drawer
├── Feedback
│   ├── ToastProvider
│   ├── useToast
│   ├── EmptyState
│   └── ErrorState
└── Commerce
    └── ProductCard
        ├── Card
        ├── Badge
        └── PriceDisplay
```
