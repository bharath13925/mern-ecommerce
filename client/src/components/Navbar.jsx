import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark px-4 py-3"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        boxShadow: "0 2px 15px rgba(0,0,0,0.3)"
      }}
    >
      <Link className="navbar-brand fw-bold fs-4" to="/"
        style={{ color: "#e94560", letterSpacing: "1px" }}>
        🛍️ ShopZone
      </Link>

      <div className="d-flex align-items-center gap-3 ms-auto">
        {token ? (
          <>
            <span
              className="badge px-3 py-2"
              style={{
                background: role === "admin" ? "#e94560" : "#0f3460",
                fontSize: "0.75rem"
              }}
            >
              {role === "admin" ? "👑 Admin" : "👤 User"}
            </span>

            {role === "admin" && (
              <Link className="btn btn-sm btn-outline-warning fw-semibold" to="/add-product">
                + Add Product
              </Link>
            )}

            {role === "user" && (
              <Link className="btn btn-sm btn-outline-info fw-semibold" to="/cart">
                🛒 My Cart
              </Link>
            )}

            <button className="btn btn-sm btn-danger fw-semibold" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-sm btn-outline-light fw-semibold" to="/login">
              Login
            </Link>
            <Link className="btn btn-sm btn-warning fw-semibold" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}