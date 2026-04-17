import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: { bg: "#fff3cd", color: "#856404" },
  processing: { bg: "#cff4fc", color: "#055160" },
  shipped: { bg: "#d1ecf1", color: "#0c5460" },
  delivered: { bg: "#d4edda", color: "#155724" },
  cancelled: { bg: "#f8d7da", color: "#721c24" }
};

const STATUS_ICONS = {
  pending: "⏳",
  processing: "⚙️",
  shipped: "🚚",
  delivered: "✅",
  cancelled: "❌"
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await API.get("/orders/all");
      setOrders(res.data.orders);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await API.put(`/orders/status/${orderId}`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      );
      showToast(`✅ Status updated to "${status}"`, "success");
    } catch (err) {
      showToast("❌ Failed to update status", "danger");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f2f5" }}>
        <div className="text-center">
          <div className="spinner-border text-danger" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: "#f0f2f5" }}>
      {toast.show && (
        <div
          className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3 shadow`}
          style={{ zIndex: 9999, minWidth: "250px", borderRadius: "10px" }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="py-4 text-white text-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <h2 className="fw-bold mb-0">👑 Admin Dashboard</h2>
        <p className="mb-0 opacity-75">Manage all orders and track revenue</p>
      </div>

      <div className="container py-4">
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: "12px" }}>
              <div style={{ fontSize: "2rem" }}>📦</div>
              <h4 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>{orders.length}</h4>
              <p className="text-muted small mb-0">Total Orders</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: "12px" }}>
              <div style={{ fontSize: "2rem" }}>💰</div>
              <h4 className="fw-bold mb-0" style={{ color: "#e94560" }}>₹{totalRevenue.toLocaleString()}</h4>
              <p className="text-muted small mb-0">Total Revenue</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: "12px" }}>
              <div style={{ fontSize: "2rem" }}>✅</div>
              <h4 className="fw-bold mb-0" style={{ color: "#28a745" }}>{statusCounts.delivered}</h4>
              <p className="text-muted small mb-0">Delivered</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: "12px" }}>
              <div style={{ fontSize: "2rem" }}>⏳</div>
              <h4 className="fw-bold mb-0" style={{ color: "#ffc107" }}>{statusCounts.pending}</h4>
              <p className="text-muted small mb-0">Pending</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              className={`btn btn-sm fw-semibold ${filter === s ? "btn-dark" : "btn-outline-secondary"}`}
              style={{ borderRadius: "20px" }}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "📋 All" : `${STATUS_ICONS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              <span className={`badge ms-1 ${filter === s ? "bg-white text-dark" : "bg-secondary"}`}>
                {s === "all" ? orders.length : statusCounts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>📭</div>
            <h5 className="text-muted mt-3">No orders found</h5>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredOrders.map((order) => {
              const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              return (
                <div key={order._id} className="card border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                  <div className="d-flex justify-content-between align-items-center px-4 py-3 flex-wrap gap-2" style={{ background: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    <div>
                      <span className="fw-bold small" style={{ color: "#1a1a2e" }}>
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-muted small mb-0">
                        👤 {order.userId?.name || "Unknown"} • {order.userId?.email || ""}
                      </p>
                      <p className="text-muted small mb-0">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="badge px-3 py-2"
                        style={{ background: statusInfo.bg, color: statusInfo.color, borderRadius: "8px", fontSize: "0.8rem" }}
                      >
                        {STATUS_ICONS[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {/* Status Dropdown */}
                      <select
                        className="form-select form-select-sm"
                        style={{ borderRadius: "8px", border: "2px solid #e9ecef", maxWidth: "160px" }}
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {updatingId === order._id && <span className="spinner-border spinner-border-sm text-primary" />}
                    </div>
                  </div>

                  <div className="card-body p-3">
                    {order.items?.map((item) => {
                      const product = item.productId;
                      if (!product) return null;
                      return (
                        <div key={item._id} className="d-flex gap-3 align-items-center mb-2">
                          <img
                            src={product.image || "https://via.placeholder.com/50x50?text=No"}
                            alt={product.name}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/50x50?text=No"; }}
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
                    <div className="d-flex justify-content-end">
                      <span className="fw-bold">
                        Order Total: <span style={{ color: "#e94560" }}>₹{order.totalAmount?.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}