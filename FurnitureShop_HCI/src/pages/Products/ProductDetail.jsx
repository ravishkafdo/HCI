import React, { useState, useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./ProductDetail.css";

// 3D Model component with lazy loading
const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [viewMode, setViewMode] = useState('2D'); // 2D or 3D
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        
        const data = await response.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          throw new Error("Product not found");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Handle add to room
  const handleAddToRoom = () => {
    // Get existing items from local storage or create empty array
    const roomItems = JSON.parse(localStorage.getItem('roomItems') || '[]');
    
    // Check if item already exists in room
    const exists = roomItems.some(item => item._id === product._id);
    
    if (!exists) {
      // Add the item with initial position and rotation
      roomItems.push({
        ...product,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      });
      
      // Save to local storage
      localStorage.setItem('roomItems', JSON.stringify(roomItems));
      
      // Navigate to room page
      navigate('/my-room');
    } else {
      alert('This item is already in your room');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Error Loading Product</h2>
        <p>{error || "Product not found"}</p>
        <button onClick={() => navigate('/products')}>
          Return to Products
        </button>
      </div>
    );
  }

  // Prepare image gallery
  const allImages = [product.thumbnail, ...(product.images || [])];
  
  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* View mode toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === '2D' ? 'active' : ''}`}
            onClick={() => setViewMode('2D')}
          >
            2D View
          </button>
          <button 
            className={`toggle-btn ${viewMode === '3D' ? 'active' : ''}`}
            onClick={() => setViewMode('3D')}
          >
            3D View
          </button>
        </div>
        
        {/* Left column - Image Gallery or 3D Model */}
        <div className="product-visual">
          {viewMode === '2D' ? (
            <div className="product-gallery">
              <div className="main-image">
                <img 
                  src={`http://localhost:5001${allImages[activeImage]}`} 
                  alt={product.title} 
                />
              </div>
              <div className="thumbnails">
                {allImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={`http://localhost:5001${image}`} 
                      alt={`${product.title} ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="model-viewer">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <Suspense fallback={null}>
                  <Model url={`http://localhost:5001${product.modelUrl}`} />
                  <OrbitControls />
                </Suspense>
              </Canvas>
            </div>
          )}
        </div>
        
        {/* Right column - Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.title}</h1>
          
          <div className="product-category">
            <span>{product.category}</span>
          </div>
          
          <div className="product-price">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="product-details">
            <h3>Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Dimensions:</span>
                <span className="detail-value">
                  {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.length} cm
                </span>
              </div>
              {product.materials && product.materials.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Materials:</span>
                  <span className="detail-value">
                    {product.materials.join(', ')}
                  </span>
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Available Colors:</span>
                  <div className="color-options">
                    {product.colors.map((color, index) => (
                      <div 
                        key={index} 
                        className="color-option"
                        style={{ 
                          backgroundColor: color.startsWith('#') ? color : color
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Availability:</span>
                <span className={`detail-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="product-actions">
            <button 
              className="add-to-room-btn"
              onClick={handleAddToRoom}
              disabled={!product.inStock}
            >
              Add to My Room
            </button>
            <button 
              className="back-btn"
              onClick={() => navigate('/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 