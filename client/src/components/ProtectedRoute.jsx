import { Navigate } from "react-router-dom"

// it checks for the if token exists then allow acces to the whatever the person to do
// else navigate to the login

export default function ProtectedRoute({children}) {
    const token=localStorage.getItem("token")
    return token? children:<Navigate to="/login" replace/>
}