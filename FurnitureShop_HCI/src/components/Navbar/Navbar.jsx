import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
import { AuthContext } from "../../App";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);

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
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <span className="logo-text">Furniture Hub</span>
        </div>
        
        <div className="navbar-links desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Shop</Link>
          <Link to="/design" className="nav-link">Design</Link>
          <Link to="/my-room" className="nav-link">My Room</Link>
          <Link to="/my-inventory" className="nav-link">My Inventory</Link>
          {authState.isAuthenticated && (
            <>
              {authState.user?.role === "designer" && (
                <Link to="/designs" className="nav-link">My Designs</Link>
              )}
              {authState.user?.role === "admin" && (
                <Link to="/admin" className="nav-link admin-link">Admin Dashboard</Link>
              )}
            </>
          )}
        </div>
        
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className="menu-icon">☰</span>
        </button>
        
        <div className="navbar-auth">
          {authState.isAuthenticated ? (
            <div className="profile-section">
              <div 
                className="profile-info"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar">
                  {authState.user?.name?.charAt(0)}
                </div>
                <span className="username">{authState.user?.name}</span>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="user-info">
                    <span className="user-role">{authState.user?.role}</span>
                    <span className="user-email">{authState.user?.email}</span>
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
                    {authState.user?.role === "designer" && (
                      <Link to="/designs" className="dropdown-link">
                        My Designs
                      </Link>
                    )}
                    {authState.user?.role === "admin" && (
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
          {authState.isAuthenticated && (
            <>
              {authState.user?.role === "designer" && (
                <Link to="/designs" className="menu-link" onClick={() => setMenuOpen(false)}>
                  My Designs
                </Link>
              )}
              {authState.user?.role === "admin" && (
                <Link to="/admin" className="menu-link admin-link" onClick={() => setMenuOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;