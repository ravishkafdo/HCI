import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

// Hero banner images
const heroImages = [
  "https://t3.ftcdn.net/jpg/07/00/50/82/360_F_700508241_HpTCpfcnQ6EsEebsMEDovyPbV1LZtI45.jpg",
  "https://t4.ftcdn.net/jpg/04/66/25/33/360_F_466253361_c4fAjCqVZD4L2boH8vfqjUbUYk0wLcP7.jpg",
  "https://static.wixstatic.com/media/e1b1f5_f68381f3ed01486c93a9a9934bcece07~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/e1b1f5_f68381f3ed01486c93a9a9934bcece07~mv2.jpg"
];

function Homepage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fetchError, setFetchError] = useState(null);

  // Auto slide hero banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products data
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const response = await fetch('/api/products?limit=1000');
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        const responseData = await response.json();

        if (!responseData?.products) throw new Error("Invalid data format from server");

        setDesigns(responseData.products);
        const uniqueCategories = ["All", ...new Set(responseData.products
          .filter(item => item.category)
          .map(item => item.category)
        )];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch designs:", error);
        setFetchError(error.message || "Failed to load designs");
        setDesigns([]);
        setCategories(["All"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Get the 8 most recent products
  const latestProducts = [...designs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const filteredFurniture = selectedCategory === "All" 
    ? latestProducts 
    : latestProducts.filter(item => item.category === selectedCategory);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleViewDesign = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="homepage-container">
      {/* Section 1: Hero Banner */}
      <section className="hero-section">
        <div className="hero-slideshow">
          {heroImages.map((image, index) => (
            <div 
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${image})` }}
            />
          ))}
        </div>
        <div className="hero-content">
          <h1>Transform Your Space</h1>
          <p>Explore our curated collection of premium furniture designs</p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={() => navigate("/design")}>
              Start New Design
            </button>
            <button className="cta-button secondary" onClick={() => navigate("/products")}>
              Shop Collection
            </button>
          </div>
          <div className="slide-indicators">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Catalog Section */}
      <section className="catalog-section">
        <div className="section-container">
          <div className="category-filter">
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
          </div>

          <div className="catalog-grid">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading designs...</p>
              </div>
            ) : fetchError ? (
              <p className="error-message">Error: {fetchError}</p>
            ) : filteredFurniture.length > 0 ? (
              filteredFurniture.map((item) => (
                <div key={item._id} className="furniture-card">
                  <div className="furniture-thumbnail">
                    <img 
                      src={item.thumbnail && item.thumbnail.startsWith('http') 
                        ? item.thumbnail 
                        : item.thumbnail 
                          ? `http://localhost:5001${item.thumbnail}` 
                          : '/thumbnails/default-thumbnail.jpg'} 
                      alt={item.name || item.title} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/thumbnails/default-thumbnail.jpg';
                      }}
                    />
                  </div>
                  <div className="furniture-details">
                    <h3>{item.name || item.title}</h3>
                    <span className="furniture-category">{item.category}</span>
                    <div className="furniture-meta">
                      <span className="furniture-price">${item.price ? item.price.toFixed(2) : 'N/A'}</span>
                    </div>
                    <button 
                      className="view-design-btn"
                      onClick={() => handleViewDesign(item._id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No designs found for the selected category.</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Features Section */}
      <section className="features-section">
        <div className="section-container">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="copyright">
          © {new Date().getFullYear()} Furniture Design Studio. All rights reserved.
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Help</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;