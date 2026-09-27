# Application architecture

Insert is a Next.js App Router application organized around product features. Route files should stay thin: they compose feature components, parse route input, or expose HTTP handlers. Product logic belongs in `src/features` or the appropriate shared server module.

## Directory ownership

| Directory | Responsibility |
| --- | --- |
| `src/app` | Routes, layouts, route-scoped UI, and API handlers |
| `src/features` | Product modules with their components, context, reducers, and feature utilities |
| `src/components/ui` | Reusable UI primitives without product-specific data access |
| `src/components` | Shared application components used by multiple features or routes |
| `src/lib` | Shared infrastructure, server helpers, configuration, and integrations |
| `src/model` | Mongoose schemas and models |
| `src/schemas` | Zod schemas used at trust boundaries |
| `src/services` | Typed clients for external services |
| `src/types` | Shared TypeScript contracts |
| `src/hooks` | Feature-independent React hooks |
| `src/helpers` | Small pure formatting or transformation functions |

## Dependency direction

Use the following direction to avoid circular dependencies:

```text
app routes -> features -> shared components/hooks -> lib/services/types
api routes -> schemas/models/lib/services
```

- Feature modules may depend on shared modules, but shared modules must not import feature providers.
- Components that are only used by one feature should live inside that feature.
- API handlers must authenticate and validate input before reading or mutating data.
- Secrets use server-only environment variables. Only browser-safe configuration may use the `NEXT_PUBLIC_` prefix.

## Naming conventions

- React components and providers: `PascalCase.tsx`
- Hooks: `use-name.ts`
- General modules and service clients: `kebab-case.ts`
- Mongoose models: singular `PascalCase.ts`
- Route folders follow the URL and Next.js conventions.

## Adding a feature

Create a folder under `src/features/<feature>` and add only the folders the feature needs:

```text
src/features/example/
  components/
  context/
  reducers/
  utils/
  types.ts
```

Expose the feature through a route or provider using its canonical `@/features/...` path. Do not add compatibility copies under `src/app/context` or `src/app/reducer`.

## Verification

Run these before merging:

```bash
npm run check
npm run build
```

`check` uses `tsconfig.typecheck.json` to run TypeScript against source files and then runs ESLint. Generated `.next` and `.next-dev` output is deliberately excluded from that standalone type-check so stale route artifacts cannot break it. The production build remains the final integration check for generated route types, server/client boundaries, and App Router behavior.
