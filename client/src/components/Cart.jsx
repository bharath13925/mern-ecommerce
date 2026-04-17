import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      console.log("Cart Response",res.data);
      setCart(res.data.cart?.item || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setActionLoading(productId + "_remove");
    try {
      await API.delete(`/cart/remove/${productId}`);
      setCart((prev) => prev.filter((i) => i.productId._id !== productId));
    } catch (err) {
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    setActionLoading(productId + "_qty");
    try {
      await API.put(`/cart/update/${productId}`, { quantity });
      setCart((prev) =>
        prev.map((i) =>
          i.productId._id === productId ? { ...i, quantity } : i
        )
      );
    } catch (err) {
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + (item.productId?.price || 0) * item.quantity;
  }, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "#f0f2f5" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-danger"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: "#f0f2f5" }}>
      {/* Header */}
      <div
        className="py-4 text-white text-center"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)"
        }}
      >
        <h2 className="fw-bold mb-0">🛒 My Cart</h2>
        <p className="mb-0 opacity-75">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="container py-4">
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "5rem" }}>🛒</div>
            <h4 className="text-muted mt-3">Your cart is empty</h4>
            <p className="text-muted">Add some products to get started!</p>
            <button
              className="btn btn-danger px-4 fw-semibold"
              onClick={() => navigate("/")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* Cart Items */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {cart.map((item) => {
                  const product = item.productId;
                  return (
                    <div
                      key={product._id}
                      className="card border-0 shadow-sm"
                      style={{ borderRadius: "15px", overflow: "hidden" }}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex gap-3 align-items-center">
                          <img
                            src={
                              product.image ||
                              "https://via.placeholder.com/80x80?text=No+Image"
                            }
                            alt={product.name}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "10px"
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x80?text=No+Image";
                            }}
                          />
                          <div className="flex-grow-1">
                            <h6
                              className="fw-bold mb-1"
                              style={{ color: "#1a1a2e" }}
                            >
                              {product.name}
                            </h6>
                            <p
                              className="text-muted small mb-2"
                              style={{
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical"
                              }}
                            >
                              {product.description}
                            </p>
                            <span
                              className="fw-bold"
                              style={{ color: "#e94560" }}
                            >
                              ₹{product.price}
                            </span>
                          </div>

                          <div className="d-flex flex-column align-items-end gap-2">
                            {/* Quantity Controls */}
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  padding: 0,
                                  borderRadius: "8px"
                                }}
                                onClick={() =>
                                  updateQuantity(product._id, item.quantity - 1)
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  actionLoading === product._id + "_qty"
                                }
                              >
                                −
                              </button>
                              <span
                                className="fw-bold px-1"
                                style={{ minWidth: "20px", textAlign: "center" }}
                              >
                                {actionLoading === product._id + "_qty" ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  padding: 0,
                                  borderRadius: "8px"
                                }}
                                onClick={() =>
                                  updateQuantity(product._id, item.quantity + 1)
                                }
                                disabled={
                                  actionLoading === product._id + "_qty"
                                }
                              >
                                +
                              </button>
                            </div>

                            {/* Subtotal */}
                            <span className="text-muted small">
                              ₹{(product.price * item.quantity).toLocaleString()}
                            </span>

                            {/* Remove */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              style={{
                                borderRadius: "8px",
                                fontSize: "0.75rem"
                              }}
                              onClick={() => removeItem(product._id)}
                              disabled={
                                actionLoading === product._id + "_remove"
                              }
                            >
                              {actionLoading === product._id + "_remove" ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                "🗑 Remove"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div
                className="card border-0 shadow-sm position-sticky"
                style={{ borderRadius: "15px", top: "20px" }}
              >
                <div className="card-body p-4">
                  <h5
                    className="fw-bold mb-4"
                    style={{ color: "#1a1a2e" }}
                  >
                    📋 Order Summary
                  </h5>

                  {cart.map((item) => (
                    <div
                      key={item.productId._id}
                      className="d-flex justify-content-between mb-2 small text-muted"
                    >
                      <span>
                        {item.productId.name} × {item.quantity}
                      </span>
                      <span>
                        ₹
                        {(
                          item.productId.price * item.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <hr />

                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span style={{ color: "#e94560" }}>
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    className="btn w-100 mt-4 fw-bold text-white py-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #e94560, #0f3460)",
                      borderRadius: "10px"
                    }}
                    onClick={() => alert("Checkout feature coming soon! 🎉")}
                  >
                    Checkout →
                  </button>

                  <button
                    className="btn btn-outline-secondary w-100 mt-2 fw-semibold"
                    style={{ borderRadius: "10px" }}
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}