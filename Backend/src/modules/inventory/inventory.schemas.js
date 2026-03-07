import { z } from "zod";

export const createMovementSchema = z
  .object({
    productId: z.number().int().positive(),
    type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
    quantity: z.number().int().positive(),
    reference: z.string().optional(),
    reason: z.string().optional(),
    invoiceId: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ADJUSTMENT" && !data.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "reason is required for ADJUSTMENT",
      });
    }
  });
