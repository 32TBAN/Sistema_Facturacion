import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validate } from "../../middlewares/validate";
import { HttpError } from "../../utils/httpError";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customers.schemas";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (_req, res) => {
    const customers = await prisma.customer.findMany({ orderBy: { id: "desc" } });
    res.json(customers);
  })
);

router.get(
  "/:id",
  requireRole("admin", "empleado", "lector"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new HttpError(404, "Customer not found");
    }
    res.json(customer);
  })
);

router.post(
  "/",
  requireRole("admin", "empleado"),
  validate(createCustomerSchema),
  asyncHandler(async (req, res) => {
    const { identification } = req.body;
    const exists = await prisma.customer.findUnique({ where: { identification } });
    if (exists) {
      throw new HttpError(409, "Identification already exists");
    }
    const payload = {
      ...req.body,
      email: req.body.email || null,
    };
    const customer = await prisma.customer.create({ data: payload });
    res.status(201).json(customer);
  })
);

router.put(
  "/:id",
  requireRole("admin", "empleado"),
  validate(updateCustomerSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const payload = {
      ...req.body,
      email: req.body.email === "" ? null : req.body.email,
    };

    const current = await prisma.customer.findUnique({ where: { id } });
    if (!current) {
      throw new HttpError(404, "Customer not found");
    }

    if (payload.identification && payload.identification !== current.identification) {
      const exists = await prisma.customer.findUnique({
        where: { identification: payload.identification },
      });
      if (exists) {
        throw new HttpError(409, "Identification already exists");
      }
    }

    if (!payload.fullName && !payload.businessName && !current.fullName && !current.businessName) {
      throw new HttpError(400, "fullName o businessName es obligatorio");
    }

    const customer = await prisma.customer.update({ where: { id }, data: payload });
    res.json(customer);
  })
);

export default router;
