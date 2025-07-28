import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [actionMap, setActionMap] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios
      .get("/api/product/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error("Error fetching orders:", err));
  };

  const handleAction = async (orderId, action) => {
    try {
      await axios.post(
        `http://localhost:9090/api/product/order/${orderId}/finalize`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Order ${action}d successfully`);
      fetchOrders(); // refresh orders
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <h2>All User Orders</h2>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <p><strong>User ID:</strong> {order.user}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
              <p><strong>Products:</strong></p>
              <ul>
                {order.products.map((item, index) => (
                  <li key={index}>
                    {item.product?.title || "Product Removed"} - Qty: {item.quantity}
                  </li>
                ))}
              </ul>
              {order.status === "pending" && (
                <div className="order-actions">
                  <button
                    onClick={() => handleAction(order._id, "finalize")}
                    className="finalize-btn"
                  >
                    Finalize for Delivery
                  </button>
                  <button
                    onClick={() => handleAction(order._id, "cancel")}
                    className="cancel-btn"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
              {order.status !== "pending" && (
                <p className="processed-msg">Order already {order.status}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
