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
 * Export tất cả products từ MongoDB ra file JSON
 * Sử dụng: node backend/database/export-products.js
 */
async function exportProductsToJSON() {
  try {
    console.log("Starting export from MongoDB...");
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("✗ Error: MONGODB_URI is not set in .env file");
      process.exit(1);
    }
    
    await connectDB(uri);
    console.log("✓ Connected to MongoDB Atlas");
    
    const products = await Product.find({}).lean();
    console.log(`✓ Found ${products.length} products in database`);
    
    if (products.length === 0) {
      console.log("No products found in database to export!");
      process.exit(0);
    }
    
    // Loại bỏ các field MongoDB internal (_id, __v, createdAt, updatedAt)
    const cleanedProducts = products.map(p => {
      const { _id, __v, createdAt, updatedAt, ...product } = p;
      return product;
    });
    
    const jsonPath = path.join(__dirname, "products-data.json");
    await fs.writeFile(jsonPath, JSON.stringify(cleanedProducts, null, 2), "utf-8");
    console.log(`✓ Exported ${cleanedProducts.length} products to products-data.json`);
    console.log(`File location: ${jsonPath}`);
    
    console.log("✓ Export completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error exporting products:", error);
    process.exit(1);
  }
}

exportProductsToJSON();

