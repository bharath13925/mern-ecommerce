import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Navbar from './components/Navbar'
import Register from './components/Register'
import Login from './components/login'
import Addproduct from './components/Addproduct'
import Home from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/add-product" element={
          <ProtectedRoute>
            <Addproduct/>
          </ProtectedRoute>
        }/>

      </Routes>
    </BrowserRouter>
  )
}