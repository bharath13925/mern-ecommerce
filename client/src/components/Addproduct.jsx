import React, { useState } from 'react'
import API from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Addproduct() {
  const [formData, setFormData] = useState({
    name: "", price: "", description: "", image: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleAddProduct(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    API.post("/products/add", { ...formData, price: Number(formData.price) })
      .then((res) => {
        if (res.status === 201) {
          navigate("/")
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to add product")
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-vh-100 py-5" style={{ background: "#f0f2f5" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              {/* Card Header */}
              <div
                className="py-4 px-4 text-white text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)"
                }}
              >
                <div style={{ fontSize: "2.5rem" }}>📦</div>
                <h4 className="fw-bold mb-0">Add New Product</h4>
                <p className="mb-0 opacity-75 small">
                  Fill in the product details below
                </p>
              </div>

              <div className="card-body p-4">
                {error && (
                  <div
                    className="alert alert-danger py-2 small"
                    style={{ borderRadius: "10px" }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleAddProduct}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control py-2"
                      placeholder="e.g. Nike Air Max 270"
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef"
                      }}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small">
                      Price (₹)
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{
                          borderRadius: "10px 0 0 10px",
                          border: "2px solid #e9ecef",
                          borderRight: 0,
                          background: "#f8f9fa"
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        name="price"
                        className="form-control py-2"
                        placeholder="0.00"
                        min="0"
                        style={{
                          borderRadius: "0 10px 10px 0",
                          border: "2px solid #e9ecef",
                          borderLeft: 0
                        }}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small">
                      Description
                    </label>
                    <textarea
                      name="description"
                      className="form-control"
                      placeholder="Describe the product..."
                      rows={3}
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                        resize: "none"
                      }}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted small">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      className="form-control py-2"
                      placeholder="https://example.com/image.jpg"
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef"
                      }}
                      onChange={handleChange}
                    />
                    {formData.image && (
                      <div className="mt-2 text-center">
                        <img
                          src={formData.image}
                          alt="Preview"
                          style={{
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "2px solid #e9ecef"
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to="/"
                      className="btn btn-outline-secondary fw-semibold flex-fill py-2"
                      style={{ borderRadius: "10px" }}
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn fw-bold text-white flex-fill py-2"
                      style={{
                        background:
                          "linear-gradient(135deg, #e94560, #0f3460)",
                        borderRadius: "10px"
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Adding...
                        </>
                      ) : (
                        "Add Product"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}