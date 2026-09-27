# Collection V2

Collection V2 supports two intentionally separate collection kinds:

- `TOPIC`: ordered topic sheets, hydrated with their existing problems
- `BLOG`: ordered technical blog posts

The kind is selected during creation and is immutable. Metadata updates are limited to `name`, `description`, and `visibility`. Item membership is managed through a separate endpoint. Collaboration is deliberately outside this version.

## Storage

V2 data uses the `collections_v2` MongoDB collection through `src/model/Collection.ts`. The legacy `BlogCollection` model and `/api/blog-collections` endpoints remain unchanged.

`itemIds` is an ordered string array because blog IDs are Mongo ObjectIds while topics use the application's custom string `id`. Model-specific validation happens at the API boundary.

## Access rules

- Only the owner can create, update, delete, add, or remove.
- Only owner-created topics/blogs can be included; collaborator items are excluded.
- A private collection can include the owner's public or private items.
- A public collection can include only the owner's currently public items.
- Publishing an existing private collection fails until all included items are public.
- Public detail responses filter items that were made private after being added.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/collections` | List the signed-in owner's collections |
| `POST` | `/api/v2/collections` | Create a `BLOG` or `TOPIC` collection |
| `GET` | `/api/v2/collections/public` | List public collections; supports `owner` and `type` filters |
| `GET` | `/api/v2/collections/:id` | Read an owner-visible or public collection and its hydrated items |
| `PATCH` | `/api/v2/collections/:id` | Update metadata only |
| `DELETE` | `/api/v2/collections/:id` | Delete the collection without deleting its items |
| `POST` | `/api/v2/collections/:id/items` | Add one or more ordered items |
| `DELETE` | `/api/v2/collections/:id/items` | Remove one or more items |

List routes support pagination with `page` and `limit`; collection lists also support `type` and `visibility` where applicable. Collections currently allow up to 100 items.

## UI

- `/u/:username?tab=collections` is a directory-only view with type and visibility badges.
- `/collections/:collectionId` is the detail and owner-management view.
- Topic items render as accordion sheets using the existing problem fields: problem, difficulty, reference count, and source link.
