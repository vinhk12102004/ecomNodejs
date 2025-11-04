import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGODB_URI;

// Simple schema definitions
const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false }), "products");
const ProductVariant = mongoose.model("ProductVariant", new mongoose.Schema({
  product: mongoose.Schema.Types.ObjectId,
  sku: String,
  name: String,
  price: Number,
  stock: Number,
  attributes: {
    ramGB: Number,
    storageGB: Number,
    color: String
  },
  isActive: Boolean
}, { timestamps: true }), "product_variants");

const COLORS = ["Silver", "Black", "Space Gray", "Gold", "Blue"];

const RAM_CONFIGS = [
  { ramGB: 8, storageGB: 256, priceDelta: 0 },
  { ramGB: 16, storageGB: 512, priceDelta: 3000000 },
  { ramGB: 32, storageGB: 1024, priceDelta: 7000000 }
];

function generateSKU(productId, ramGB, storageGB, color) {
  return `SKU-${productId.toString().slice(-6)}-${ramGB}GB-${storageGB}GB-${color.replace(/\s+/g, '')}`.toUpperCase();
}

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB");

    // Clear existing variants
    await ProductVariant.deleteMany({});
    console.log("✓ Cleared existing variants");

    // Get all products
    const products = await Product.find({ isActive: true }).limit(100);
    console.log(`✓ Found ${products.length} products`);

    if (products.length === 0) {
      console.log("⚠ No products found. Please run seed.js first!");
      process.exit(1);
    }

    let totalVariants = 0;

    for (const product of products) {
      const productId = product._id;
      const basePrice = product.price || 10000000;
      
      // For each product, create at least 2 variants (requirement!)
      // We'll create 2-3 RAM/Storage configs with different colors
      const numConfigs = Math.random() > 0.5 ? 2 : 3;
      const selectedConfigs = RAM_CONFIGS.slice(0, numConfigs);
      
      for (const config of selectedConfigs) {
        // Pick 1-2 colors for each config
        const numColors = Math.random() > 0.5 ? 1 : 2;
        const selectedColors = COLORS.sort(() => Math.random() - 0.5).slice(0, numColors);
        
        for (const color of selectedColors) {
          const sku = generateSKU(productId, config.ramGB, config.storageGB, color);
          const variantPrice = basePrice + config.priceDelta;
          const variantStock = Math.floor(Math.random() * 41) + 10; // 10-50
          const variantName = `${config.ramGB}GB / ${config.storageGB}GB / ${color}`;
          
          await ProductVariant.create({
            product: productId,
            sku,
            name: variantName,
            price: variantPrice,
            stock: variantStock,
            attributes: {
              ramGB: config.ramGB,
              storageGB: config.storageGB,
              color
            },
            isActive: true
          });
          
          totalVariants++;
        }
      }
    }

    console.log(`✓ Created ${totalVariants} variants for ${products.length} products`);
    console.log(`  Average: ${(totalVariants / products.length).toFixed(1)} variants per product`);
    
    // Verify
    const variantCount = await ProductVariant.countDocuments();
    const productsWithVariants = await ProductVariant.distinct("product");
    console.log(`✓ Verification: ${variantCount} variants for ${productsWithVariants.length} products`);
    
    // Show sample
    const sample = await ProductVariant.findOne().populate("product", "name");
    if (sample) {
      console.log("\n📦 Sample variant:");
      console.log(`  SKU: ${sample.sku}`);
      console.log(`  Product: ${sample.product?.name || 'Unknown'}`);
      console.log(`  Name: ${sample.name}`);
      console.log(`  Price: ${sample.price.toLocaleString()} VND`);
      console.log(`  Stock: ${sample.stock}`);
      console.log(`  Attributes: ${sample.attributes.ramGB}GB RAM, ${sample.attributes.storageGB}GB, ${sample.attributes.color}`);
    }

    console.log("\n✅ Seed variants completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding variants:", error);
    process.exit(1);
  }
}

run();

