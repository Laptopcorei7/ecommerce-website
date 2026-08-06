/**
 * Seed the storefront: products, demo customers, and the reviews behind every
 * product's rating.
 *
 *   node src/scripts/seed-products.js            seed
 *   node src/scripts/seed-products.js --verify   check every image URL first
 *
 * Ratings are never written by hand. The seeder inserts real Review documents
 * and then recomputes averageRating and totalReviews from them, so the numbers
 * the storefront shows always have reviews behind them.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Product = require("../models/product/product.mongo");
const Review = require("../models/reviews/review.mongo");
const Register = require("../models/user/register.mongo");
const { PRODUCTS, imageUrl } = require("../data/catalog");
const { CUSTOMERS, CUSTOMER_PASSWORD, BODIES } = require("../data/reviews");

const VERIFY = process.argv.includes("--verify");

// Reviews per product. The unique (productId, userId) index caps this at the
// number of demo customers.
const DAY = 86_400_000;
const MIN_REVIEWS = 3;
const MAX_REVIEWS = Math.min(8, CUSTOMERS.length);

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic RNG
//
// A fixed seed means re-running produces the same catalogue. Without it, every
// seed shuffles ratings and screenshots stop matching the database.
// ─────────────────────────────────────────────────────────────────────────────
function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const rng = makeRng(20260806);

const pick = (arr) => arr[Math.floor(rng() * arr.length)];

function pickDistinct(arr, count) {
  const copy = [...arr];
  const out = [];
  while (out.length < count && copy.length) {
    out.push(...copy.splice(Math.floor(rng() * copy.length), 1));
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Images
//
// Three aspect ratios of the same photograph give the product gallery genuinely
// different framings (a tall crop, a square and a wide one) without needing
// three separate shoots.
// ─────────────────────────────────────────────────────────────────────────────
const ASPECTS = ["4:5", "1:1", "3:2"];

function galleryFor(photo) {
  return ASPECTS.map((ar) => `${imageUrl(photo, 1200)}&ar=${ar}`);
}

async function verifyImages() {
  console.log(`Verifying ${PRODUCTS.length} product images…`);
  const failures = [];

  for (let i = 0; i < PRODUCTS.length; i += 8) {
    const batch = PRODUCTS.slice(i, i + 8);
    await Promise.all(
      batch.map(async (p) => {
        try {
          const res = await fetch(imageUrl(p.photo, 200));
          const type = res.headers.get("content-type") || "";
          if (!res.ok || !type.startsWith("image/")) {
            failures.push(
              `${p.name}: HTTP ${res.status} (${type || "no type"})`,
            );
          }
        } catch (err) {
          failures.push(`${p.name}: ${err.message}`);
        }
      }),
    );
    process.stdout.write(".");
  }

  console.log("");
  if (failures.length) {
    console.error(`\n${failures.length} image(s) failed:`);
    for (const f of failures) console.error(`  ${f}`);
    throw new Error("Image verification failed. Fix catalog.js before seeding");
  }
  console.log("All product images resolved.\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews
//
// Ratings are drawn to land near the catalogue's target without ever being
// exactly it, because a product where every reviewer agrees to one decimal place looks
// fabricated.
// ─────────────────────────────────────────────────────────────────────────────
function ratingsFor(target, count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const jitter = rng() < 0.72 ? 0 : rng() < 0.6 ? -1 : 1;
    out.push(Math.max(3, Math.min(5, Math.round(target) + jitter)));
  }
  return out;
}

function bodyFor(category, rating) {
  const band = rating >= 5 ? "high" : rating >= 4 ? "good" : "mixed";
  const pool = BODIES[category] || BODIES.Other;
  return pick(pool[band]);
}

/**
 * How many reviews a product gets. Scaled from the catalogue's popularity
 * target and then jittered, because a catalogue where every product has
 * exactly the maximum number of reviews reads as generated.
 */
function reviewCountFor(product) {
  const popularity = Math.min(1, (product.reviews ?? 20) / 120);
  const base = MIN_REVIEWS + popularity * (MAX_REVIEWS - MIN_REVIEWS - 1);
  const jitter = rng() < 0.4 ? 0 : rng() < 0.7 ? 1 : 2;
  return Math.max(
    MIN_REVIEWS,
    Math.min(MAX_REVIEWS, Math.round(base + jitter)),
  );
}

/**
 * Rank products by how recently they were "added", rotating through the
 * categories so the arrivals rail shows a mug beside a book beside a boot.
 * Returns an array where `result[i]` is the recency rank of `products[i]`.
 * Rank 0 is newest.
 */
function recencyOrder(products) {
  const byCategory = new Map();
  products.forEach((product, i) => {
    const bucket = byCategory.get(product.category) ?? [];
    bucket.push(i);
    byCategory.set(product.category, bucket);
  });

  // Shuffle within each category so the rotation isn't catalogue order.
  const queues = [...byCategory.values()].map((bucket) =>
    pickDistinct(bucket, bucket.length),
  );

  const ranks = new Array(products.length);
  let rank = 0;
  while (queues.some((q) => q.length)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next !== undefined) ranks[next] = rank++;
    }
  }
  return ranks;
}

