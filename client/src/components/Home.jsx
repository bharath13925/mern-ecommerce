import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const role = localStorage.getItem("role"); // ✅ Fixed (was "user.role")
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.products);
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

  const addToCart = async (productId) => {
  try {
    console.log("ADDING PRODUCT 👉", productId); // ✅ DEBUG

    const res = await API.post("/cart/add", {
      productId,
      quantity: 1
    });

    console.log("ADD RESPONSE 👉", res.data); // ✅ DEBUG

  } catch (err) {
    console.log("ADD ERROR 👉", err.response?.data || err);
  }
};

  return (
    <div className="min-vh-100" style={{ background: "#f0f2f5" }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3 shadow`}
          style={{ zIndex: 9999, minWidth: "250px", borderRadius: "10px" }}
        >
          {toast.message}
        </div>
      )}

      {/* Hero Banner */}
      <div
        className="py-5 text-white text-center"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)" }}
      >
        <h1 className="fw-bold display-5">🛍️ Welcome to ShopZone</h1>
        <p className="lead mb-0 opacity-75">Discover amazing products at great prices</p>
      </div>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark mb-0">
            All Products
            <span className="badge bg-secondary ms-2 fs-6">{products.length}</span>
          </h4>
          {role === "admin" && (
            <a href="/add-product" className="btn btn-warning fw-semibold">
              + Add New Product
            </a>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>📦</div>
            <h5 className="text-muted">No products available yet</h5>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((p) => (
              <div className="col-sm-6 col-md-4 col-lg-3" key={p._id}>
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: "15px",
                    overflow: "hidden",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div
                    style={{
                      height: "200px",
                      overflow: "hidden",
                      background: "#f8f9fa"
                    }}
                  >
                    <img
                      src={p.image || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={p.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  </div>

                  <div className="card-body d-flex flex-column p-3">
                    <h6
                      className="fw-bold mb-1"
                      style={{ color: "#1a1a2e" }}
                    >
                      {p.name}
                    </h6>
                    <p
                      className="text-muted small mb-2"
                      style={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {p.description}
                    </p>
                    <div className="mt-auto">
                      <span
                        className="fw-bold fs-5"
                        style={{ color: "#e94560" }}
                      >
                        ₹{p.price}
                      </span>

                      {role === "user" && (
                        <button
                          className="btn w-100 mt-2 fw-semibold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #0f3460, #e94560)",
                            borderRadius: "8px"
                          }}
                          onClick={() => addToCart(p._id)}
                          disabled={cartLoading === p._id}
                        >
                          {cartLoading === p._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Adding...
                            </>
                          ) : (
                            "🛒 Add to Cart"
                          )}
                        </button>
                      )}

                      {!token && (
                        <button
                          className="btn btn-outline-secondary w-100 mt-2 fw-semibold"
                          onClick={() => navigate("/login")}
                        >
                          Login to Buy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;