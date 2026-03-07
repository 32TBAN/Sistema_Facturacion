import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validate } from "../../middlewares/validate";
import { HttpError } from "../../utils/httpError";
import { createCategorySchema, updateCategorySchema } from "./categories.schemas";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
    res.json(categories);
  })
);

router.post(
  "/",
  requireRole("admin", "empleado"),
  validate(createCategorySchema),
  asyncHandler(async (req, res) => {
    const exists = await prisma.category.findUnique({ where: { name: req.body.name } });
    if (exists) {
      throw new HttpError(409, "Category already exists");
    }
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  })
);

router.put(
  "/:id",
  requireRole("admin", "empleado"),
  validate(updateCategorySchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) {
      throw new HttpError(404, "Category not found");
    }
    const category = await prisma.category.update({ where: { id }, data: req.body });
    res.json(category);
  })
);

export default router;
