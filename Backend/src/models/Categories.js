import { Schema, model } from "mongoose";

const category = new Schema(
  {
    productID: { type: Number, require: true, unique: true },
    name: String,
    description: String,
  },
  {
    versionKey: false,
  }
);

export default model("Category", category);
