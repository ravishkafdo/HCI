import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import { useState, useEffect, createContext } from "react";

// Create Auth Context
export const AuthContext = createContext();

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !authState.user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Custom hook for auth
const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (token && user) {
        // You could add token validation here
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return {
    authState,
    login,
    logout,
  };
};

function App() {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Navbar />
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Protected Routes */}
            <Route
              path="/design"
              element={
                <ProtectedRoute>
                  <Design />
                </ProtectedRoute>
              }
            />
            <Route
              path="/design/:id"
              element={
                <ProtectedRoute>
                  <Design />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-room"
              element={
                <ProtectedRoute>
                  <MyRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-inventory"
              element={
                <ProtectedRoute>
                  <MyInventory />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute adminOnly>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <ProtectedRoute adminOnly>
                  <ProductForm />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
