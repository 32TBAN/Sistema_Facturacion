import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { expiresInToDate } from "../../utils/time";
import { env } from "../../config/env";
import { loginSchema, refreshSchema } from "./auth.schemas";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresInToDate(env.refreshExpiresIn),
      },
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  })
);

router.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (_error) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new HttpError(401, "Refresh token expired or revoked");
    }

    if (stored.userId !== Number(payload.sub)) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const newAccessToken = signAccessToken(stored.user);
    const newRefreshToken = signRefreshToken(stored.user);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: stored.id } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: stored.userId,
          expiresAt: expiresInToDate(env.refreshExpiresIn),
        },
      }),
    ]);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  })
);

router.post(
  "/logout",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ message: "Session closed" });
  })
);

export default router;
