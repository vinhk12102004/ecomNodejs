import { z } from "zod";

const specsSchema = z.object({
  cpu: z.object({
    model: z.string().min(1),
    cores: z.number().int().positive(),
    threads: z.number().int().positive(),
    baseGHz: z.number().positive(),
    boostGHz: z.number().positive()
  }),
  ramGB: z.number().int().positive(),
  storage: z.object({
    type: z.enum(["NVMe", "SSD", "HDD"]),
    sizeGB: z.number().int().positive()
  }),
  gpu: z.object({
    model: z.string().min(1),
    vramGB: z.number().int().min(0)
  }),
  screen: z.object({
    sizeInch: z.number().positive(),
    resolution: z.string().min(1),
    panel: z.string().min(1),
    refreshHz: z.number().int().positive()
  }),
  weightKg: z.number().positive(),
  batteryWh: z.number().positive(),
  os: z.string().min(1),
  ports: z.array(z.string()).optional(),
  wifi: z.string().min(1),
  bluetooth: z.string().min(1)
});

export const CreateProductSchema = z.object({
  name: z.string().min(1).trim(),
  brand: z.enum(["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Razer", "LG", "Microsoft", "Gigabyte", "Samsung", "Other"]),
  category: z.enum(["Gaming", "Business", "Ultrabook", "Workstation", "2-in-1", "Chromebook", "Other"]).optional().default("Other"),
  tags: z.array(z.string()).optional().default([]),
  price: z.number().min(0),
  description: z.string().optional().default(""),
  image: z.string().url().optional().default(""),
  stock: z.number().int().min(0).optional().default(0),
  specs: specsSchema
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).trim().optional(),
  brand: z.enum(["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Razer", "LG", "Microsoft", "Gigabyte", "Samsung", "Other"]).optional(),
  category: z.enum(["Gaming", "Business", "Ultrabook", "Workstation", "2-in-1", "Chromebook", "Other"]).optional(),
  tags: z.array(z.string()).optional(),
  price: z.number().min(0).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  stock: z.number().int().min(0).optional(),
  specs: specsSchema.partial().optional()
}).refine(data => {
  // Không cho phép cập nhật các trường hệ thống
  const forbiddenFields = ['_id', 'createdAt', 'updatedAt'];
  return !Object.keys(data).some(key => forbiddenFields.includes(key));
}, {
  message: "Cannot update system fields: _id, createdAt, updatedAt"
});

export const ListQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).pipe(z.number().int().min(1)).optional().default("1"),
  limit: z.string().transform(val => parseInt(val) || 12).pipe(z.number().int().min(1).max(100)).optional().default("12"),
  q: z.string().optional(),
  // Support both string "MSI,Asus" and array ["MSI", "Asus"]
  brand: z.union([
    z.string().transform(val => val ? val.split(',').map(b => b.trim()) : undefined),
    z.array(z.string())
  ]).optional(),
  category: z.union([
    z.string().transform(val => val ? val.split(',').map(c => c.trim()) : undefined),
    z.array(z.string())
  ]).optional(),
  tags: z.union([
    z.string().transform(val => val ? val.split(',').map(t => t.trim().toLowerCase()) : undefined),
    z.array(z.string())
  ]).optional(),
  minPrice: z.string().transform(val => parseFloat(val) || undefined).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val) || undefined).pipe(z.number().min(0)).optional(),
  minRamGB: z.string().transform(val => parseInt(val) || undefined).pipe(z.number().int().min(1)).optional(),
  ratingGte: z.string().transform(val => parseFloat(val) || undefined).pipe(z.number().min(0).max(5)).optional(),
  sort: z.string().optional().default("-createdAt")
});
