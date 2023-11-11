import { Schema, model } from "mongoose";

const order = new Schema(
  {
    orderID: Number,
    customerID: String,
    cerrada: Boolean
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Order", order);
