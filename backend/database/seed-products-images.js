import mongoose from "mongoose";
import Product from "../src/models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

// Laptop image URLs from Unsplash (curated collection for laptops)
const laptopImagePool = [
  // MacBook images
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  
  // Gaming laptops
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
  "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
  "https://images.unsplash.com/photo-1616429762848-629be3eccdae?w=800",
  
  // Business laptops
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
  
  // Generic laptop images
  "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
];

// Extended descriptions templates by category
const descriptionTemplates = {
  apple: (product) => 
    `${product.description || ''}\n\nThis Apple laptop features the cutting-edge ${product.specs.cpu.model} chip, delivering exceptional performance for both professional and creative workloads. With ${product.specs.ramGB}GB of unified memory and ${product.specs.storage.sizeGB}GB of ultra-fast ${product.specs.storage.type} storage, multitasking is seamless. The stunning ${product.specs.screen.sizeInch}-inch ${product.specs.screen.panel} display with ${product.specs.screen.resolution} resolution brings your content to life. Weighing just ${product.specs.weightKg}kg, it's incredibly portable. Battery life is exceptional with ${product.specs.batteryWh}Wh capacity, perfect for all-day productivity. Includes ${product.specs.ports.join(', ')} ports for connectivity.`,
  
  gaming: (product) => 
    `${product.description || ''}\n\nBuilt for serious gamers and content creators, this powerhouse laptop packs the ${product.specs.cpu.model} processor with ${product.specs.cpu.cores} cores and ${product.specs.cpu.threads} threads. The ${product.specs.gpu.model} GPU with ${product.specs.gpu.vramGB}GB VRAM delivers stunning graphics and smooth gameplay at high settings. Equipped with ${product.specs.ramGB}GB RAM and ${product.specs.storage.sizeGB}GB ${product.specs.storage.type} storage for fast load times. The ${product.specs.screen.sizeInch}-inch ${product.specs.screen.panel} display features ${product.specs.screen.refreshHz}Hz refresh rate for buttery-smooth visuals. Advanced cooling system keeps performance consistent during intensive gaming sessions. Connectivity includes ${product.specs.ports.join(', ')}.`,
  
  business: (product) => 
    `${product.description || ''}\n\nDesigned for professionals who demand reliability and performance, this business laptop features the ${product.specs.cpu.model} processor, ensuring smooth multitasking and fast application performance. With ${product.specs.ramGB}GB RAM and ${product.specs.storage.sizeGB}GB ${product.specs.storage.type} storage, you have ample space for all your work files and applications. The ${product.specs.screen.sizeInch}-inch ${product.specs.screen.panel} display with ${product.specs.screen.resolution} resolution provides crisp visuals for extended work sessions. Weighing ${product.specs.weightKg}kg, it's portable enough for daily commutes. Enterprise-grade security features and ${product.specs.batteryWh}Wh battery for all-day productivity. Comprehensive connectivity with ${product.specs.ports.join(', ')}.`,
  
  ultrabook: (product) => 
    `${product.description || ''}\n\nThis premium ultrabook combines sleek design with powerful performance. Powered by the ${product.specs.cpu.model} processor with ${product.specs.cpu.cores} cores, it handles everyday tasks with ease. ${product.specs.ramGB}GB RAM ensures smooth multitasking, while ${product.specs.storage.sizeGB}GB ${product.specs.storage.type} storage provides fast boot and load times. The gorgeous ${product.specs.screen.sizeInch}-inch ${product.specs.screen.panel} display with ${product.specs.screen.resolution} resolution delivers stunning visuals. At just ${product.specs.weightKg}kg, it's incredibly portable without sacrificing performance. ${product.specs.batteryWh}Wh battery provides excellent battery life for mobile productivity. Features modern connectivity options including ${product.specs.ports.join(', ')}.`,
  
  budget: (product) => 
    `${product.description || ''}\n\nAn excellent value laptop for everyday computing needs. Powered by the ${product.specs.cpu.model} processor, it handles web browsing, document editing, and media consumption with ease. ${product.specs.ramGB}GB RAM ensures smooth operation of essential applications, while ${product.specs.storage.sizeGB}GB ${product.specs.storage.type} storage provides ample space for your files. The ${product.specs.screen.sizeInch}-inch ${product.specs.screen.panel} display with ${product.specs.screen.resolution} resolution delivers clear visuals for work and entertainment. Weighing ${product.specs.weightKg}kg, it's portable enough for students and home users. Includes ${product.specs.batteryWh}Wh battery and essential connectivity ports: ${product.specs.ports.join(', ')}.`,
};

function determineCategory(product) {
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const price = product.price;
  
  if (brand === 'apple') return 'apple';
  if (name.includes('gaming') || name.includes('rog') || name.includes('legion') || name.includes('stealth') || name.includes('blade') || name.includes('aorus')) return 'gaming';
  if (name.includes('thinkpad') || name.includes('spectre') || name.includes('gram')) return 'business';
  if (price < 800) return 'budget';
  return 'ultrabook';
}

function generateImages(index) {
  // Generate 3-5 images per product, cycling through the image pool
  const numImages = 3 + (index % 3); // 3, 4, or 5 images
  const startIdx = (index * 3) % laptopImagePool.length;
  const images = [];
  
  for (let i = 0; i < numImages; i++) {
    const imgIdx = (startIdx + i) % laptopImagePool.length;
    images.push(laptopImagePool[imgIdx]);
  }
  
  return images;
}

function generateDescription(product, category) {
  const template = descriptionTemplates[category];
  const fullDescription = template(product);
  
  // Ensure minimum 200 characters
  if (fullDescription.length < 200) {
    return fullDescription + " This laptop represents excellent value in its category and is backed by manufacturer warranty and support.";
  }
  
  return fullDescription;
}

async function seedProductImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Get all existing products
    const products = await Product.find({});
    console.log(`✓ Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log("⚠️  No products found. Please run 'npm run seed:products' first.");
      return;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // Check if product already has 3+ images
        if (product.images && product.images.length >= 3) {
          console.log(`  [${i + 1}/${products.length}] ⊘ Skipped: ${product.name} (already has ${product.images.length} images)`);
          skipped++;
          continue;
        }

        // Determine category for description template
        const category = determineCategory(product);
        
        // Generate images and description
        const images = generateImages(i);
        const description = generateDescription(product, category);

        // Update product
        await Product.findByIdAndUpdate(
          product._id,
          {
            images: images,
            description: description
          },
          { 
            new: true, 
            runValidators: false // Disable validators temporarily as we're updating in bulk
          }
        );

        console.log(`  [${i + 1}/${products.length}] ✓ Updated: ${product.name} (${images.length} images, ${description.length} chars)`);
        updated++;
      } catch (error) {
        console.error(`  [${i + 1}/${products.length}] ✗ Error updating ${product.name}:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED SUMMARY");
    console.log("=".repeat(60));
    console.log(`✓ Updated:  ${updated} products`);
    console.log(`⊘ Skipped:  ${skipped} products (already have images)`);
    console.log(`✗ Errors:   ${errors} products`);
    console.log(`📝 Total:    ${products.length} products processed`);
    console.log("=".repeat(60));
    
    if (updated > 0) {
      console.log("\n✨ Product images seeding completed successfully!");
      console.log("💡 Next step: Restart your frontend to see the gallery in action.");
    }
  } catch (error) {
    console.error("❌ Error seeding product images:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Disconnected from MongoDB");
  }
}

// Run seeding if this file is executed directly
seedProductImages();

export default seedProductImages;

