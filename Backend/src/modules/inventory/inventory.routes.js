import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validate } from "../../middlewares/validate";
import { HttpError } from "../../utils/httpError";
import { createMovementSchema } from "./inventory.schemas";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (_req, res) => {
    const movements = await prisma.inventoryMovement.findMany({
      include: { product: true, user: true, invoice: true },
      orderBy: { id: "desc" },
    });
    res.json(movements);
  })
);

router.post(
  "/",
  requireRole("admin", "empleado"),
  validate(createMovementSchema),
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { productId, type, quantity, reference, reason, invoiceId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new HttpError(404, "Product not found");
      }

      let newStock = product.stock;
      if (type === "IN") {
        newStock += quantity;
      } else if (type === "OUT") {
        if (product.stock < quantity) {
          throw new HttpError(400, "Insufficient stock");
        }
        newStock -= quantity;
      } else {
        newStock = quantity;
      }

      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });

      return tx.inventoryMovement.create({
        data: {
          productId,
          userId,
          type,
          quantity,
          reference: reference || null,
          reason: reason || null,
          invoiceId: invoiceId || null,
        },
      });
    });

    res.status(201).json(result);
  })
);

export default router;
