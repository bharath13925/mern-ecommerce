import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function StarRating({ rating, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            cursor: onRate ? "pointer" : "default",
            color: star <= (hovered || rating) ? "#f5a623" : "#ddd",
            fontSize: "1rem"
          }}
          onMouseEnter={() => onRate && setHovered(star)}
          onMouseLeave={() => onRate && setHovered(0)}
          onClick={() => onRate && onRate(star)}
        >★</span>
      ))}
    </div>
  );
}

function ReviewModal({ product, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return alert("Please fill all fields");
    setSubmitting(true);
    await onSubmit(product._id, { rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="card border-0 shadow-lg p-4"
        style={{ borderRadius: "20px", width: "100%", maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>⭐ Rate & Review</h5>
        <p className="text-muted small mb-3">{product.name}</p>

        <label className="form-label fw-semibold text-muted small">Your Rating</label>
        <div className="mb-3" style={{ fontSize: "1.8rem" }}>
          <StarRating rating={rating} onRate={setRating} />
        </div>

        <label className="form-label fw-semibold text-muted small">Your Comment</label>
        <textarea
          className="form-control mb-3"
          rows={3}
          placeholder="Share your experience..."
          style={{ borderRadius: "10px", border: "2px solid #e9ecef", resize: "none" }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary flex-fill fw-semibold" style={{ borderRadius: "10px" }} onClick={onClose}>Cancel</button>
          <button
            className="btn fw-bold text-white flex-fill"
            style={{ background: "linear-gradient(135deg, #e94560, #0f3460)", borderRadius: "10px" }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <span className="spinner-border spinner-border-sm" /> : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [reviewModal, setReviewModal] = useState(null);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, minPrice, maxPrice]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "all") params.append("category", category);
      if (sort) params.append("sort", sort);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await API.get(`/products?${params.toString()}`);
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
    setCartLoading(productId);
    try {
      await API.post("/cart/add", { productId, quantity: 1 });
      showToast("✅ Added to cart!", "success");
    } catch (err) {
      showToast("❌ Failed to add to cart", "danger");
      console.log("ADD ERROR:", err.response?.data || err);
    } finally {
      setCartLoading(null);
    }
  };

  const submitReview = async (productId, { rating, comment }) => {
    try {
      const userName = localStorage.getItem("userName") || "User";
      await API.post(`/products/${productId}/review`, { rating, comment, userName });
      showToast("⭐ Review submitted!", "success");
      fetchProducts();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to submit review", "danger");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-vh-100" style={{ background: "#f0f2f5" }}>
      {reviewModal && (
        <ReviewModal
          product={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={submitReview}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3 shadow`}
          style={{ zIndex: 9998, minWidth: "250px", borderRadius: "10px" }}
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

      <div className="container py-4">
        {/* Search & Filter Bar */}
        <div className="card border-0 shadow-sm mb-4 p-3" style={{ borderRadius: "15px" }}>
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-muted small mb-1">🔍 Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold text-muted small mb-1">Category</label>
              <select
                className="form-select"
                style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All</option>
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
                <option value="accessory">Accessory</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold text-muted small mb-1">Sort By</label>
              <select
                className="form-select"
                style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold text-muted small mb-1">Min ₹</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="col-md-1">
              <label className="form-label fw-semibold text-muted small mb-1">Max ₹</label>
              <input
                type="number"
                className="form-control"
                placeholder="∞"
                style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="col-md-1">
              <button
                className="btn btn-outline-secondary w-100"
                style={{ borderRadius: "10px" }}
                onClick={clearFilters}
                title="Clear filters"
              >✕</button>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark mb-0">
            All Products
            <span className="badge bg-secondary ms-2 fs-6">{products.length}</span>
          </h4>
          {role === "admin" && (
            <a href="/add-product" className="btn btn-warning fw-semibold">+ Add New Product</a>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>📦</div>
            <h5 className="text-muted">No products found</h5>
            <button className="btn btn-outline-secondary mt-2" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((p) => (
              <div className="col-sm-6 col-md-4 col-lg-3" key={p._id}>
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{ borderRadius: "15px", overflow: "hidden", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {/* Category Badge */}
                  <div style={{ position: "relative" }}>
                    <div style={{ height: "200px", overflow: "hidden", background: "#f8f9fa" }}>
                      <img
                        src={p.image || "https://via.placeholder.com/300x200?text=No+Image"}
                        alt={p.name}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
                      />
                    </div>
                    {p.category && p.category !== "other" && (
                      <span
                        className="badge position-absolute"
                        style={{ top: "10px", left: "10px", background: "#0f3460", fontSize: "0.7rem", borderRadius: "6px" }}
                      >
                        {p.category.charAt(0).toUpperCase() + p.category.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column p-3">
                    <h6 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>{p.name}</h6>
                    <p
                      className="text-muted small mb-2"
                      style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                    >
                      {p.description}
                    </p>

                    {/* Rating */}
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <StarRating rating={Math.round(p.averageRating || 0)} />
                      <span className="text-muted small">({p.reviews?.length || 0})</span>
                    </div>

                    <div className="mt-auto">
                      <span className="fw-bold fs-5" style={{ color: "#e94560" }}>₹{p.price}</span>

                      {role === "user" && (
                        <>
                          <button
                            className="btn w-100 mt-2 fw-semibold text-white"
                            style={{ background: "linear-gradient(135deg, #0f3460, #e94560)", borderRadius: "8px" }}
                            onClick={() => addToCart(p._id)}
                            disabled={cartLoading === p._id}
                          >
                            {cartLoading === p._id ? (
                              <><span className="spinner-border spinner-border-sm me-2" />Adding...</>
                            ) : "🛒 Add to Cart"}
                          </button>
                          <button
                            className="btn btn-outline-warning w-100 mt-1 fw-semibold"
                            style={{ borderRadius: "8px", fontSize: "0.8rem" }}
                            onClick={() => setReviewModal(p)}
                          >
                            ⭐ Write a Review
                          </button>
                        </>
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