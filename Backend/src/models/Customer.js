import { Schema, model } from "mongoose";

const customer = new Schema(
  {
    _id: { type: String, require: true, unique: true, trim: true },
    name: String,
    email: String,
    country: String
  },
  {
    versionKey: false,
  }
);

export default model("Customer", customer);
