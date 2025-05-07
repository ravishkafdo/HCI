import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const categories = [
    "All",
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Office",
    "Storage"
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (categoryFilter !== "All") params.append("category", categoryFilter);
        
        const response = await fetch(`http://localhost:5001/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        let filteredProducts = data.products || [];
        
        // Filter by product title (name) on client side if search term exists
        if (searchTerm.trim()) {
          filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
          );
        }
        
        setProducts(filteredProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [categoryFilter, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Furniture Collection</h1>
        <p>Discover beautiful and functional furniture designs for your home</p>
      </div>
      
      <div className="products-toolbar">
        <div className="search-form-list">
          <div className="search-container-list">
            <input
              type="text"
              placeholder="Search furniture..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input-list"
            />
          </div>
        </div>

        <div className="filters-container">
          <div className="category-filter-container">
            <span className="filter-label">Categories:</span>
            <button 
              className="category-filter-toggle"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              {categoryFilter === "All" ? "All Categories" : categoryFilter}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="#2d3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="category-dropdown">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-option ${categoryFilter === category ? "active" : ""}`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Try a different search or filter.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <Link
              to={`/products/${product._id}`}
              key={product._id}
              className="product-card"
            >
              <div className="product-image">
                <img
                  src={`http://localhost:5001${product.thumbnail}`}
                  alt={product.title}
                />
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <div className="product-price">Rs {product.price.toFixed(2)}</div>
                <div className="product-category">{product.category}</div>
              </div>
              <div className="product-actions-list">
                <button className="view-details">View Details</button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;