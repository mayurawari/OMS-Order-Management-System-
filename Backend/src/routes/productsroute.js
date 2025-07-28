import { Router } from "express";
import role from "../middlewares/role.js";
import productmodel from "../models/productmodel.js";
import ordermodel from "../models/ordermodel.js";
import Authenticate from "../middlewares/auth.js";
import mongoose from "mongoose";
import usermodel from "../models/usermodel.js";

const productroute = Router();

// Get all products
productroute.get("/getproducts",Authenticate, role(["user", "admin"]), async (req, res) => {
  try {
    const products = await productmodel.find();
    return res.send({ message: "All products", Data: products });
  } catch (error) {
    return res.status(500).send({ message: "Error in getting products", error: error.message });
  }
});


// Create single product
productroute.post("/createproduct", Authenticate, role(["admin"]), async (req, res) => {

    const { title, description, image, price, quantity } = req.body;
    try {
      if (!title || !description || !image || !price || !quantity) {
        return res.status(400).send({ message: "Please add all the fields" });
      }

      const createproduct = await productmodel.create({
        title,
        description,
        image,
        price,
        quantity,
      });

      res.send({ message: "Product successfully added", product: createproduct });
    } catch (error) {
      res.status(500).send({ message: "Error in creating product", error: error.message });
    }
});

// Bulk product creation
productroute.post("/Blukproductcreation", Authenticate, role(["admin"]), async (req, res) => {
  const products = req.body.products;
  try {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).send({ message: "Please provide an array of products" });
    }
    for (const product of products) {
      const { title, description, image, price, quantity } = product;
      if (!title || !description || !image || !price || !quantity) {
        return res.status(400).send({
          message: "Each product must have all fields: title, description, image, price, quantity",
        });
      }
    }
    const createdProducts = await productmodel.insertMany(products);
    res.send({ message: "Products successfully added", products: createdProducts });
  } catch (error) {
    res.status(500).send({ message: "Error in bulk product creation", error: error.message });
  }
});

// Cart route (add to cart)
productroute.post("/cart", Authenticate, role(["user", "admin"]), async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).send({ message: "Product ID and quantity are required" });
    }
    const user = await usermodel.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });
    // Check if product already in cart
    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    await user.populate("cart.product");
    res.send({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).send({ message: "Cart error", error: error.message });
  }
});

// Get cart route
productroute.get("/cart", Authenticate, role(["user", "admin"]), async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await usermodel.findById(userId).populate("cart.product");
    if (!user) return res.status(404).send({ message: "User not found" });
    res.send({ message: "Cart fetched", cart: user.cart });
  } catch (error) {
    res.status(500).send({ message: "Cart fetch error", error: error.message });
  }
});

// Place Order
productroute.post("/order", Authenticate, role(["user"]), async (req, res) => {
  const userId = req.user._id;
  const { products, address, paymentMethod } = req.body;

  if (!Array.isArray(products) || products.length === 0 || !address || !paymentMethod) {
    return res.status(400).send({ message: "Missing required fields" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const item of products) {
      const prod = await productmodel.findById(item.product).session(session);
      if (!prod || prod.quantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).send({
          message: `Product unavailable or insufficient quantity for ${item.product}`,
        });
      }
      prod.quantity -= item.quantity;
      await prod.save({ session });
    }

    const order = await ordermodel.create(
      [{
        user: userId,
        products,
        status: "pending",
        address,
        paymentMethod,
        paymentStatus: paymentMethod === "ONLINE" ? "paid" : "pending"
      }],
      { session }
    );

    await session.commitTransaction();
    res.send({ message: "Order placed successfully", order: order[0] });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).send({ message: "Error placing order", error: error.message });
  } finally {
    session.endSession();
  }
});

// View user's orders
productroute.get("/orders", Authenticate, role(["user", "admin"]), async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await ordermodel.find({ user: userId }).populate("products.product");
    res.send({ message: "Orders fetched successfully", orders });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch orders", error: error.message });
  }
});

// Admin finalizes or cancels an order
productroute.post("/order/:orderId/finalize", Authenticate, role(["admin"]), async (req, res) => {
  const { orderId } = req.params;
  const { action } = req.body;

  if (!["finalize", "cancel"].includes(action)) {
    return res.status(400).send({ message: "Invalid action" });
  }

  try {
    const order = await ordermodel.findById(orderId);
    if (!order) return res.status(404).send({ message: "Order not found" });

    if (order.status !== "pending") {
      return res.status(400).send({ message: "Order already processed" });
    }

    if (action === "finalize") {
      order.status = "finalized";
    } else if (action === "cancel") {
      for (const item of order.products) {
        await productmodel.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
        });
      }
      order.status = "cancelled";
    }

    await order.save();
    res.send({ message: `Order ${action}d successfully`, order });
  } catch (error) {
    res.status(500).send({ message: "Error processing order", error: error.message });
  }
});

export default productroute;


// Mark order as paid manually
// productroute.post("/order/:orderId/pay", Authenticate, role(["user"]), async (req, res) => {
//   const { orderId } = req.params;
//   try {
//     const order = await ordermodel.findById(orderId);
//     if (!order) return res.status(404).send({ message: "Order not found" });

//     if (order.paymentStatus === "paid")
//       return res.status(400).send({ message: "Order already paid" });

//     order.paymentStatus = "paid";
//     await order.save();
//     res.send({ message: "Payment marked as complete", order });
//   } catch (error) {
//     res.status(500).send({ message: "Payment failed", error: error.message });
//   }
// });
