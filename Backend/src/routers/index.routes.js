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

router.put("/productUpdate/:productID", async (req, res) => {
  try {
    const productNew = req.body;
    const productID = req.params.productID;

    const filter = { productID: productID };
    const options = { new: true };

    const resNew = await Product.findOneAndUpdate(filter, productNew, options);

    if (!resNew) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json('Producto actualizado');
  } catch (error) {
    console.log(error);
  }
});

export default router;
