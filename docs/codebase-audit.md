# Codebase audit

Audit date: 2026-08-08

## Completed in this pass

- Removed unused compatibility exports from `src/app/context` and `src/app/reducer`; all consumers already use canonical feature paths.
- Consolidated Firebase initialization through `src/lib/firebase.ts` to prevent duplicate default-app initialization.
- Removed logging of both supplied and configured internal API keys from the collaboration access-check route.
- Restricted SMTP credentials to server-only `EMAIL_FROM` and `EMAIL_PASS` variables and marked the mail module as server-only.
- Added a stable source-only TypeScript configuration and repository `typecheck`/`check` scripts.
- Documented directory ownership and dependency direction in `docs/architecture.md`.

## Current architecture assessment

The feature migration is sound: blog, collaboration, notification, payment, project, topic, and user state now live under `src/features`. Routes and shared components consistently import those canonical modules. API routes generally authenticate before accessing private data and use Zod on most mutation boundaries.

The main maintainability pressure is component size. Several route files combine data loading, permissions, editor state, dialogs, and presentation:

- `src/app/(app)/topic/[topicid]/page.tsx` (about 1,550 lines)
- `src/app/(app)/blog/[blogUrl]/page.tsx` (about 1,080 lines)
- `src/app/(app)/project/[id]/page.tsx` (about 620 lines)
- `src/app/(app)/project/[id]/edit/[releaseBlogId]/page.tsx` (about 480 lines)

These should be decomposed feature-by-feature rather than mechanically split. Start by extracting permission/data hooks, then dialogs/action panels, while keeping route composition local.

## Recommended next passes

### 1. Stabilize provider APIs

ESLint reports missing hook dependencies in multiple providers and consumers. Adding dependencies directly may create request loops because several provider actions are recreated on render. Memoize provider actions with `useCallback`, memoize context values, and then make effects exhaustive. Prioritize:

- blog, notification, notification-v2, collaboration-v2, and user providers
- project import/config dialogs
- public blog/topic feeds and the write page

### 2. Add automated tests

There is no test command or test framework in `package.json`. Add integration coverage for authentication and authorization before large refactors. Highest-value cases are:

- private/public topic and blog reads
- owner/editor/viewer mutation permissions
- collaborator invitation and role changes
- collection ownership and visibility
- project service failures and pagination

### 3. Remove confirmed dead modules

Several modules have no current imports, including old notification cards, placeholder cards, `Alltopic`/`Topicvisible` models, and `src/utils/socket.ts`/`src/utils/util.ts`. Confirm they are not part of an unfinished branch before deleting them. Avoid a bulk deletion while collection/dashboard work is in progress.

### 4. Tighten types at service boundaries

External-service normalization and older reducers still use broad `any` values. Parse unknown responses into explicit DTOs before putting them into context state. The topic reducer and project/blog providers offer the largest benefit.

### 5. Reduce client bundle boundaries

The app provider tree mounts many global providers for every authenticated route. As routes are decomposed, move providers closer to the routes that consume them. The topic editor is currently the largest client bundle and should be the first performance target.

### 6. Resolve image and browser-data warnings

Replace content images with `next/image` where dimensions and remote hosts are known. Retain plain `img` only for editor/user-supplied content where optimization is unsuitable, and document the lint exception locally.

## Verification baseline

- `npm run typecheck`: passes
- `npm run lint`: passes with warnings documented above
- `npm run build`: passes
- `git diff --check`: passes

The build also reports an outdated Browserslist dataset. Updating it changes the dependency lockfile and should be handled as a separate dependency-maintenance change.
