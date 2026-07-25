# La Femme UI Library — Phase 2

This phase contains only reusable UI primitives. No route was created, migrated, or redesigned. Existing Phase 1.5 App Router files remain untouched solely as the approved baseline application.

## Public import

```ts
import { Button, ProductCard, Modal } from "@/ui";
```

## Component tree

```text
UI Library
├── Layout
│   ├── Layout
│   ├── Header
│   │   ├── Container
│   │   └── Navigation
│   ├── Section
│   └── Footer
├── Primitives
│   ├── Typography
│   ├── Button
│   ├── IconButton
│   ├── Card
│   ├── Badge
│   ├── Price
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
├── Overlays
│   ├── Modal
│   ├── Dialog
│   └── Drawer
├── Feedback
│   ├── ToastProvider / useToast
│   ├── EmptyState
│   └── ErrorState
├── Navigation
│   ├── Breadcrumb
│   ├── Tabs
│   ├── Accordion
│   └── Pagination
├── Commerce
│   └── ProductCard
├── Icons
│   ├── Icon
│   ├── SearchIcon
│   ├── CloseIcon
│   ├── MenuIcon
│   └── CartIcon
└── Tokens & Utilities
    ├── Color tokens
    ├── Typography tokens
    ├── Spacing tokens
    ├── Radius tokens
    ├── Shadow tokens
    └── Animation utilities
```
