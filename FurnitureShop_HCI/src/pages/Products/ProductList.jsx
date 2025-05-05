import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Categories for filter
  const categories = [
    "All",
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Office",
    "Storage"
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filter !== "All") params.append("category", filter);
        if (searchTerm) params.append("search", searchTerm);
        
        const response = await fetch(`http://localhost:5001/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filter, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is triggered by the state change
  };

  // Handle filter change
  const handleFilterChange = (category) => {
    setFilter(category);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Furniture Collection</h1>
        <p>Discover beautiful and functional furniture designs for your home</p>
      </div>
      
      <div className="products-toolbar">
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-filter ${filter === category ? "active" : ""}`}
              onClick={() => handleFilterChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <i className="material-icons">search</i>
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Try a different search or category.</p>
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
                <div className="product-price">${product.price.toFixed(2)}</div>
                <div className="product-category">{product.category}</div>
              </div>
              <div className="product-actions">
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