import { Schema, model } from "mongoose";

const orderDetails = new Schema(
  {
    _id: Number,
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