import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  function handleLogout() {
    alert("Logged out successfully")
    localStorage.removeItem("token")
    navigate("/login")
  }
  return (
    <nav className='navbar navbar-dark bg-dark px-3'>
      <Link className='navbar-brand' to="/">Home</Link>
      {
        token ? (
          <>
            <Link className='nav-item' to="/add-product">Add Product</Link>
            <Link className='nav-item' onClick={handleLogout}>Logout</Link>
          </>
        ) : (
          <>
            <Link className='nav-item' to="/login">Login</Link>
            <Link className='nav-item' to="/register">Register</Link>
          </>
        )
      }
    </nav>
  )
}
