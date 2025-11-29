import mongoose from "mongoose";

const attributesSchema = new mongoose.Schema({
  ramGB: {
    type: Number,
    min: 4
  },
  storageGB: {
    type: Number,
    min: 128
  },
  color: {
    type: String,
    trim: true
  }
}, { _id: false });

const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
    // Example: "16GB / 512GB / Silver"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  attributes: {
    type: attributesSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient filtering
productVariantSchema.index({
  product: 1,
  'attributes.ramGB': 1,
  'attributes.storageGB': 1,
  'attributes.color': 1
});

// Index for sku lookups
productVariantSchema.index({ sku: 1 });

// Validate that variant belongs to an active product
productVariantSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (!product) {
      return next(new Error('Product not found'));
    }
    
    if (!product.isActive) {
      return next(new Error('Cannot create variant for inactive product'));
    }
  }
  next();
});

// Auto-generate SKU if not provided (backup)
productVariantSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }
  next();
});

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema, "product_variants");

export default ProductVariant;