function buildReviews(product, productId, customers, stockedAt) {
  const reviewers = pickDistinct(customers, reviewCountFor(product));
  const ratings = ratingsFor(product.rating, reviewers.length);

  // Reviews land between the day the product was stocked and now. Without
  // this every review carries the seed timestamp and the storefront reports
  // that all of them were written "just now".
  const window = Math.max(DAY, Date.now() - stockedAt.getTime());

  return reviewers.map((user, i) => {
    const rating = ratings[i];
    const [title, comment] = bodyFor(product.category, rating);
    const createdAt = new Date(stockedAt.getTime() + rng() * window);
    return {
      productId,
      userId: user._id,
      rating,
      title,
      comment,
      // Most reviewers bought the thing; a minority did not.
      isVerifiedPurchase: rng() < 0.8,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────
async function seedCustomers() {
  const existing = await Register.find({
    email: { $in: CUSTOMERS.map((c) => c.email) },
  });
  const byEmail = new Map(existing.map((u) => [u.email, u]));
  const created = [];

  for (const customer of CUSTOMERS) {
    if (byEmail.has(customer.email)) continue;
    // Register.create() runs the pre-save hook that hashes the password.
    // insertMany() would skip it and store plaintext.
    created.push(
      await Register.create({
        ...customer,
        password: CUSTOMER_PASSWORD,
        role: "user",
        isVerified: true,
      }),
    );
  }

  const all = [...existing, ...created];
  console.log(
    `Customers: ${all.length} total (${created.length} created, ${existing.length} already present)`,
  );
  return all;
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Check server/.env");
  }

  if (VERIFY) await verifyImages();

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  const admin = await Register.findOne({ role: "admin" });
  if (!admin) {
    throw new Error(
      "No admin user found. Run `node src/scripts/create-admin.js` first. " +
        "Products require a createdBy reference.",
    );
  }
  console.log(`Admin: ${admin.email}`);

  const customers = await seedCustomers();

  // Products and their reviews are replaced together. Leaving old reviews
  // behind would orphan them against product ids that no longer exist.
  const [oldProducts, oldReviews] = await Promise.all([
    Product.countDocuments(),
    Review.countDocuments(),
  ]);
  if (oldProducts || oldReviews) {
    await Promise.all([Product.deleteMany({}), Review.deleteMany({})]);
    console.log(`Cleared ${oldProducts} products and ${oldReviews} reviews\n`);
  }

  // insertMany would stamp every document with the same createdAt, making
  // "Newest" an arbitrary ordering and filling the arrivals rail with whichever
  // category happened to sort first. Dates are assigned by rotating through the
  // categories so the most recent additions span the shop.
  //
  // These have to be set at insert time: mongoose marks createdAt immutable
  // when timestamps are enabled, so a later $set on it is silently dropped.
  // `{ timestamps: false }` tells mongoose to keep the values given here.
  const ranks = recencyOrder(PRODUCTS);

  const inserted = await Product.insertMany(
    PRODUCTS.map((p, i) => {
      const daysAgo = 4 + ranks[i] * 16 + Math.floor(rng() * 12);
      const createdAt = new Date(Date.now() - daysAgo * DAY);
      return {
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        images: galleryFor(p.photo),
        createdBy: admin._id,
        createdAt,
        updatedAt: createdAt,
        // Placeholders. Overwritten below from the reviews actually inserted.
        averageRating: 0,
        totalReviews: 0,
      };
    }),
    { timestamps: false },
  );
  console.log(`Inserted ${inserted.length} products`);

  // Build every review, insert once, then fold the real averages back onto the
  // products in a single bulkWrite rather than a save() per product.
  const allReviews = [];
  const productUpdates = [];

  inserted.forEach((doc, i) => {
    const reviews = buildReviews(
      PRODUCTS[i],
      doc._id,
      customers,
      doc.createdAt,
    );
    allReviews.push(...reviews);

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    productUpdates.push({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            averageRating: Math.round((sum / reviews.length) * 10) / 10,
            totalReviews: reviews.length,
          },
        },
        timestamps: false,
      },
    });
  });

  await Review.insertMany(allReviews, { timestamps: false });
  await Product.bulkWrite(productUpdates);
  console.log(`Inserted ${allReviews.length} reviews and recomputed ratings\n`);

  // ── Summary ──
  const byCategory = inserted.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  console.log("Catalogue");
  for (const [category, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${category.padEnd(12)} ${String(count).padStart(3)}`);
  }

  const prices = inserted.map((p) => p.price);
  console.log(
    `\nPrice range   $${Math.min(...prices)} – $${Math.max(...prices)}`,
  );
  console.log(`Out of stock  ${inserted.filter((p) => p.stock === 0).length}`);
  console.log(
    `Low stock     ${inserted.filter((p) => p.stock > 0 && p.stock <= 5).length}`,
  );
  console.log(`Demo login    ${CUSTOMERS[0].email} / ${CUSTOMER_PASSWORD}\n`);
}

seed()
  .then(() => {
    console.log("Done.");
    process.exitCode = 0;
  })
  .catch((err) => {
    console.error(`\nSeeding failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
