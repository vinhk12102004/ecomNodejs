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
    enum: [
      "Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", 
      "Razer", "LG", "Microsoft", "Gigabyte", "Samsung", "Other"
    ],
    index: true
  },

  // ✅ NEW FIELD: Category
  category: {
    type: String,
    required: false,
    trim: true,
    enum: [
      "Laptop", "Desktop", "Monitor", "Accessory", "Tablet", "Smartphone",
      "Peripheral", "Gaming", "Office", "Other"
    ],
    default: "Laptop",
    index: true
  },

  // ✅ NEW FIELD: Tags
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every(tag => typeof tag === "string" && tag.trim().length > 0);
      },
      message: "All tags must be non-empty strings"
    }
  },

  price: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },

  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [200, 'Description must be at least 200 characters (~5 lines)'],
    trim: true
  },

  images: {
    type: [String],
    required: [true, 'Product images are required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length >= 3;
      },
      message: 'Product must have at least 3 images'
    }
  },

  image: {
    type: String,
    default: "",
    // @deprecated - Use 'images' array instead. Kept for backward compatibility.
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

}, { timestamps: true });

// ✅ Text index for search
productSchema.index({ name: "text", description: "text", tags: "text", category: "text" });

// ✅ Pre-validate middleware
productSchema.pre('validate', function(next) {
  if (this.name) this.name = this.name.trim();

  if (this.brand) {
    this.brand = this.brand.charAt(0).toUpperCase() + this.brand.slice(1).toLowerCase();
  }

  // Default category nếu rỗng
  if (!this.category) this.category = "Laptop";

  // Validate images array
  if (this.images && this.images.length > 0 && this.images.length < 3) {
    return next(new Error('Product must have at least 3 images'));
  }

  // Validate description length
  if (this.description && this.description.trim().length < 200) {
    return next(new Error('Description must be at least 200 characters (~5 lines)'));
  }

  next();
});

const Product = mongoose.model("Product", productSchema, "products");

export default Product;
