import { model, Schema } from "mongoose";

const productschema = new Schema({
  title: { type: String, required: [true, "Title is required"], minlength: 2 },
  description: { type: String, required: [true, "Description is required"], minlength: 5 },
  image: { type: String, required: [true, "Image URL is required"] },
  price: { type: Number, required: [true, "Price is required"], min: [0, "Price must be positive"] },
  quantity: { type: Number, required: [true, "Quantity is required"], min: [1, "Quantity must be at least 1"] }
});

const productmodel = model("products", productschema);

export default productmodel;