import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.number().int().positive(),
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
