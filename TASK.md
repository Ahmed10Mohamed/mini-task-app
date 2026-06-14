# Interview Task — Mini Task App

You're given a working full-stack scaffold (Next.js + tRPC + Prisma + Postgres).
**Reading tasks already works** end-to-end — use it as your reference. Your job
is to make the app fully functional.

## Setup

```bash
npm install
cp .env.example .env
npm run db:up      # start Postgres (Docker)
npm run db:push    # create the Task table
npm run db:seed    # optional: insert a few sample tasks so the list isn't empty
npm run dev        # http://localhost:3000
```

## Your task

Implement the three missing pieces. Server stubs are in
`src/server/routers/task.ts`; the UI is in `src/app/page.tsx`. Both are marked
with `TODO`.

1. **`task.create`** — input `{ title: string }`, reject empty titles, create a
   row, return it. Then wire up the "Add" button so new tasks appear.
2. **`task.toggle`** — input `{ id: string }`, flip the `done` flag. Add a
   checkbox in the list that calls it.
3. **`task.delete`** — input `{ id: string }`, delete the row. Add a delete
   button in the list.

After each mutation the list should refresh (hint: `utils.task.list.invalidate()`).

## Where to look

```
src/server/routers/task.ts   # ← add procedures here (list is done for you)
src/app/page.tsx             # ← wire up the UI here
prisma/schema.prisma         # the Task model
```

## Stretch (if time)

- Inline-edit a task title (`task.update`).
- Cap titles at 100 chars on the server and show the error in the UI.
- Optimistic toggle (React Query `onMutate` + rollback).
- Add `updatedAt` (`@updatedAt`) and display it.

## What the interviewer is looking for

- Comfort with the tRPC procedure → router → typed client flow
- Sensible use of Prisma (`create` / `update` / `delete`)
- Where validation belongs (client vs server) and why
- Clean loading / empty / error handling and cache invalidation
