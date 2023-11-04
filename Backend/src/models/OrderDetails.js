import { Schema, model } from "mongoose";

const orderDetails = new Schema(
  {
    orderID: Number,
    productID: String,
    unitPrice: Number,
    quantity: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("OrderDetails", orderDetails);