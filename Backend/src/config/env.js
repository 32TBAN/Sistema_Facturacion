import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-demo",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-demo",
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  taxRate: Number(process.env.TAX_RATE || 0.15),
};
