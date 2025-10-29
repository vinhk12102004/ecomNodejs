import mongoose from "mongoose";

const specsSchema = new mongoose.Schema({
  cpu: {
    model: { type: String, required: true },
    cores: { type: Number, required: true },
    threads: { type: Number, required: true },
    baseGHz: { type: Number, required: true },
    boostGHz: { type: Number, required: true }
  },
  ramGB: { type: Number, required: true },
  storage: {
    type: { type: String, required: true, enum: ["NVMe", "SSD", "HDD"] },
    sizeGB: { type: Number, required: true }
  },
  gpu: {
    model: { type: String, required: true },
    vramGB: { type: Number, required: true }
  },
  screen: {
    sizeInch: { type: Number, required: true },
    resolution: { type: String, required: true },
    panel: { type: String, required: true },
    refreshHz: { type: Number, required: true }
  },
  weightKg: { type: Number, required: true },
  batteryWh: { type: Number, required: true },
  os: { type: String, required: true },
  ports: [{ type: String }],
  wifi: { type: String, required: true },
  bluetooth: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    enum: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Razer", "LG", "Microsoft", "Gigabyte", "Samsung", "Other"],
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  maxPerOrder: {
    type: Number,
    default: null, // null = no limit
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  specs: {
    type: specsSchema,
    required: true
  }
}, {
  timestamps: true
});

// Text index for search
productSchema.index({ name: "text", description: "text" });

// Pre-validate middleware
productSchema.pre('validate', function(next) {
  // Trim name
  if (this.name) {
    this.name = this.name.trim();
  }
  
  // Capitalize brand
  if (this.brand) {
    this.brand = this.brand.charAt(0).toUpperCase() + this.brand.slice(1).toLowerCase();
  }
  
  next();
});

const Product = mongoose.model("Product", productSchema, "products");

export default Product;
