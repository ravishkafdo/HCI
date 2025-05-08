import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./MyInventory.css";
import { AuthContext } from "../../App";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

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
  
  useEffect(() => {
    setLoading(true);
    
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
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
        setAllFurniture([]);
      }
    };
    
    const loadSavedItems = () => {
      try {
        const savedItems = JSON.parse(localStorage.getItem('roomItems') || '[]');
        setRoomItems(savedItems);
      } catch (error) {
        console.error('Error loading saved items:', error);
        setRoomItems([]);
      }
    };
    
    loadSavedItems();
    fetchAllProducts()
      .finally(() => {
        setLoading(false);
      });
    
  }, []);
  
  const handleSaveItem = (item) => {
    const exists = roomItems.some(savedItem => savedItem._id === item._id);
    
    if (!exists) {
      const newItems = [...roomItems, item];
      setRoomItems(newItems);
      localStorage.setItem('roomItems', JSON.stringify(newItems));
    }
  };
  
  const handleRemoveItem = (itemId) => {
    const newItems = roomItems.filter(item => item._id !== itemId);
    setRoomItems(newItems);
    localStorage.setItem('roomItems', JSON.stringify(newItems));
  };
  
  const handleClearInventory = () => {
    if (window.confirm('Are you sure you want to clear your entire inventory?')) {
      setRoomItems([]);
      localStorage.removeItem('roomItems');
    }
  };

  const handleViewModel = (item) => {
    setViewingModel(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setViewingModel(null);
  };

  const handleAddFurniture = () => {
    if (isAdmin) {
      navigate('/admin/products/new');
    }
  };
  
  const renderProductList = () => {
    if (!Array.isArray(allFurniture)) {
      return (
        <div className="no-products">
          <p>Unable to load products.</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      );
    }
    
    if (allFurniture.length === 0) {
      return (
        <div className="no-products">
          <p>No products available.</p>
          {isAdmin && (
            <button onClick={handleAddFurniture}>Add New Product</button>
          )}
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
              <p className="furniture-price">Rs {item.price?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="inventory-main-container">
      <div className="inventory-layout">
        <div className="inventory-page">
          <div className="inventory-header">
            <h1>My Furniture Collection</h1>
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
                  Clear Collection
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your collection...</p>
            </div>
          ) : roomItems.length === 0 ? (
            <div className="empty-inventory">
              <p>Your furniture collection is empty.</p>
              {isAdmin ? (
                <button onClick={handleAddFurniture}>
                  Add New Furniture
                </button>
              ) : (
                <button onClick={() => navigate('/products')}>
                  Browse Furniture
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
                    <p className="item-price">Rs {item.price?.toFixed(2) || '0.00'}</p>
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
                      View 3D
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item._id)}
                    >
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
              <p>Error loading products: {error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : (
            renderProductList()
          )}
        </div>
      </div>
      
      {modalOpen && viewingModel && (
        <div className="model-modal-overlay" onClick={closeModal}>
          <div className="model-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>×</button>
            <h3>{viewingModel.title} - 3D Preview</h3>
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