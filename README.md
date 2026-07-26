# La Femme — Next.js Phase 1 Migration

This repository migrates the original static website to Next.js App Router, TypeScript, and Tailwind CSS without intentionally redesigning the UI.

## Run

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Architecture

- `src/app`: App Router pages and global layout.
- `src/components/layout`: shared site shell.
- `src/components/legacy`: compatibility components that preserve existing HTML and scripts.
- `src/components/ui`: initial reusable primitives based on current CSS classes.
- `src/lib`: shared route constants and future application utilities.
- `src/types`: strict domain types.
- `public/assets`: original images, fonts, data scripts, and JavaScript.
- `legacy-source`: untouched original project retained with all comments.
- `migration-manifest.json`: source-page to App Router mapping.

## Phase 1 strategy

The original stylesheet and markup are retained for visual parity. Shared architecture is introduced around them. Later phases can incrementally replace compatibility markup with native React components without changing routes or visual behavior.

## Phase 2 completion status

The reusable Design System is now centralized in `src/components/ui/`. No page migration was performed in this phase. See `COMPONENT-TREE.md` and `FILES-PHASE2-COMPLETE.md`.
