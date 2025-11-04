import mongoose from "mongoose";
import Product from "../src/models/product.model.js";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc dữ liệu sản phẩm từ file JSON
async function loadProductsFromJSON() {
  try {
    const jsonPath = path.join(__dirname, "products-data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("❌ Lỗi khi đọc file products-data.json:", error.message);
    return [];
  }
}

// Dữ liệu mặc định (fallback) nếu không có file JSON
const defaultProducts = [
  {
    name: "MacBook Air M2 13-inch",
    brand: "Apple",
    price: 1199,
    description: "Ultra-thin laptop with M2 chip, perfect for students and professionals",
    image: "https://example.com/macbook-air-m2.jpg",
    rating: 4.7,
    stock: 25,
    specs: {
      cpu: {
        model: "Apple M2",
        cores: 8,
        threads: 8,
        baseGHz: 3.2,
        boostGHz: 3.5
      },
      ramGB: 8,
      storage: {
        type: "NVMe",
        sizeGB: 256
      },
      gpu: {
        model: "Apple M2 GPU",
        vramGB: 8
      },
      screen: {
        sizeInch: 13.6,
        resolution: "2560x1664",
        panel: "Liquid Retina",
        refreshHz: 60
      },
      weightKg: 1.24,
      batteryWh: 52.6,
      os: "macOS Ventura",
      ports: ["USB-C", "MagSafe 3", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "Dell XPS 13 9320",
    brand: "Dell",
    price: 1299,
    description: "Premium ultrabook with stunning 13.4-inch display and excellent build quality",
    image: "https://example.com/dell-xps-13.jpg",
    rating: 4.5,
    stock: 18,
    specs: {
      cpu: {
        model: "Intel Core i7-1260P",
        cores: 12,
        threads: 16,
        baseGHz: 2.1,
        boostGHz: 4.7
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 13.4,
        resolution: "1920x1200",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.27,
      batteryWh: 51,
      os: "Windows 11 Home",
      ports: ["USB-C", "Thunderbolt 4", "MicroSD", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.2"
    }
  },
  {
    name: "ASUS ROG Zephyrus G14 GA402",
    brand: "Asus",
    price: 1399,
    description: "Compact gaming laptop with AMD Ryzen 9 and RTX 4060",
    image: "https://example.com/asus-rog-g14-2023.jpg",
    rating: 4.6,
    stock: 8,
    specs: {
      cpu: {
        model: "AMD Ryzen 9 7940HS",
        cores: 8,
        threads: 16,
        baseGHz: 4.0,
        boostGHz: 5.2
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 1024
      },
      gpu: {
        model: "NVIDIA RTX 4060",
        vramGB: 8
      },
      screen: {
        sizeInch: 14,
        resolution: "2560x1600",
        panel: "IPS",
        refreshHz: 165
      },
      weightKg: 1.65,
      batteryWh: 76,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.2"
    }
  },
  {
    name: "Lenovo Legion 5 Pro",
    brand: "Lenovo",
    price: 1599,
    description: "Gaming laptop with powerful RTX 4070 and high-refresh display",
    image: "https://example.com/lenovo-legion-5-pro.jpg",
    rating: 4.4,
    stock: 12,
    specs: {
      cpu: {
        model: "AMD Ryzen 7 7745HX",
        cores: 8,
        threads: 16,
        baseGHz: 3.2,
        boostGHz: 5.1
      },
      ramGB: 32,
      storage: {
        type: "NVMe",
        sizeGB: 1024
      },
      gpu: {
        model: "NVIDIA RTX 4070",
        vramGB: 8
      },
      screen: {
        sizeInch: 16,
        resolution: "2560x1600",
        panel: "IPS",
        refreshHz: 165
      },
      weightKg: 2.5,
      batteryWh: 80,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Ethernet", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.1"
    }
  },
  {
    name: "HP Spectre x360 14",
    brand: "HP",
    price: 1499,
    description: "Premium 2-in-1 convertible with OLED display and excellent design",
    image: "https://example.com/hp-spectre-x360-14.jpg",
    rating: 4.3,
    stock: 15,
    specs: {
      cpu: {
        model: "Intel Core i7-1360P",
        cores: 12,
        threads: 16,
        baseGHz: 2.2,
        boostGHz: 5.0
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 14,
        resolution: "2880x1800",
        panel: "OLED Touch",
        refreshHz: 60
      },
      weightKg: 1.4,
      batteryWh: 66,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "Thunderbolt 4", "MicroSD", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.2"
    }
  },
  {
    name: "MSI GF63 Thin",
    brand: "MSI",
    price: 899,
    description: "Affordable gaming laptop with GTX 1650 and decent performance",
    image: "https://example.com/msi-gf63-thin.jpg",
    rating: 4.1,
    stock: 20,
    specs: {
      cpu: {
        model: "Intel Core i5-11400H",
        cores: 6,
        threads: 12,
        baseGHz: 2.7,
        boostGHz: 4.5
      },
      ramGB: 8,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "NVIDIA GTX 1650",
        vramGB: 4
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.86,
      batteryWh: 51,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.1"
    }
  },
  {
    name: "Acer Swift X SFX14-41G",
    brand: "Acer",
    price: 1099,
    description: "Thin and light laptop with RTX 3050 Ti for content creation",
    image: "https://example.com/acer-swift-x.jpg",
    rating: 4.2,
    stock: 14,
    specs: {
      cpu: {
        model: "AMD Ryzen 7 5800U",
        cores: 8,
        threads: 16,
        baseGHz: 1.9,
        boostGHz: 4.4
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "NVIDIA RTX 3050 Ti",
        vramGB: 4
      },
      screen: {
        sizeInch: 14,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.39,
      batteryWh: 59,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "MacBook Pro 16-inch M3 Max",
    brand: "Apple",
    price: 3499,
    description: "Professional laptop with M3 Max chip for intensive workloads",
    image: "https://example.com/macbook-pro-16-m3-max.jpg",
    rating: 4.8,
    stock: 5,
    specs: {
      cpu: {
        model: "Apple M3 Max",
        cores: 14,
        threads: 14,
        baseGHz: 3.2,
        boostGHz: 4.4
      },
      ramGB: 36,
      storage: {
        type: "NVMe",
        sizeGB: 1024
      },
      gpu: {
        model: "Apple M3 Max GPU",
        vramGB: 16
      },
      screen: {
        sizeInch: 16.2,
        resolution: "3456x2234",
        panel: "Liquid Retina XDR",
        refreshHz: 120
      },
      weightKg: 2.16,
      batteryWh: 100,
      os: "macOS Sonoma",
      ports: ["USB-C", "Thunderbolt 4", "SDXC", "HDMI", "MagSafe 3"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.3"
    }
  },
  {
    name: "Dell Inspiron 15 3000",
    brand: "Dell",
    price: 599,
    description: "Budget-friendly laptop for everyday computing tasks",
    image: "https://example.com/dell-inspiron-15-3000.jpg",
    rating: 4.0,
    stock: 30,
    specs: {
      cpu: {
        model: "Intel Core i3-1115G4",
        cores: 2,
        threads: 4,
        baseGHz: 3.0,
        boostGHz: 4.1
      },
      ramGB: 8,
      storage: {
        type: "SSD",
        sizeGB: 256
      },
      gpu: {
        model: "Intel UHD Graphics",
        vramGB: 0
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "TN",
        refreshHz: 60
      },
      weightKg: 1.83,
      batteryWh: 41,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "Lenovo ThinkPad E15 Gen 4",
    brand: "Lenovo",
    price: 899,
    description: "Business laptop with AMD Ryzen processor and professional features",
    image: "https://example.com/thinkpad-e15-gen4.jpg",
    rating: 4.3,
    stock: 22,
    specs: {
      cpu: {
        model: "AMD Ryzen 5 5625U",
        cores: 6,
        threads: 12,
        baseGHz: 2.3,
        boostGHz: 4.3
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "AMD Radeon Graphics",
        vramGB: 0
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.75,
      batteryWh: 57,
      os: "Windows 11 Pro",
      ports: ["USB-C", "USB-A", "HDMI", "Ethernet", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "ASUS VivoBook S15",
    brand: "Asus",
    price: 799,
    description: "Stylish laptop with vibrant colors and good performance",
    image: "https://example.com/asus-vivobook-s15.jpg",
    rating: 4.1,
    stock: 18,
    specs: {
      cpu: {
        model: "Intel Core i5-1235U",
        cores: 10,
        threads: 12,
        baseGHz: 1.3,
        boostGHz: 4.4
      },
      ramGB: 8,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.8,
      batteryWh: 50,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "HP Pavilion 15",
    brand: "HP",
    price: 699,
    description: "Reliable laptop for students and home users",
    image: "https://example.com/hp-pavilion-15.jpg",
    rating: 4.0,
    stock: 25,
    specs: {
      cpu: {
        model: "AMD Ryzen 5 5500U",
        cores: 6,
        threads: 12,
        baseGHz: 2.1,
        boostGHz: 4.0
      },
      ramGB: 8,
      storage: {
        type: "NVMe",
        sizeGB: 256
      },
      gpu: {
        model: "AMD Radeon Graphics",
        vramGB: 0
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.75,
      batteryWh: 41,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "MSI Stealth 15M",
    brand: "MSI",
    price: 1299,
    description: "Slim gaming laptop with RTX 3060 and portable design",
    image: "https://example.com/msi-stealth-15m.jpg",
    rating: 4.3,
    stock: 10,
    specs: {
      cpu: {
        model: "Intel Core i7-11375H",
        cores: 4,
        threads: 8,
        baseGHz: 3.3,
        boostGHz: 5.0
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "NVIDIA RTX 3060",
        vramGB: 6
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 144
      },
      weightKg: 1.69,
      batteryWh: 52,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.1"
    }
  },
  {
    name: "Acer Aspire 5 A515-56",
    brand: "Acer",
    price: 649,
    description: "Affordable laptop with good performance for daily tasks",
    image: "https://example.com/acer-aspire-5.jpg",
    rating: 4.0,
    stock: 28,
    specs: {
      cpu: {
        model: "Intel Core i5-1135G7",
        cores: 4,
        threads: 8,
        baseGHz: 2.4,
        boostGHz: 4.2
      },
      ramGB: 8,
      storage: {
        type: "NVMe",
        sizeGB: 256
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 15.6,
        resolution: "1920x1080",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.65,
      batteryWh: 48,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.0"
    }
  },
  {
    name: "Razer Blade 14",
    brand: "Razer",
    price: 1999,
    description: "Compact gaming laptop with RTX 4070 and premium build",
    image: "https://example.com/razer-blade-14.jpg",
    rating: 4.5,
    stock: 6,
    specs: {
      cpu: {
        model: "AMD Ryzen 9 7940HS",
        cores: 8,
        threads: 16,
        baseGHz: 4.0,
        boostGHz: 5.2
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 1024
      },
      gpu: {
        model: "NVIDIA RTX 4070",
        vramGB: 8
      },
      screen: {
        sizeInch: 14,
        resolution: "2560x1600",
        panel: "IPS",
        refreshHz: 165
      },
      weightKg: 1.78,
      batteryWh: 68.1,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.2"
    }
  },
  {
    name: "LG Gram 17",
    brand: "LG",
    price: 1399,
    description: "Ultra-lightweight 17-inch laptop with excellent battery life",
    image: "https://example.com/lg-gram-17.jpg",
    rating: 4.4,
    stock: 12,
    specs: {
      cpu: {
        model: "Intel Core i7-1260P",
        cores: 12,
        threads: 16,
        baseGHz: 2.1,
        boostGHz: 4.7
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 17,
        resolution: "2560x1600",
        panel: "IPS",
        refreshHz: 60
      },
      weightKg: 1.35,
      batteryWh: 80,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "Thunderbolt 4", "HDMI", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.1"
    }
  },
  {
    name: "Microsoft Surface Laptop 5",
    brand: "Microsoft",
    price: 1199,
    description: "Premium laptop with touchscreen and excellent build quality",
    image: "https://example.com/surface-laptop-5.jpg",
    rating: 4.3,
    stock: 16,
    specs: {
      cpu: {
        model: "Intel Core i5-1235U",
        cores: 10,
        threads: 12,
        baseGHz: 1.3,
        boostGHz: 4.4
      },
      ramGB: 8,
      storage: {
        type: "NVMe",
        sizeGB: 256
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 13.5,
        resolution: "2256x1504",
        panel: "PixelSense Touch",
        refreshHz: 60
      },
      weightKg: 1.27,
      batteryWh: 47.4,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "Surface Connect", "Headphone Jack"],
      wifi: "Wi-Fi 6",
      bluetooth: "Bluetooth 5.1"
    }
  },
  {
    name: "Gigabyte Aorus 15X",
    brand: "Gigabyte",
    price: 1799,
    description: "High-performance gaming laptop with RTX 4070 and mechanical keyboard",
    image: "https://example.com/gigabyte-aorus-15x.jpg",
    rating: 4.4,
    stock: 8,
    specs: {
      cpu: {
        model: "Intel Core i7-13700H",
        cores: 14,
        threads: 20,
        baseGHz: 2.4,
        boostGHz: 5.0
      },
      ramGB: 32,
      storage: {
        type: "NVMe",
        sizeGB: 1024
      },
      gpu: {
        model: "NVIDIA RTX 4070",
        vramGB: 8
      },
      screen: {
        sizeInch: 15.6,
        resolution: "2560x1440",
        panel: "IPS",
        refreshHz: 165
      },
      weightKg: 2.4,
      batteryWh: 99,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "Thunderbolt 4", "HDMI", "Ethernet", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.2"
    }
  },
  {
    name: "Samsung Galaxy Book3 Pro",
    brand: "Samsung",
    price: 1299,
    description: "Premium laptop with AMOLED display and Samsung ecosystem integration",
    image: "https://example.com/samsung-galaxy-book3-pro.jpg",
    rating: 4.2,
    stock: 14,
    specs: {
      cpu: {
        model: "Intel Core i7-1360P",
        cores: 12,
        threads: 16,
        baseGHz: 2.2,
        boostGHz: 5.0
      },
      ramGB: 16,
      storage: {
        type: "NVMe",
        sizeGB: 512
      },
      gpu: {
        model: "Intel Iris Xe",
        vramGB: 0
      },
      screen: {
        sizeInch: 14,
        resolution: "2880x1800",
        panel: "AMOLED",
        refreshHz: 60
      },
      weightKg: 1.17,
      batteryWh: 63,
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "Thunderbolt 4", "MicroSD", "Headphone Jack"],
      wifi: "Wi-Fi 6E",
      bluetooth: "Bluetooth 5.1"
    }
  }
];

async function seedProducts() {
  try {
    // ==========================================
    // CHỌN NGUỒN DỮ LIỆU THEO THỨ TỰ ƯU TIÊN:
    // 1. File JSON (products-data.json)
    // 2. MongoDB hiện tại
    // 3. Hardcoded default data
    // ==========================================
    
    // Bước 1: Load products từ file JSON nếu có
    let productsToSeed = await loadProductsFromJSON();
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Bước 2: Nếu không có file JSON, thử lấy từ MongoDB (nếu có data)
    if (productsToSeed.length === 0) {
      const existingProducts = await Product.find({}).lean();
      if (existingProducts.length > 0) {
        console.log(`✓ Found ${existingProducts.length} products in MongoDB, will use them to re-seed`);
        // Loại bỏ các field MongoDB internal để có thể insert lại
        productsToSeed = existingProducts.map(p => {
          const { _id, __v, createdAt, updatedAt, ...product } = p;
          return product;
        });
      }
    }
    
    // Bước 3: Nếu vẫn không có, dùng default hardcoded data
    if (productsToSeed.length === 0) {
      console.log("⚠️  No products found, using default hardcoded data");
      productsToSeed = defaultProducts;
    }

    // Lưu ý: Script này sẽ XÓA TẤT CẢ products cũ và seed lại từ đầu
    // Để backup data, chạy "npm run export:products" trước
    await Product.deleteMany({});
    console.log("✓ Cleared existing products");

    // Debug: Check sample products array
    console.log(`DEBUG: Products to seed count: ${productsToSeed.length}`);
    if (productsToSeed.length > 0) {
      console.log(`DEBUG: First product name: ${productsToSeed[0].name}`);
    }

    // Insert sample products (với validation disabled tạm thời)
    // Sẽ update images và description ở bước seed:images
    const insertedProducts = await Product.insertMany(productsToSeed, { 
      ordered: false,
      rawResult: true 
    }).catch(async (err) => {
      // Nếu validation fail, insert từng product với validation disabled
      console.log("Validation failed, inserting with validation disabled...");
      console.log("Error:", err.message);
      const products = [];
      for (const product of productsToSeed) {
        try {
          const doc = new Product(product);
          const saved = await doc.save({ validateBeforeSave: false });
          products.push(saved);
        } catch (e) {
          console.error(`Failed to insert ${product.name}:`, e.message);
        }
      }
      console.log(`DEBUG: Manually inserted ${products.length} products`);
      return products;
    });
    
    console.log("DEBUG: insertedProducts type:", typeof insertedProducts);
    console.log("DEBUG: insertedProducts:", JSON.stringify(insertedProducts).substring(0, 200));
    
    const count = insertedProducts.insertedCount || insertedProducts.length || 0;
    console.log(`Seeded ${count} products`);

    // Create indexes
    await Product.collection.createIndex({ brand: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ name: "text", description: "text" });
    console.log("Created indexes");

    console.log("✓ Product seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  }
}

// Run seeding if this file is executed directly
seedProducts();
