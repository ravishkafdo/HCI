import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import { AuthContext } from "../../App";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "designer" // Default to designer
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fromDesign = location.state?.from?.pathname === "/design";
  const fromAdmin = location.state?.from?.pathname?.startsWith("/admin");
  const message = location.state?.message;
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", formData.email);
      
      // Use the real backend authentication
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and user data to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Call the login function from context
      login(data.token, data.user);
      
      console.log("Authentication successful, redirecting...");
      console.log("fromDesign:", fromDesign);
      console.log("User role:", data.user.role);
      
      // Redirect based on priority: design redirect first, then role-based
      setTimeout(() => {
        if (fromAdmin && data.user.role === 'admin') {
          console.log("Redirecting to admin dashboard");
          navigate(location.state.from.pathname);
        } else if (fromDesign) {
          console.log("Redirecting to design page");
          navigate(location.state.from.pathname);
        } else if (data.user.role === 'admin') {
          console.log("Redirecting to admin dashboard");
          navigate("/admin");
        } else {
          console.log("Redirecting to home page");
          navigate("/");
        }
      }, 100); // Short delay to ensure context updates
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        <p className="auth-subtitle">
          Access your account to manage furniture designs
        </p>
        
        {message && <div className="info-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div className="form-group">
          <label>User Type</label>
          <select 
            name="userType" 
            value={formData.userType}
            onChange={handleChange}
          >
            <option value="designer">Designer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-extra">
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <a href="#" className="forgot-password">Forgot password?</a>
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </div>
        
        <div className="auth-note">
          <p>For demo purposes, use:</p>
          <p>Admin: admin@example.com / adminpass</p>
          <p>Designer: designer@example.com / password</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
