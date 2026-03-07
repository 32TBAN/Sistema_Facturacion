import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import customersRoutes from "../modules/customers/customers.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import productsRoutes from "../modules/products/products.routes";
import invoicesRoutes from "../modules/invoices/invoices.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/customers", customersRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use("/invoices", invoicesRoutes);
router.use("/inventory-movements", inventoryRoutes);

export default router;
