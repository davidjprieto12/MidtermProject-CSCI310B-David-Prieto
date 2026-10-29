import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    if (isLoading) return <p>Loading...</p>;
    return user ? <Outlet /> : <Navigate to="/login" replace />; 
}