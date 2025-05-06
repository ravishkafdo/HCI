import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./MyInventory.css";
import { AuthContext } from "../../App";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// 3D Model component 
const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={2}
    />
  );
};

const MyInventory = () => {
  const [roomItems, setRoomItems] = useState([]);
  const [allFurniture, setAllFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingModel, setViewingModel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const isAdmin = authState.isAuthenticated && authState.user?.role === "admin";
  
  // Load room items and all furniture from backend/localStorage
  useEffect(() => {
    setLoading(true);
    
    const fetchAllProducts = async () => {
      try {
        // Fetch all products from the backend
        const response = await fetch('http://localhost:5001/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        // Make sure we're using the correct property from the response
        const products = data.products || data || [];
        
        if (!Array.isArray(products)) {
          console.error('Products data is not an array:', products);
          setAllFurniture([]);
        } else {
          setAllFurniture(products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
        // Fallback to empty array if fetch fails
        setAllFurniture([]);
      }
    };
    
    const loadSavedItems = () => {
      try {
        // Load user's saved items
        const savedItems = JSON.parse(localStorage.getItem('roomItems') || '[]');
        setRoomItems(savedItems);
      } catch (error) {
        console.error('Error loading saved items:', error);
        setRoomItems([]);
      }
    };
    
    // Load both user items and products
    loadSavedItems();
    fetchAllProducts()
      .finally(() => {
        setLoading(false);
      });
    
  }, []);
  
  // Add item to user's inventory
  const handleSaveItem = (item) => {
    const exists = roomItems.some(savedItem => savedItem._id === item._id);
    
    if (!exists) {
      const newItems = [...roomItems, item];
      setRoomItems(newItems);
      localStorage.setItem('roomItems', JSON.stringify(newItems));
    }
  };
  
  // Remove item from inventory
  const handleRemoveItem = (itemId) => {
    const newItems = roomItems.filter(item => item._id !== itemId);
    setRoomItems(newItems);
    localStorage.setItem('roomItems', JSON.stringify(newItems));
  };
  
  // Clear entire inventory
  const handleClearInventory = () => {
    if (window.confirm('Are you sure you want to clear your entire inventory?')) {
      setRoomItems([]);
      localStorage.removeItem('roomItems');
    }
  };

  // Open 3D model view modal
  const handleViewModel = (item) => {
    setViewingModel(item);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setViewingModel(null);
  };

  // Handle add furniture action based on user role
  const handleAddFurniture = () => {
    if (isAdmin) {
      navigate('/admin/products/new');
    }
  };
  
  // Safely render products list
  const renderProductList = () => {
    if (!Array.isArray(allFurniture)) {
      return (
        <div className="no-products">
          <p>Unable to load products.</p>
        </div>
      );
    }
    
    if (allFurniture.length === 0) {
      return (
        <div className="no-products">
          <p>No products available.</p>
        </div>
      );
    }
    
    return (
      <div className="available-furniture-list">
        {allFurniture.map(item => (
          <div key={item._id} className="available-furniture-item">
            <div className="furniture-image">
              <img 
                src={item.thumbnail?.startsWith('http') ? item.thumbnail : `http://localhost:5001${item.thumbnail}`} 
                alt={item.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <button 
                className="save-button"
                onClick={() => handleSaveItem(item)}
                disabled={roomItems.some(savedItem => savedItem._id === item._id)}
              >
                {roomItems.some(savedItem => savedItem._id === item._id) ? 
                  <span className="saved-icon">✓</span> : 
                  <span className="save-icon">+</span>
                }
              </button>
            </div>
            <div className="furniture-info">
              <h4>{item.title}</h4>
              <p className="furniture-price">${item.price?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="inventory-main-container">
      {/* User's Saved Items (Left Panel) */}
      <div className="inventory-page">
        <div className="inventory-header">
          <h1>My Furniture Inventory</h1>
          <div className="inventory-actions">
            <button
              className="view-room-btn"
              onClick={() => navigate('/my-room')}
            >
              View 3D Room
            </button>
            {isAdmin && (
              <button
                className="shop-btn"
                onClick={handleAddFurniture}
              >
                Add New Furniture
              </button>
            )}
            {roomItems.length > 0 && (
              <button
                className="clear-btn"
                onClick={handleClearInventory}
              >
                Clear Inventory
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading inventory...</p>
          </div>
        ) : roomItems.length === 0 ? (
          <div className="empty-inventory">
            <p>Your inventory is empty.</p>
            {isAdmin && (
              <button onClick={handleAddFurniture}>
                Add New Furniture
              </button>
            )}
          </div>
        ) : (
          <div className="inventory-grid">
            {roomItems.map(item => (
              <div key={item._id} className="inventory-item">
                <div className="item-image">
                  <img 
                    src={item.thumbnail?.startsWith('http') ? item.thumbnail : `http://localhost:5001${item.thumbnail}`} 
                    alt={item.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-price">${item.price?.toFixed(2) || '0.00'}</p>
                  <div className="item-dimensions">
                    <span>Dimensions: </span>
                    {item.dimensions?.width || 0} × {item.dimensions?.height || 0} × {item.dimensions?.length || 0} cm
                  </div>
                </div>
                <div className="item-actions saved-item-actions">
                  <button 
                    className="view-3d-btn"
                    onClick={() => handleViewModel(item)}
                  >
                    <span className="view-icon">👁️</span>
                    View 3D
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item._id)}
                  >
                    <span className="remove-icon">🗑️</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="admin-actions">
            <button 
              className="admin-btn"
              onClick={() => navigate('/admin/products/new')}
            >
              Add New Product
            </button>
            <button 
              className="admin-btn"
              onClick={() => navigate('/admin')}
            >
              Manage Products
            </button>
          </div>
        )}
      </div>
      
      {/* All Available Furniture (Right Panel) */}
      <div className="all-furniture-panel">
        <div className="panel-header">
          <h2>Available Furniture</h2>
        </div>
        
        {loading ? (
          <div className="panel-loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="panel-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : (
          renderProductList()
        )}
      </div>
      
      {/* 3D Model View Modal */}
      {modalOpen && viewingModel && (
        <div className="model-modal-overlay" onClick={closeModal}>
          <div className="model-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>×</button>
            <h3>{viewingModel.title} - 3D View</h3>
            <div className="model-canvas-container">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Model 
                  url={viewingModel.modelUrl?.startsWith('http') ? 
                    viewingModel.modelUrl : 
                    `http://localhost:5001${viewingModel.modelUrl}`} 
                />
                <OrbitControls />
              </Canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInventory; 