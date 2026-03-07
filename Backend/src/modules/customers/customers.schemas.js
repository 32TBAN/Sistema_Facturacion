import { z } from "zod";

const base = {
  fullName: z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
  identification: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(3).optional(),
  address: z.string().min(3).optional(),
};

export const createCustomerSchema = z
  .object(base)
  .superRefine((data, ctx) => {
    if (!data.fullName && !data.businessName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullName"],
        message: "fullName o businessName es obligatorio",
      });
    }
  });

export const updateCustomerSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    businessName: z.string().min(1).optional(),
    identification: z.string().min(5).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(3).optional(),
    address: z.string().min(3).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update",
  });
