import { Router } from "express";
import Product from "../models/Product";
import Category from "../models/Categories";
import Order from "../models/Order";
import Customer from "../models/Customer";
import OrderDetails from "../models/OrderDetails";
const Chance = require('chance');
const chance = new Chance();

const router = Router();

router.get("/", (req, res) => {
  res.send("backend");
});

/* add */
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

  for (let index = 0; index < 100; index++) {
    Customer.create({
      _id: ""+index,
      name: chance.name(), // Genera un nombre aleatorio
      email: chance.email(), // Genera una dirección de correo electrónico aleatoria
      country: chance.country(), // Genera un país aleatorio
    });
  }

  res.send("saved");
});

router.post("/openOrder", async (req, res) => {
  try {
    Order.create(req.body);
    res.send("saved");
  } catch (error) {
    console.log(error);
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

/* listar */
router.get("/product", async (req, res) => {
  const product = await Product.find();
  res.json(product);
});

router.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.get("/customers", async (req, res) => {
  const customer = await Customer.find();
  res.json(customer);
});


/* actualizar */
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

router.put("/detailsUpdate/:productID/:orderID", async (req, res) => {
  try {
    const productNew = req.body;
    const orderID = req.params.orderID;
    const productID = req.params.productID;

    const filter = {
      orderID: orderID,
      productID: productID,
    };

    const options = { new: true };

    const resNew = await OrderDetails.findOneAndUpdate(
      filter,
      productNew,
      options
    );

    if (!resNew) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json("Detalle actualizado");
  } catch (error) {
    console.log(error);
  }
});
/* buscar */
router.get("/lastOrder", async (req, res) => {
  const order = await Order.find().sort({ createdAt: -1 }).limit(1);
  res.json(order);
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

router.get("/orderDetails/:orderID", async (req, res) => {
  try {
    const orderID = req.params.orderID;

    const filter = { orderID: orderID };

    const resNew = await OrderDetails.find(filter);

    if (!resNew) {
      return res.json(null);
    }

    res.json(resNew);
  } catch (error) {
    res.json(error);
  }
});

router.get("/product/:productID", async (req, res) => {
  try {
    const productID = req.params.productID;

    const filter = { productID: productID };

    const resNew = await Product.find(filter);

    if (!resNew) {
      return res.json(null);
    }

    res.json(resNew);
  } catch (error) {
    res.json(error);
  }
});

router.get("/searchProductDetail/:orderID/:productID", async (req, res) => {
  try {
    const orderID = req.params.orderID;
    const productID = req.params.productID;

    const filter = {
      orderID: orderID,
      productID: productID,
    };


    const resNew = await OrderDetails.findOne(
      filter
    );

    if (!resNew) {
      return res.json(null);
    }

    res.json(resNew);
  } catch (error) {
    console.log(error);
  }
});

router.get("/order/:orderID", async (req, res) => {
  try {
    const orderID = req.params.orderID;

    const filter = { orderID: orderID };

    const resNew = await Order.findOne(filter);

    if (!resNew) {
      return res.json(null);
    }

    res.json(resNew);
  } catch (error) {
    res.json(error);
  }
});

router.get("/customer/:customerID", async (req, res) => {
  try {
    const customerID = req.params.customerID;;

    const resNew = await Customer.findById(customerID);

    if (!resNew) {
      return res.json(null);
    }

    res.json(resNew);
  } catch (error) {
    res.json(error);
  }
});
/* 
eliminar */
router.delete("/orderDetailsDelete/:productID", async (req, res) => {
  try {
    const productID = req.params.productID;

    const filter = { productID: productID };

    // Utiliza el método findOneAndDelete para eliminar un producto
    const result = await OrderDetails.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el producto", error: error });
  }
});

router.delete("/orderDelete/:orderID", async (req, res) => {
  try {
    const orderID = req.params.orderID;

    const filter = { orderID: orderID };

    // Utiliza el método findOneAndDelete para eliminar un producto
    const result = await Order.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el producto", error: error });
  }
});

router.delete("/deleteProduct/:name", async (req, res) => {
  try {
    const name = req.params.name;

    const filter = { name: name };

    // Utiliza el método findOneAndDelete para eliminar un producto
    const result = await Product.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el producto", error: error });
  }
});
export default router;
