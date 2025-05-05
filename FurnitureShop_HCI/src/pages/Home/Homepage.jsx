import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  const navigate = useNavigate();

  // User data
  const userName = "Designer"; // Default name for non-authenticated users
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Sample furniture catalog data
  const furnitureItems = [
    {
      id: 1,
      title: "Modern Sofa Set",
      category: "Living Room",
      price: "$1,299.99",
      rating: 4.7,
      thumbnail: "/thumbnails/modern-sofa.jpg",
    },
    {
      id: 2,
      title: "Executive Office Desk",
      category: "Office",
      price: "$849.99",
      rating: 4.5,
      thumbnail: "/thumbnails/office-desk.jpg",
    },
    {
      id: 3,
      title: "Luxury King Bed",
      category: "Bedroom",
      price: "$1,599.99",
      rating: 4.8,
      thumbnail: "/thumbnails/king-bed.jpg",
    },
    {
      id: 4,
      title: "Dining Table Set",
      category: "Dining Room",
      price: "$1,199.99",
      rating: 4.6,
      thumbnail: "/thumbnails/dining-table.jpg",
    },
    {
      id: 5,
      title: "Accent Chair",
      category: "Living Room",
      price: "$399.99",
      rating: 4.4,
      thumbnail: "/thumbnails/accent-chair.jpg",
    },
    {
      id: 6,
      title: "Bookshelf Unit",
      category: "Storage",
      price: "$299.99",
      rating: 4.3,
      thumbnail: "/thumbnails/bookshelf.jpg",
    },
  ];

  // Filter categories
  const categories = [
    "All",
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Office",
    "Storage",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredFurniture = selectedCategory === "All" 
    ? furnitureItems 
    : furnitureItems.filter(item => item.category === selectedCategory);

  const handleViewDesign = (id) => {
    navigate(`/design/${id}`);
  };

  return (
    <div className="furniture-shop-container">
      {/* Header Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Transform Your Space</h1>
          <p>Explore our curated collection of premium furniture designs</p>
          <button className="cta-button" onClick={() => navigate("/design")}>
            Start New Design
          </button>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="category-filter">
        <h2>Shop by Category</h2>
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? "active" : ""}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Furniture Catalog */}
      <section className="furniture-catalog">
        <div className="catalog-grid">
          {filteredFurniture.map((item) => (
            <div key={item.id} className="furniture-card">
              <div className="furniture-thumbnail">
                <img src={item.thumbnail} alt={item.title} />
              </div>
              <div className="furniture-details">
                <h3>{item.title}</h3>
                <span className="furniture-category">{item.category}</span>
                <div className="furniture-meta">
                  <span className="furniture-price">{item.price}</span>
                  <span className="furniture-rating">★ {item.rating}</span>
                </div>
                <div className="furniture-actions">
                  <button 
                    className="view-design-btn"
                    onClick={() => handleViewDesign(item.id)}
                  >
                    View Design
                  </button>
                  <button className="add-to-cart-btn">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Designs</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Visualize in Your Space</h3>
            <p>See how furniture fits in your room with our 3D viewer</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Customizable Options</h3>
            <p>Personalize colors and materials to match your style</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📐</div>
            <h3>Precise Measurements</h3>
            <p>Ensure perfect fit with accurate sizing tools</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="copyright">
          © 2023 Furniture Design Studio. All rights reserved.
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">
            Help
          </a>
          <a href="#" className="footer-link">
            Privacy
          </a>
          <a href="#" className="footer-link">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
