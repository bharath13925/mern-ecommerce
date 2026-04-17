import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  pending: { bg: "#fff3cd", color: "#856404", label: "⏳ Pending" },
  processing: { bg: "#cff4fc", color: "#055160", label: "⚙️ Processing" },
  shipped: { bg: "#d1ecf1", color: "#0c5460", label: "🚚 Shipped" },
  delivered: { bg: "#d4edda", color: "#155724", label: "✅ Delivered" },
  cancelled: { bg: "#f8d7da", color: "#721c24", label: "❌ Cancelled" }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f2f5" }}>
        <div className="text-center">
          <div className="spinner-border text-danger" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: "#f0f2f5" }}>
      {/* Header */}
      <div className="py-4 text-white text-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <h2 className="fw-bold mb-0">📦 My Orders</h2>
        <p className="mb-0 opacity-75">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      <div className="container py-4" style={{ maxWidth: "800px" }}>
        {orders.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "5rem" }}>📭</div>
            <h4 className="text-muted mt-3">No orders yet</h4>
            <p className="text-muted">Start shopping to see your orders here!</p>
            <button className="btn btn-danger px-4 fw-semibold" onClick={() => navigate("/")}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => {
              const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              return (
                <div key={order._id} className="card border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                  {/* Order Header */}
                  <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ background: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    <div>
                      <span className="fw-bold small" style={{ color: "#1a1a2e" }}>
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-muted small mb-0">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                      </p>
                    </div>
                    <span
                      className="badge px-3 py-2"
                      style={{ background: statusInfo.bg, color: statusInfo.color, borderRadius: "8px", fontSize: "0.8rem" }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="card-body p-3">
                    {order.items?.map((item) => {
                      const product = item.productId;
                      if (!product) return null;
                      return (
                        <div key={item._id} className="d-flex gap-3 align-items-center mb-2">
                          <img
                            src={product.image || "https://via.placeholder.com/60x60?text=No+Image"}
                            alt={product.name}
                            style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/60x60?text=No+Image"; }}
                          />
                          <div className="flex-grow-1">
                            <p className="fw-semibold mb-0 small" style={{ color: "#1a1a2e" }}>{product.name}</p>
                            <p className="text-muted small mb-0">Qty: {item.quantity} × ₹{product.price}</p>
                          </div>
                          <span className="fw-bold small" style={{ color: "#e94560" }}>
                            ₹{(product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}

                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">{order.items?.length} item(s)</span>
                      <span className="fw-bold" style={{ color: "#1a1a2e" }}>
                        Total: <span style={{ color: "#e94560" }}>₹{order.totalAmount?.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-4">
          <button
            className="btn btn-outline-secondary fw-semibold px-4"
            style={{ borderRadius: "10px" }}
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}