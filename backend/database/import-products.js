import dotenv from "dotenv";
import Product from "../src/models/product.model.js";
import { connectDB } from "../src/config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Import products từ file JSON vào MongoDB
 * Sử dụng: node backend/database/import-products.js [file-path]
 */
async function importProductsFromJSON(filePath) {
  try {
    console.log("Starting import to MongoDB...");
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("✗ Error: MONGODB_URI is not set in .env file");
      process.exit(1);
    }
    
    await connectDB(uri);
    console.log("✓ Connected to MongoDB");
    
    // Read JSON file
    const jsonPath = filePath || path.join(__dirname, "products-data.json");
    const fileContent = await fs.readFile(jsonPath, "utf-8");
    const products = JSON.parse(fileContent);
    
    console.log(`✓ Found ${products.length} products in JSON file`);
    
    if (products.length === 0) {
      console.log("⚠️  No products found in JSON file!");
      process.exit(0);
    }
    
    // Clear existing products (optional - comment out if you want to keep existing)
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing products. Clearing...`);
      await Product.deleteMany({});
      console.log("✓ Cleared existing products");
    }
    
    // Insert products
    const result = await Product.insertMany(products);
    console.log(`✓ Imported ${result.length} products successfully!`);
    
    console.log("✓ Import completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error importing products:", error);
    process.exit(1);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];
importProductsFromJSON(filePath);

