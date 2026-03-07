import { z } from "zod";

export const createInvoiceSchema = z.object({
  customerId: z.number().int().positive(),
  issueDate: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["DRAFT", "PAID", "CANCELLED"]),
});
