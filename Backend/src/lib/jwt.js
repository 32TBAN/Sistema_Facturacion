import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role.name, email: user.email },
    env.accessSecret,
    { expiresIn: env.accessExpiresIn }
  );

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id }, env.refreshSecret, {
    expiresIn: env.refreshExpiresIn,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.accessSecret);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.refreshSecret);
