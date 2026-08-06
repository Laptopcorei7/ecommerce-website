# Sundry

A full-stack storefront for a general store — homeware, clothing, tools and
books, forty-three items in total. React on the front, Express and MongoDB
behind it, with a real cart, real orders, real reviews and an admin area.

Built as a portfolio project. It is not deployed and takes no payments; what it
is meant to demonstrate is the shape of the thing done carefully.

![The Sundry home page](docs/screenshots/home-hero.jpg)

---

## Screens

|                                                                  |                                                          |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| ![The catalogue index](docs/screenshots/index-grid.jpg)          | ![A product page](docs/screenshots/product-detail.jpg)   |
| The index — hairline catalogue grid, filters in the query string | Product page — gallery, derived rating, reviews          |
| ![Order history](docs/screenshots/orders.jpg)                    | ![Admin dashboard](docs/screenshots/admin-dashboard.jpg) |
| Order history with expandable line items                         | Admin — shop figures and order status transitions        |

---

## The design

The interface is deliberately not the default. Type does the branding: display
copy is set in **Fraunces** with its optical-size, `SOFT` and `WONK` axes
turned on, the UI runs on **Inter Tight**, and every piece of metadata —
category, price, stock, SKU, dates — is **IBM Plex Mono**, uppercase and
tracked. That last choice does most of the work of making the app read as
retail rather than as a dashboard.

The palette is printing ink on paper stock: a warm off-white ground
(`#F7F6F2`), a cool near-black (`#14161A`), and exactly one accent — vermilion
`#C8401B` — spent only on price, sale state and the primary action. Radii are
2–4px and there are effectively no drop shadows; separation comes from hairline
rules and a step in background tone, the way a printed catalogue divides one
cell from the next.

Product photography was chosen, not scraped. Every image is a real Unsplash
photograph picked for a neutral ground and soft light so the grid reads as one
shop, and every URL is verified before it can be seeded:

```bash
node src/scripts/seed-products.js --verify
```

---

## Stack

|         |                                                              |
| ------- | ------------------------------------------------------------ |
| Client  | React 18, TypeScript, Vite, Tailwind CSS, React Router       |
| Server  | Node, Express 5, Mongoose 9, MongoDB                         |
| Auth    | File-backed sessions + httpOnly cookie (not JWT — see below) |
| Tooling | Prettier, ESLint                                             |

---

## Features

**Storefront** — catalogue with search, category filter, four sort orders and
pagination, all held in the query string so a filtered view survives a reload
and the back button. Product pages with a three-crop gallery, stock states, and
reviews. Saved items. A cart that persists against the account.

**Checkout** — address capture, a running total computed from the same pricing
rule the server charges, and orders that decrement stock atomically.

**Reviews** — one per customer per product, enforced by a unique compound
index. Ratings shown on the storefront are always recomputed from the review
documents that exist; nothing displays a rating with nothing behind it.

**Admin** — a separate sign-in requiring an employee ID, a dashboard of shop
figures, order status transitions, and full catalogue CRUD.

---

## How it is put together

```
client/src
  api/          typed fetch client, one module
  components/   common/ (primitives) · layout/ · product/
  contexts/     Auth · Cart · Wishlist · Toast
  lib/          format · pricing · editorial
  pages/        one file per route, admin/ nested
server/src
  controllers/  http* handlers, one file per resource
  data/         the curated catalogue and review copy
  lib/          pricing · api-error
  middleware/   auth · admin · rate-limit · error
  models/       mongoose schemas
  routes/       routers, mounted at the root in app.js
  scripts/      create-admin · seed-products
```

### Decisions worth pointing at

**One pricing rule, mirrored rather than duplicated.**
`server/src/lib/pricing.js` is authoritative and `client/src/lib/pricing.ts`
mirrors it, so the storefront can show a running total without a round trip
while the server remains the thing that decides what is charged. Money is
rounded to whole cents at every step — summing unrounded floats produces totals
that don't match the lines shown to the customer.

**Stock changes are atomic and transactional.** Orders decrement stock with a
single `bulkWrite` filtered on `stock: { $gte: quantity }`, so availability is
re-checked at write time rather than trusting an earlier read; a short
`modifiedCount` aborts the whole order with a 409. Cancellations restock via
`$inc` inside a transaction, so two concurrent cancels conflict instead of
double-restocking. (This needs a replica set — Atlas provides one.)

**Auth is server-side sessions, not JWT.** Sessions live in a file keyed by an
httpOnly cookie. Writes are coalesced and land via a temp-file rename so a
crash cannot truncate the store; the boot-time read is synchronous on purpose,
because an async one would serve the first requests against an empty map and
log everyone out. It is a deliberate choice: revocation is genuinely useful
here, and a stateless token would trade a correct design for a familiar one.

**Auth middleware is scoped per route.** A path-less `router.use(requireAuth)`
on a router mounted at the root applies to every request that reaches it —
including routes registered in later routers. Three routers did this, which is
why public review listings were returning 401.

**Ratings are derived, never authored.** The seeder inserts real `Review`
documents and recomputes `averageRating` and `totalReviews` from them. Review
counts, dates and scores are jittered, because uniform values read as
generated.

---

## Running it

**Requires** Node 18+ and a MongoDB connection string. Transactions need a
replica set, so a MongoDB Atlas cluster is the easiest route; a standalone
`mongod` will serve the catalogue but fail on checkout.

```bash
git clone <your-remote> sundry && cd sundry
npm install --prefix server
npm install --prefix client
```

Create `server/.env`:

```ini
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sundry
PORT=8000

# Optional — used by create-admin.js, which falls back to dev defaults
ADMIN_EMAIL=admin@sundry.test
ADMIN_PASSWORD=your-password
ADMIN_EMPLOYEE_ID=SUN-0001
```

Seed the database. The admin has to exist first, because products carry a
`createdBy` reference:

```bash
cd server
node src/scripts/create-admin.js
node src/scripts/seed-products.js --verify
```

Run both halves in separate terminals:

```bash
cd server && npm run watch     # http://localhost:8000
cd client && npm run dev       # http://localhost:3000
```

### Signing in

Seeding creates twelve demo customers with order and review history. Any of
them works; the first is:

```
adwoa.mensah@example.com / Sundry!Demo7
```

Administration is at `/admin/login` and needs the employee ID as well as the
email and password you set in `.env`.

---

## Checks

```bash
npm run format          # Prettier, repo-wide
npm run format:check
cd client && npx tsc --noEmit   # currently clean
```

---

## What this deliberately does not do

Being straight about the edges, since they are choices rather than oversights:

- **No payment provider.** Checkout captures an address and writes an order.
  The payment method selector is presentational and the UI says so.
- **No mail transport.** Password-reset and verification links are written to
  the server console. Email changes are disabled in the profile screen rather
  than pretending to verify a new address.
- **Sessions are file-backed**, which is fine for one process and wrong for
  several. Moving to a shared store is a deliberate non-goal here.
- **Not deployed, and not hardened for deployment.** No CI, no container, no
  rate limiting beyond the auth routes.

---

## Credits

Photography from [Unsplash](https://unsplash.com). Typefaces: Fraunces by
Undercase Type, Inter Tight by Rasmus Andersson, IBM Plex Mono by IBM.
