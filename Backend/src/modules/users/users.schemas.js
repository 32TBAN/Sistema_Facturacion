import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
