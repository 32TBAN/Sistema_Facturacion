import { Router } from "express";
import Product from "../models/Product";
import Category from "../models/Categories";

const router = Router();

router.get("/", (req, res) => {
  res.send("backend");
});

router.get("/product/add", async (req, res) => {
  res.send("saved");
});

router.get("/category/add", async (req, res) => {
/*   Category.create({
    productID: 1,
    name: "Tecnologia",
    description: "Categoria de tecnologia",
  }); */
  res.send("saved");
});

router.get("/product", async (req, res) => {
  const product = await Product.find();
  res.json(product);
});

router.get("/categories", async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
  });

router.get("/product/delete", async (req, res) => {
  const product = await Product.find();
  res.json(product);
});

router.put("/product/update", async (req, res) => {
  const product = await Product.find();
  res.json(product);
});

export default router;
