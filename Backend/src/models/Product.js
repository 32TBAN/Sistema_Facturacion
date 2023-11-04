import { Schema, model } from "mongoose";

const product = new Schema(
  {
    productID: { type: String, require: true, unique: true, trim: true },
    name: String,
    categoryID: Number,
    quantityPerUnit: String,
    unitPrice: Number,
    unitStock: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Product", product);
