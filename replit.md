# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Jona Crochet's (Mobile App)
- **Type**: Expo (React Native)
- **Directory**: `artifacts/jona-crochets/`
- **Preview**: `/`
- **Framework**: Expo Router + React Native
- **Font**: Nunito (400/600/700/800)
- **Colors**: Warm cream, dusty pink (#c27d82), sage green (#8faa8b), lavender (#b5a5cc), warm beige
- **State**: AsyncStorage (local persistence via AppContext)

#### Features
- **Home Screen**: Greeting, rotating crochet quotes, stats overview, active projects, quick counter, inspiration card
- **Row Counter**: Multi-counter support with rows/stitches/rounds/repeats, target setting, animated big button, haptic feedback
- **Crochet Library**: 15+ curated patterns, category filters, skill level filters, search, favorites, Surprise Me button
- **Project Tracker**: Full project management with status tracking (planning/in_progress/paused/finished), progress bars, gift/sale/personal labels, archive
- **Tools Tab**:
  - Price Calculator with gift mode, profit margin, market suggestions (low/standard/premium)
  - Yarn Stash tracker with weight, brand, color, low-stock warnings
  - Notes with categories (project/stitch/pattern/measurement/client/general)
  - Reference Guides (hook sizes, yarn weights, stitch abbreviations)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
