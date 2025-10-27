import { randomUUID } from "crypto";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

const db = (name, schema) => mongoose.model(name, new mongoose.Schema(schema, { timestamps: true }));

const Category = db("categories", { name: String, slug: String });
const Brand = db("brands", { name: String, slug: String });
const Product = db("products", {
  name: String,
  brand_id: mongoose.Types.ObjectId,
  category_id: mongoose.Types.ObjectId,
  description: String,
  images: [String]
});
const Variant = db("variants", {
  product_id: mongoose.Types.ObjectId,
  sku: String,
  price: Number,
  stock: Number,
  attrs: Object
});
const Review = db("reviews", {
  product_id: mongoose.Types.ObjectId,
  user_id: mongoose.Types.ObjectId,
  rating: Number,
  comment: String,
  anonymous: Boolean
});
const User = db("users", {
  email: String,
  password_hash: String,
  role: { type: String, default: "customer" }
});
const Coupon = db("coupons", {
  code: String,
  usage_limit: Number,
  used_count: { type: Number, default: 0 }
});

function slug(s) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

const pick = (arr, n) => Array.from({ length: n }, () => arr[Math.floor(Math.random() * arr.length)]);

async function run() {
  await mongoose.connect(uri);
  
  // Clear existing data
  await Promise.all([
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Variant.deleteMany({}),
    Review.deleteMany({}),
    User.deleteMany({}),
    Coupon.deleteMany({})
  ]);

  // Categories ≥3; Brands 5–8
  const cats = await Category.insertMany(
    ["Laptops", "Monitors", "Storage", "Accessories"]
      .slice(0, 3)
      .map(n => ({ name: n, slug: slug(n) }))
  );

  const brandsList = ["Acer", "Asus", "Lenovo", "HP", "Dell", "LG", "Samsung", "WD"];
  const brands = await Brand.insertMany(
    pick(brandsList, 6).map(n => ({ name: n, slug: slug(n) }))
  );

  // Products 50–100, mỗi sp 2–4 biến thể, ≥3 ảnh, mô tả ≥5 dòng
  const products = [];
  for (let i = 0; i < 60; i++) {
    const b = brands[i % brands.length];
    const c = cats[i % cats.length];
    products.push({
      name: `Product ${i + 1}`,
      brand_id: b._id,
      category_id: c._id,
      description: Array(5).fill(0).map((_, k) => `Line ${k + 1} for product ${i + 1}`).join("\n"),
      images: ["/img/1.jpg", "/img/2.jpg", "/img/3.jpg"]
    });
  }
  const prodDocs = await Product.insertMany(products);

  // Variants 2–4 per product
  const variants = [];
  for (const p of prodDocs) {
    const vcount = 2 + Math.floor(Math.random() * 3); // 2–4
    for (let j = 0; j < vcount; j++) {
      variants.push({
        product_id: p._id,
        sku: randomUUID().slice(0, 8),
        price: 1000000 + Math.floor(Math.random() * 10000000),
        stock: 1 + Math.floor(Math.random() * 50),
        attrs: {
          color: ["Black", "Silver", "Gray"][j % 3],
          ram: [8, 16, 32][j % 3]
        }
      });
    }
  }
  await Variant.insertMany(variants);

  // Reviews 200+, Ratings yêu cầu user (tạo user trước)
  const admin = await User.create({
    email: "admin@example.com",
    password_hash: "<hashed>",
    role: "admin"
  });

  const customers = await User.insertMany(
    Array.from({ length: 10 }, (_, i) => ({
      email: `user${i + 1}@example.com`,
      password_hash: "<hashed>",
      role: "customer"
    }))
  );

  const users = [admin, ...customers];

  const reviews = [];
  for (let i = 0; i < 220; i++) {
    const p = prodDocs[i % prodDocs.length];
    const u = users[i % users.length];
    reviews.push({
      product_id: p._id,
      user_id: u._id,
      rating: 3 + Math.floor(Math.random() * 3),
      comment: `Great ${p.name}`,
      anonymous: i % 4 === 0
    });
  }
  await Review.insertMany(reviews);

  // Coupons 8–12 (mã 5 ký tự, usage_limit ≤10)
  const code = () => Math.random().toString(36).replace(/[^a-z0-9]/g, "").toUpperCase().slice(0, 5);
  await Coupon.insertMany(
    Array.from({ length: 10 }, () => ({
      code: code(),
      usage_limit: Math.floor(Math.random() * 10) + 1
    }))
  );

  console.log("Seed done");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});