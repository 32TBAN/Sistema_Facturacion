import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();
const CRITICAL_STOCK_THRESHOLD = 5;

function toMoneyNumber(value) {
  return Number(value || 0);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function getRangeDates(range) {
  const now = new Date();
  const todayStart = startOfDay(now);

  if (range === "today") {
    return { from: todayStart, to: endOfDay(now), label: "Hoy", days: 1 };
  }

  if (range === "30d") {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    return { from, to: endOfDay(now), label: "Ultimos 30 dias", days: 30 };
  }

  if (range === "month") {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    return { from, to: endOfDay(now), label: "Este mes", days: now.getDate() };
  }

  const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  return { from, to: endOfDay(now), label: "Ultimos 7 dias", days: 7 };
}

function formatDay(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRangeDays(from, to) {
  const days = [];
  const current = startOfDay(from);
  const last = startOfDay(to);
  while (current <= last) {
    days.push(formatDay(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

router.use(requireAuth);

router.get(
  "/summary",
  requireRole("admin", "empleado"),
  asyncHandler(async (req, res) => {
    const inputRange = String(req.query.range || "7d");
    const { from, to, label, days } = getRangeDates(inputRange);

    const invoiceWhere = { issueDate: { gte: from, lte: to } };
    const settledInvoiceWhere = { ...invoiceWhere, status: { not: "CANCELLED" } };

    const [settledInvoices, invoiceStatusRows, criticalStockRows, topItemRows, movements, recentInvoices, recentMovements] =
      await Promise.all([
        prisma.invoice.findMany({
          where: settledInvoiceWhere,
          select: { id: true, total: true, issueDate: true },
        }),
        prisma.invoice.groupBy({
          by: ["status"],
          where: invoiceWhere,
          _count: { _all: true },
        }),
        prisma.product.findMany({
          where: { isActive: true, stock: { lte: CRITICAL_STOCK_THRESHOLD } },
          orderBy: { stock: "asc" },
          take: 8,
          select: { id: true, sku: true, name: true, stock: true },
        }),
        prisma.invoiceItem.groupBy({
          by: ["productId"],
          where: { invoice: { is: settledInvoiceWhere } },
          _sum: { quantity: true, total: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 6,
        }),
        prisma.inventoryMovement.findMany({
          where: { createdAt: { gte: from, lte: to } },
          select: { type: true, quantity: true },
        }),
        prisma.invoice.findMany({
          where: settledInvoiceWhere,
          orderBy: { issueDate: "desc" },
          take: 5,
          select: {
            id: true,
            invoiceNumber: true,
            issueDate: true,
            total: true,
            customer: { select: { fullName: true, businessName: true, identification: true } },
          },
        }),
        prisma.inventoryMovement.findMany({
          where: { createdAt: { gte: from, lte: to } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            type: true,
            quantity: true,
            reason: true,
            reference: true,
            product: { select: { sku: true, name: true } },
            user: { select: { name: true, email: true } },
          },
        }),
      ]);

    const salesTotal = settledInvoices.reduce((sum, row) => sum + toMoneyNumber(row.total), 0);
    const invoiceCount = settledInvoices.length;
    const averageTicket = invoiceCount > 0 ? salesTotal / invoiceCount : 0;

    const daysInRange = getRangeDays(from, to);
    const totalsByDay = new Map(daysInRange.map((day) => [day, 0]));
    for (const invoice of settledInvoices) {
      const key = formatDay(new Date(invoice.issueDate));
      const current = totalsByDay.get(key) || 0;
      totalsByDay.set(key, current + toMoneyNumber(invoice.total));
    }
    const salesByDay = daysInRange.map((day) => ({
      day,
      total: Number((totalsByDay.get(day) || 0).toFixed(2)),
    }));

    const invoiceStatusMap = new Map(invoiceStatusRows.map((row) => [row.status, row._count._all]));
    const invoiceStatus = ["DRAFT", "PAID", "CANCELLED"].map((status) => ({
      status,
      count: invoiceStatusMap.get(status) || 0,
    }));

    const inventoryByTypeMap = new Map([
      ["IN", 0],
      ["OUT", 0],
      ["ADJUSTMENT", 0],
    ]);
    for (const movement of movements) {
      const current = inventoryByTypeMap.get(movement.type) || 0;
      inventoryByTypeMap.set(movement.type, current + movement.quantity);
    }
    const inventoryByType = [
      { type: "IN", quantity: inventoryByTypeMap.get("IN") || 0 },
      { type: "OUT", quantity: inventoryByTypeMap.get("OUT") || 0 },
      { type: "ADJUSTMENT", quantity: inventoryByTypeMap.get("ADJUSTMENT") || 0 },
    ];

    const topProductIds = topItemRows.map((row) => row.productId);
    const topProductsDetails = topProductIds.length
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, sku: true, name: true },
        })
      : [];
    const topProductsMap = new Map(topProductsDetails.map((product) => [product.id, product]));
    const topProducts = topItemRows.map((row) => {
      const product = topProductsMap.get(row.productId);
      return {
        productId: row.productId,
        sku: product?.sku || "-",
        name: product?.name || `Producto ${row.productId}`,
        quantity: row._sum.quantity || 0,
        total: toMoneyNumber(row._sum.total),
      };
    });

    res.json({
      range: inputRange,
      rangeMeta: { label, from: from.toISOString(), to: to.toISOString(), days },
      kpis: {
        salesTotal: Number(salesTotal.toFixed(2)),
        invoiceCount,
        averageTicket: Number(averageTicket.toFixed(2)),
        criticalStockCount: criticalStockRows.length,
      },
      salesByDay,
      invoiceStatus,
      inventoryByType,
      topProducts,
      criticalStock: criticalStockRows,
      recentInvoices: recentInvoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        total: toMoneyNumber(invoice.total),
        customer: invoice.customer.fullName || invoice.customer.businessName || invoice.customer.identification,
      })),
      recentMovements: recentMovements.map((movement) => ({
        id: movement.id,
        createdAt: movement.createdAt,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        productSku: movement.product?.sku || "-",
        productName: movement.product?.name || "-",
        user: movement.user?.name || movement.user?.email || "-",
      })),
    });
  })
);

export default router;
