import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Homepage";
import Design from "./pages/Design/Design";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminPanel from "./pages/Admin/AdminPanel";
import ProductForm from "./pages/Admin/ProductForm";
import ProductList from "./pages/Products/ProductList";
import ProductDetail from "./pages/Products/ProductDetail";
import MyRoom from "./pages/Room/MyRoom";
import MyInventory from "./pages/Room/MyInventory";
import { useState, useEffect } from "react";

// Protected Route Component
const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  
  if (!token || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
  
  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<Design />} />
          <Route path="/design/:id" element={<Design />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/products/new" 
            element={
              <ProtectedAdminRoute>
                <ProductForm />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/products/edit/:id" 
            element={
              <ProtectedAdminRoute>
                <ProductForm />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Product Routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Room Routes */}
          <Route path="/my-room" element={<MyRoom />} />
          <Route path="/my-inventory" element={<MyInventory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
