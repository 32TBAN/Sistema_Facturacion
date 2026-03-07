import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { validate } from "../../middlewares/validate";
import { HttpError } from "../../utils/httpError";
import { createUserSchema, updateUserSchema } from "./users.schemas";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: "asc" },
    });
    res.json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        role: user.role.name,
      }))
    );
  })
);

router.get(
  "/roles",
  asyncHandler(async (_req, res) => {
    const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });
    res.json(roles);
  })
);

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, roleId, isActive = true } = req.body;
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new HttpError(400, "Invalid role");
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, roleId, isActive },
      include: { role: true },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role.name,
    });
  })
);

router.put(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const payload = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (payload.roleId) {
      const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
      if (!role) {
        throw new HttpError(400, "Invalid role");
      }
    }

    const data = { ...payload };
    if (payload.password) {
      data.passwordHash = await bcrypt.hash(payload.password, 10);
      delete data.password;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      isActive: updated.isActive,
      role: updated.role.name,
    });
  })
);

export default router;
