import { model, Schema, Types } from "mongoose";

const orderSchema = new Schema({
  user: { type: Types.ObjectId, ref: "Users", required: true },
  products: [
    {
      product: { type: Types.ObjectId, ref: "products", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "finalized", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ordermodel = model("orders", orderSchema);

export default ordermodel; 