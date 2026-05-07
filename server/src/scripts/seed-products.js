const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Product = require("../models/product/product.mongo");
const Register = require("../models/user/register.mongo");

// ─────────────────────────────────────────────────────────────
// DummyJSON category → your schema enum
// Every DummyJSON category maps to one of:
// Electronics | Clothing | Books | Home | Sports | Other
// ─────────────────────────────────────────────────────────────
const CATEGORY_MAP = {
  smartphones: "Electronics",
  laptops: "Electronics",
  tablets: "Electronics",
  "mobile-accessories": "Electronics",
  "mens-shirts": "Clothing",
  "mens-shoes": "Clothing",
  "mens-watches": "Clothing",
  tops: "Clothing",
  "womens-dresses": "Clothing",
  "womens-shoes": "Clothing",
  "womens-bags": "Clothing",
  "womens-jewellery": "Clothing",
  "womens-watches": "Clothing",
  sunglasses: "Clothing",
  "skin-care": "Other",
  beauty: "Other",
  fragrances: "Other",
  groceries: "Other",
  motorcycle: "Other",
  vehicle: "Other",
  furniture: "Home",
  "home-decoration": "Home",
  "kitchen-accessories": "Home",
  "sports-accessories": "Sports",
};

// ─────────────────────────────────────────────────────────────
// Fetch ALL products from DummyJSON in one request
// limit=0 removes the default cap and returns everything (~194)
// ─────────────────────────────────────────────────────────────
async function fetchAllDummyProducts() {
  console.log("🌐 Fetching products from DummyJSON...");
  try {
    const res = await fetch(
      "https://dummyjson.com/products?limit=0&select=title,description,price,category,brand,stock,rating,reviews,thumbnail,images",
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`✓ Fetched ${data.products.length} products from DummyJSON\n`);
    return data.products;
  } catch (err) {
    console.error("❌ Failed to fetch from DummyJSON:", err.message);
    process.exit(1); // No point continuing without real data
  }
}

// ─────────────────────────────────────────────────────────────
// Transform a single DummyJSON product into your schema shape
// ─────────────────────────────────────────────────────────────
function transformProduct(dummyProduct, adminUserId) {
  const {
    title,
    description,
    price,
    category,
    brand,
    stock,
    rating,
    reviews,
    thumbnail,
    images,
  } = dummyProduct;

  // Map category — fall back to "Other" for anything unmapped
  const mappedCategory = CATEGORY_MAP[category] || "Other";

  // Images: thumbnail first, then up to 2 extras from images[]
  // Filter out the thumbnail from extras to avoid duplicates
  const extras = (images || []).filter((url) => url !== thumbnail).slice(0, 2);
  const productImages = [thumbnail, ...extras].filter(Boolean);

  // Rating: DummyJSON gives a float like 4.69 — round to 1 decimal
  const averageRating = Math.round((rating || 0) * 10) / 10;

  // Review count: use the actual reviews array length
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;

  return {
    name: title,
    description: description || "",
    price: parseFloat(price.toFixed(2)),
    category: mappedCategory,
    brand: brand || "",
    stock: stock || 0,
    images: productImages,
    averageRating,
    totalReviews,
    createdBy: adminUserId,
  };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function seedProducts() {
  try {
    console.log("🌱 Starting product seeding...\n");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to database\n");

    // Require an admin user — createdBy is non-nullable in the schema
    const adminUser = await Register.findOne({ role: "admin" });
    if (!adminUser) {
      console.error(
        "❌ No admin user found. Create one first with create-admin.js",
      );
      process.exit(1);
    }
    console.log("✓ Found admin user:", adminUser.email, "\n");

    // Fetch from DummyJSON — exits if unreachable
    const dummyProducts = await fetchAllDummyProducts();

    // Clear existing products
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠ Found ${existingCount} existing products — clearing...`);
      await Product.deleteMany({});
      console.log("✓ Cleared\n");
    }

    // Transform and insert
    console.log("🔄 Transforming products...");
    const products = dummyProducts.map((p) =>
      transformProduct(p, adminUser._id),
    );
    console.log(`✓ Transformed ${products.length} products\n`);

    console.log("💾 Inserting into database...");
    const inserted = await Product.insertMany(products);
    console.log(`✓ Inserted ${inserted.length} products\n`);

    // ── Summary ──
    console.log("📊 Category breakdown:");
    const counts = {};
    for (const p of inserted) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    for (const [cat, count] of Object.entries(counts)) {
      console.log(`   ${cat}: ${count} products`);
    }

    const withRatings = inserted.filter((p) => p.averageRating > 0).length;
    console.log(
      `\n⭐ Products with ratings: ${withRatings}/${inserted.length}`,
    );

    const top3 = [...inserted]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);
    console.log("\n🏆 Top 3 by rating:");
    for (const p of top3) {
      console.log(
        `   ${p.name} — ${p.averageRating}⭐ (${p.totalReviews} reviews) [${p.category}]`,
      );
    }

    console.log("\n✅ Seeding complete!\n");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("✓ Database connection closed");
    process.exit(0);
  }
}

seedProducts();
