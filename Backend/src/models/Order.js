import { Schema, model } from "mongoose";

const order = new Schema(
  {
    orderID: Number,
    customerID: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Order", order);
