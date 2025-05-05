import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyInventory.css";

const MyInventory = () => {
  const [roomItems, setRoomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load room items from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const savedItems = JSON.parse(localStorage.getItem('roomItems') || '[]');
      setRoomItems(savedItems);
    } catch (error) {
      console.error('Error loading room items:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
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
  
  return (
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
          <button
            className="shop-btn"
            onClick={() => navigate('/products')}
          >
            Add More Furniture
          </button>
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
          <p>Your inventory is empty. Add furniture from the products page.</p>
          <button onClick={() => navigate('/products')}>
            Browse Furniture
          </button>
        </div>
      ) : (
        <div className="inventory-grid">
          {roomItems.map(item => (
            <div key={item._id} className="inventory-item">
              <div className="item-image">
                <img 
                  src={`http://localhost:5001${item.thumbnail}`} 
                  alt={item.title} 
                />
              </div>
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-category">{item.category}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>
                <div className="item-dimensions">
                  <span>Dimensions: </span>
                  {item.dimensions.width} × {item.dimensions.height} × {item.dimensions.length} cm
                </div>
              </div>
              <div className="item-actions">
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/products/${item._id}`)}
                >
                  View Details
                </button>
                <button 
                  className="room-btn"
                  onClick={() => navigate('/my-room')}
                >
                  View in Room
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
    </div>
  );
};

export default MyInventory; 