import React, { useEffect, useState } from "react";
import axiosInstance from "../axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get("/products/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data.cart);
      } catch (error) {
        alert(
          error.response?.data?.message || "Failed to fetch cart. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token]);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Your Cart</h2>
        <button className="cart-btn" onClick={() => navigate("/user")}>Back to Dashboard</button>
      </nav>
      {loading ? (
        <p>Loading cart...</p>
      ) : cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="product-grid">
          {cart.map((item) => (
            <div className="product-card" key={item.product._id}>
              <img src={item.product.image} alt={item.product.title} />
              <div className="product-info">
                <h3>{item.product.title}</h3>
                <p>{item.product.description}</p>
                <div className="product-meta">
                  <span>₹{item.product.price}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart; 