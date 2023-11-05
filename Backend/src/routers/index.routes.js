import { Router } from "express";
import Product from "../models/Product";
import Category from "../models/Categories";
import Order from "../models/Order";
import Customer from "../models/Customer";
import OrderDetails from '../models/OrderDetails'

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

router.get("/customer/add", async (req, res) => {
  Customer.create({
    _id: "01",
    name: "Admin",
    email: "Admin",
    country: "Ecuador",
  });
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

    res.json("Producto actualizado");
  } catch (error) {
    console.log(error);
  }
});

router.post("/openOrder", async (req, res) => {
  try {
    Order.create(req.body);
    res.send("saved");
  } catch (error) {
    console.log(error);
  }
});

router.get("/orderSearchBycustomerID/:customerID", async (req, res) => {
  try {
    const customerID = req.params.customerID;

    const filter = { customerID: customerID };

    const resNew = await Order.findOne(filter);

    if (!resNew) {
      return res.json(null);
    }

    res.json(resNew);
  } catch (error) {
    res.json(error);
  }
});

router.post("/orderDetails", async (req, res) => {
  try {
    OrderDetails.create(req.body);
    res.send("saved");
  } catch (error) {
    console.log(error);
  }
});

export default router;
