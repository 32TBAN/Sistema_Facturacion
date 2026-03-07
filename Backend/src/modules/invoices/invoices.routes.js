import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validate } from "../../middlewares/validate";
import { HttpError } from "../../utils/httpError";
import { roundMoney } from "../../utils/money";
import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
} from "./invoices.schemas";

const router = Router();

function buildInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `INV-${date}-${random}`;
}

router.use(requireAuth);

router.get(
  "/",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (_req, res) => {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        user: { include: { role: true } },
        items: { include: { product: true } },
      },
      orderBy: { id: "desc" },
    });
    res.json(invoices);
  })
);

router.get(
  "/:id",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { include: { role: true } },
        items: { include: { product: true } },
      },
    });
    if (!invoice) {
      throw new HttpError(404, "Invoice not found");
    }
    res.json(invoice);
  })
);

router.post(
  "/",
  requireRole("admin", "empleado"),
  validate(createInvoiceSchema),
  asyncHandler(async (req, res) => {
    const { customerId, items, issueDate } = req.body;
    const userId = req.auth.userId;

    const created = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new HttpError(400, "Invalid customer");
      }

      const productIds = [...new Set(items.map((item) => item.productId))];
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      if (products.length !== productIds.length) {
        throw new HttpError(400, "Some products are invalid");
      }

      const itemRows = items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product || !product.isActive) {
          throw new HttpError(400, `Product ${item.productId} is not available`);
        }
        if (product.stock < item.quantity) {
          throw new HttpError(400, `Insufficient stock for ${product.name}`);
        }

        const unitPrice = roundMoney(product.price);
        const subtotal = roundMoney(unitPrice * item.quantity);
        const tax = roundMoney(subtotal * env.taxRate);
        const total = roundMoney(subtotal + tax);

        return {
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          tax,
          total,
        };
      });

      const subtotal = roundMoney(
        itemRows.reduce((acc, row) => acc + row.subtotal, 0)
      );
      const tax = roundMoney(itemRows.reduce((acc, row) => acc + row.tax, 0));
      const total = roundMoney(subtotal + tax);

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: buildInvoiceNumber(),
          customerId,
          userId,
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          subtotal,
          tax,
          total,
          status: "DRAFT",
          items: {
            create: itemRows.map((row) => ({
              productId: row.productId,
              quantity: row.quantity,
              unitPrice: row.unitPrice,
              subtotal: row.subtotal,
              tax: row.tax,
              total: row.total,
            })),
          },
        },
        include: { items: true },
      });

      for (const row of itemRows) {
        await tx.product.update({
          where: { id: row.productId },
          data: { stock: { decrement: row.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: row.productId,
            userId,
            type: "OUT",
            quantity: row.quantity,
            reference: invoice.invoiceNumber,
            reason: "Invoice issue",
            invoiceId: invoice.id,
          },
        });
      }

      return tx.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          customer: true,
          user: { include: { role: true } },
          items: { include: { product: true } },
        },
      });
    });

    res.status(201).json(created);
  })
);

router.patch(
  "/:id/status",
  requireRole("admin", "empleado"),
  validate(updateInvoiceStatusSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new HttpError(404, "Invoice not found");
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: req.body.status },
    });
    res.json(updated);
  })
);

export default router;
