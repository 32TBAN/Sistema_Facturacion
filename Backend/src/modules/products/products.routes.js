import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validate } from "../../middlewares/validate";
import { HttpError } from "../../utils/httpError";
import { createProductSchema, updateProductSchema } from "./products.schemas";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: "desc" },
    });
    res.json(products);
  })
);

router.get(
  "/:id",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    res.json(product);
  })
);

router.post(
  "/",
  requireRole("admin", "empleado"),
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const { categoryId, sku } = req.body;
    const [category, skuExists] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.product.findUnique({ where: { sku } }),
    ]);

    if (!category) {
      throw new HttpError(400, "Invalid category");
    }
    if (skuExists) {
      throw new HttpError(409, "SKU already exists");
    }

    const product = await prisma.product.create({
      data: req.body,
      include: { category: true },
    });
    res.status(201).json(product);
  })
);

router.put(
  "/:id",
  requireRole("admin", "empleado"),
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      throw new HttpError(404, "Product not found");
    }

    if (req.body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: req.body.categoryId },
      });
      if (!category) {
        throw new HttpError(400, "Invalid category");
      }
    }

    if (req.body.sku && req.body.sku !== current.sku) {
      const exists = await prisma.product.findUnique({
        where: { sku: req.body.sku },
      });
      if (exists) {
        throw new HttpError(409, "SKU already exists");
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: req.body,
      include: { category: true },
    });
    res.json(updated);
  })
);

export default router;
