import React, { useState } from 'react'
import API from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", mobile: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleRegister(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    API.post("/auth/register", { ...formData, mobile: Number(formData.mobile) })
      .then((res) => {
        if (res.status === 201) {
          navigate("/login")
        }
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Registration failed. Please try again."
        )
      })
      .finally(() => setLoading(false))
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-4"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <div
        className="card border-0 shadow-lg p-4"
        style={{ width: "100%", maxWidth: "440px", borderRadius: "20px" }}
      >
        <div className="text-center mb-4">
          <div style={{ fontSize: "3rem" }}></div>
          <h3 className="fw-bold" style={{ color: "#1a1a2e" }}>
            Create Account
          </h3>
          <p className="text-muted">Join ShopZone today</p>
        </div>

        {error && (
          <div
            className="alert alert-danger py-2 small"
            style={{ borderRadius: "10px" }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {[
            {
              label: "Full Name",
              name: "name",
              type: "text",
              placeholder: "John Doe"
            },
            {
              label: "Email Address",
              name: "email",
              type: "email",
              placeholder: "john@example.com"
            },
            {
              label: "Password",
              name: "password",
              type: "password",
              placeholder: "Min. 6 characters"
            },
            {
              label: "Mobile Number",
              name: "mobile",
              type: "tel",
              placeholder: "10-digit number"
            }
          ].map((field) => (
            <div className="mb-3" key={field.name}>
              <label className="form-label fw-semibold text-muted small">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                className="form-control py-2"
                placeholder={field.placeholder}
                style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="btn w-100 py-2 fw-bold text-white mt-1"
            style={{
              background: "linear-gradient(135deg, #e94560, #0f3460)",
              borderRadius: "10px"
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-muted small">
          Already have an account?{" "}
          <Link
            to="/login"
            className="fw-semibold"
            style={{ color: "#e94560" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}