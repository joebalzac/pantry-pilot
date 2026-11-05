# PantryPilot
A production-learning project for frontend / design engineering. Next.js App Router, React, TypeScript, and CSS.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000. `npm run typecheck` and `npm run build` are available. Deploy to Vercel by importing the GitHub repository.

## What works in v0.1
- Responsive dashboard with pantry inventory and restock suggestions
- Add, edit and delete pantry items, including each item's reorder threshold and daily use
- Quantity entry by per-unit step or typed value, including fractions such as `1/2` and `1 1/2`
- Stock estimated from the last count and daily use, shown as an estimate next to that count
- Undo toast after a quantity change or removal
- Sorting by department, name or days left, and a low-stock filter
- Shopping list with an amount and note per item, grouped by store department
- Suggested amounts that follow the pantry until you set your own: enough to reach the reorder level plus 7 days of use, rounded up to what a store sells
- One-off items for things the pantry doesn't track
- Optional auto-add, which keeps low items on the list and respects the ones you take off
- Shopping mode at `/shopping`, a checklist for one-handed use on a phone
- Checking off an item adds the amount to the pantry, and unchecking it reverses that unless the item has been recounted since
- Export the list by copying, printing or sharing it. This is the manual fallback until a retailer integration exists
- Local browser persistence, search, empty states
- Demonstration GET `/api/items` endpoint (seed data only)

**Important:** The UI uses localStorage rather than the demo endpoint. Data is device-local, there is no login, and no grocery order is placed. Daily-use rates are sample or manually entered values, not learned behavior. Do not mistake this for a deployed multi-user production system.

## Production readiness lab
`/production` demonstrates the states a prototype skips, using the real UI components against test endpoints:
- **Error states:** 401, 403, 429, 500, timeout, offline and malformed responses, each with its own recovery path (`lib/api/client.ts`, `lib/api/schema.ts`).
- **Too much data:** cursor pagination and server-side search over 10,000 records, with a server-enforced page limit.
- **Infinite scroll:** a 2,400-message thread that loads upward and holds your scroll position.
- **Long text:** a before/after comparison that measures text escaping its container.

`/api/lab/*` serves fixture data and injects faults through a `scenario` parameter. It is for this demo only and has no auth or database. The app's home page still uses localStorage.

## Level 2: Production frontend milestones
1. Replace localStorage as source of truth with an authenticated database-backed API; add explicit loading, empty, error and retry states.
2. Add schema validation for API responses and clear error types (401, 403, 409, 429, 500).
3. Use TanStack Query for cache, invalidation, cancellation, optimistic updates and mutation rollback.
4. Add server-side pagination/filtering and test 10,000 inventory/activity records.
5. Add accessibility checks, deterministic Playwright tests, error reporting and Web Vitals.
6. Deploy a staging environment, configure secrets, CI, monitoring and a release checklist.

## Level 3: System design milestones
- Data model: Household, Membership, PantryItem, InventoryEvent, ConsumptionEstimate, ReplenishmentSuggestion, ShoppingList, ShoppingListItem, RetailerConnection, OrderIntent.
- APIs: `GET /households/:id/pantry?cursor=...`, `PATCH /pantry-items/:id`, `GET /suggestions`, `POST /shopping-list/items`, `POST /order-intents` (requires explicit user confirmation).
- Define access control per household, idempotency keys, conflict resolution, request/response contracts, cursor pagination, and event audit history.
- Consumption: derive daily usage from inventory events with sufficient history, account for seasonality, allow manual correction, and show confidence; never treat a prediction as a measured quantity.
- Retailer integration: research approved partner APIs and terms; do not assume Whole Foods/Amazon cart-write APIs exist. Keep a manual list/export fallback.

## Suggested next exercise
Implement a real `GET /api/items` fetch in the UI, including loading, error and retry states. Then add a simulated 500 response for practice. Document API contract and draw the request lifecycle before coding.
