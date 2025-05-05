import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "designer" // Default to designer
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

    // For demonstration purposes, mock authentication
    try {
      // In a real application, this would make an API call to authenticate
      // const response = await fetch("http://localhost:5001/api/auth/login", {...})
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      if (formData.email === "designer@example.com" && formData.password === "password") {
        // Create mock user data
        const userData = {
          id: "d123",
          name: "John Designer",
          email: formData.email,
          role: "designer",
          company: "Furniture Design Studio"
        };
        
        // Save token and user data to localStorage
        localStorage.setItem("token", "mock-jwt-token");
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Redirect to home page
        navigate("/");
      } else {
        // Mock authentication error
        throw new Error("Invalid email or password. For demo, use designer@example.com / password");
      }
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
        <h2>Designer Login</h2>
        <p className="auth-subtitle">
          Access your account to create and manage furniture designs
        </p>
        
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
          <p>Email: designer@example.com</p>
          <p>Password: password</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
