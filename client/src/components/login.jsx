import React, { useState } from 'react'
import API from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  function handleLogin(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    API.post("/auth/login", { email, password })
      .then((res) => {
        if (res.status === 200) {
          localStorage.setItem("token", res.data.token)
          localStorage.setItem("role", res.data.user.role)
          navigate("/")
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Login failed. Please try again.")
      })
      .finally(() => setLoading(false))
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <div
        className="card border-0 shadow-lg p-4"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "20px" }}
      >
        <div className="text-center mb-4">
          <div style={{ fontSize: "3rem" }}>🛍️</div>
          <h3 className="fw-bold" style={{ color: "#1a1a2e" }}>
            Welcome Back
          </h3>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && (
          <div
            className="alert alert-danger py-2 small"
            style={{ borderRadius: "10px" }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-muted small">
              Email Address
            </label>
            <input
              type="email"
              className="form-control py-2"
              placeholder="Enter your email"
              style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold text-muted small">
              Password
            </label>
            <input
              type="password"
              className="form-control py-2"
              placeholder="Enter your password"
              style={{ borderRadius: "10px", border: "2px solid #e9ecef" }}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-100 py-2 fw-bold text-white"
            style={{
              background: "linear-gradient(135deg, #e94560, #0f3460)",
              borderRadius: "10px"
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-muted small">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="fw-semibold"
            style={{ color: "#e94560" }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}