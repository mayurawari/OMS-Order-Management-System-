import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axios";

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Token from localStorage
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products/getproducts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Products fetched:", response.data);
        setProducts(response.data.Data);
      } catch (error) {
        console.error("Product fetch error:", error);
      }
    };

    fetchProducts();
  }, [token]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout", null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Add to Cart handler
  const handleAddToCart = async (product) => {
    try {
      const response = await axiosInstance.post(
        "/products/cart",
        { productId: product._id, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message || "Added to cart!");
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to add to cart. Please try again."
      );
    }
  };

  // Buy handler
  const handleBuy = async (product) => {
    const address = prompt("Enter your shipping address:");
    if (!address) return;
    const paymentMethod = prompt(
      "Enter payment method (ONLINE or COD):",
      "COD"
    );
    if (!paymentMethod) return;
    try {
      const response = await axiosInstance.post(
        "/products/order",
        {
          products: [{ product: product._id, quantity: 1 }],
          address,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message || "Order placed!");
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to place order. Please try again."
      );
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>User Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="cart-btn" onClick={() => navigate("/cart")}>View Cart</button>
        </div>
      </nav>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={product.image} alt={product.title} />
            <div className="product-info">
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <div className="product-meta">
                <span>₹{product.price}</span>
                <span>{product.category}</span>
              </div>
              <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button onClick={() => handleAddToCart(product)} className="cart-btn">Add to Cart</button>
                <button onClick={() => handleBuy(product)} className="buy-btn">Buy</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
