import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check auth status on component mount and route changes
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate, isAuthenticated]); // Re-run when navigation or auth status changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest(".profile-section")) {
        setDropdownOpen(false);
      }
      if (menuOpen && !e.target.closest(".navbar-menu") && 
          !e.target.closest(".menu-toggle")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">🪑</span>
          <span className="logo-text">Furniture Design Studio</span>
        </div>
        
        {/* Navigation Links */}
        <div className="navbar-links desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Shop</Link>
          <Link to="/design" className="nav-link">Design</Link>
          <Link to="/my-room" className="nav-link">My Room</Link>
          {user && user.role === "designer" && (
            <Link to="/designs" className="nav-link">My Designs</Link>
          )}
          {user && user.role === "admin" && (
            <Link to="/admin" className="nav-link admin-link">Admin Dashboard</Link>
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className="menu-icon">☰</span>
        </button>
        
        {/* Auth Section */}
        <div className="navbar-auth">
          {user ? (
            <div className="profile-section">
              <div 
                className="profile-info"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar">
                  {user.name.charAt(0)}
                </div>
                <span className="username">{user.name}</span>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="user-info">
                    <span className="user-role">{user.role}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  
                  <div className="dropdown-links">
                    <Link to="/profile" className="dropdown-link">
                      My Profile
                    </Link>
                    <Link to="/my-room" className="dropdown-link">
                      My Room
                    </Link>
                    <Link to="/my-inventory" className="dropdown-link">
                      My Inventory
                    </Link>
                    {user.role === "designer" && (
                      <Link to="/designs" className="dropdown-link">
                        My Designs
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin" className="dropdown-link">
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                  
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="register-btn" 
                onClick={() => navigate("/register")}
              >
                Register
              </button>
              <button 
                className="login-btn" 
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-menu">
          <Link to="/" className="menu-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="menu-link" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link to="/design" className="menu-link" onClick={() => setMenuOpen(false)}>
            Design
          </Link>
          <Link to="/my-room" className="menu-link" onClick={() => setMenuOpen(false)}>
            My Room
          </Link>
          <Link to="/my-inventory" className="menu-link" onClick={() => setMenuOpen(false)}>
            My Inventory
          </Link>
          {user && user.role === "designer" && (
            <Link to="/designs" className="menu-link" onClick={() => setMenuOpen(false)}>
              My Designs
            </Link>
          )}
          {user && user.role === "admin" && (
            <Link to="/admin" className="menu-link admin-link" onClick={() => setMenuOpen(false)}>
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
