import React, { useState, useEffect, Suspense, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  TransformControls,
  Grid,
  Html
} from "@react-three/drei";
import { Vector3 } from "three";
import { useNavigate } from "react-router-dom";
import "./MyRoom.css";

// 3D Model component with transformations
const FurnitureModel = ({ item, selected, onClick, onPositionChange, onRotationChange }) => {
  const { scene } = useGLTF(`http://localhost:5001${item.modelUrl}`);
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      // Update position when it changes
      if (item.position) {
        ref.current.position.set(...item.position);
      }
      
      // Update rotation when it changes
      if (item.rotation) {
        ref.current.rotation.set(...item.rotation);
      }
    }
  }, [item]);
  
  return (
    <>
      <TransformControls
        object={ref}
        mode={selected ? "translate" : null}
        showX={selected}
        showY={selected}
        showZ={selected}
        onObjectChange={() => {
          if (ref.current) {
            // Get current position
            const newPosition = [
              ref.current.position.x,
              ref.current.position.y,
              ref.current.position.z
            ];
            onPositionChange(item._id, newPosition);
            
            // Get current rotation
            const newRotation = [
              ref.current.rotation.x,
              ref.current.rotation.y,
              ref.current.rotation.z
            ];
            onRotationChange(item._id, newRotation);
          }
        }}
      />
      <primitive 
        ref={ref}
        object={scene} 
        scale={2}
        onClick={(e) => {
          e.stopPropagation();
          onClick(item._id);
        }}
      />
      {selected && (
        <Html position={[0, 2, 0]} center>
          <div className="model-label">{item.title}</div>
        </Html>
      )}
    </>
  );
};

// Room floor and walls
const Room = ({ showWalls }) => {
  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Walls (only shown if showWalls is true) */}
      {showWalls && (
        <>
          {/* Back wall */}
          <mesh position={[0, 5, -10]} receiveShadow>
            <boxGeometry args={[20, 10, 0.2]} />
            <meshStandardMaterial color="#e1e1e1" />
          </mesh>
          
          {/* Left wall */}
          <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[20, 10, 0.2]} />
            <meshStandardMaterial color="#d5d5d5" />
          </mesh>
          
          {/* Right wall */}
          <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[20, 10, 0.2]} />
            <meshStandardMaterial color="#d5d5d5" />
          </mesh>
        </>
      )}
      
      {/* Grid for better position reference */}
      <Grid 
        infiniteGrid 
        cellSize={1}
        sectionSize={3}
        cellThickness={0.5}
        sectionThickness={1}
        cellColor="#6f6f6f"
        sectionColor="#9d4b4b"
        fadeDistance={30}
        fadeStrength={1.5}
      />
    </group>
  );
};

// Camera controls
const CameraController = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set camera position
    camera.position.set(0, 10, 15);
    camera.lookAt(new Vector3(0, 0, 0));
  }, [camera]);
  
  return null;
};

const MyRoom = () => {
  const [roomItems, setRoomItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showWalls, setShowWalls] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Load furniture items from localStorage on component mount
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('roomItems') || '[]');
    setRoomItems(savedItems);
  }, []);
  
  // Save updated position
  const handlePositionChange = (itemId, position) => {
    setRoomItems(prev => 
      prev.map(item => 
        item._id === itemId 
          ? { ...item, position }
          : item
      )
    );
  };
  
  // Save updated rotation
  const handleRotationChange = (itemId, rotation) => {
    setRoomItems(prev => 
      prev.map(item => 
        item._id === itemId 
          ? { ...item, rotation }
          : item
      )
    );
  };
  
  // Handle item selection
  const handleSelectItem = (itemId) => {
    setSelectedItem(prev => prev === itemId ? null : itemId);
  };
  
  // Clear selection when clicking empty space
  const handleCanvasClick = () => {
    setSelectedItem(null);
  };
  
  // Remove furniture from room
  const handleRemoveItem = (itemId) => {
    setRoomItems(prev => prev.filter(item => item._id !== itemId));
    setSelectedItem(null);
    
    // Update localStorage
    const newItems = roomItems.filter(item => item._id !== itemId);
    localStorage.setItem('roomItems', JSON.stringify(newItems));
  };
  
  // Save room layout
  const handleSaveRoom = async () => {
    if (!roomItems.length) return;
    
    setIsSaving(true);
    
    try {
      // In a real app, this would save to the backend
      // const response = await fetch('http://localhost:5001/api/rooms', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     name: 'My Room',
      //     items: roomItems
      //   })
      // });
      
      // For now, just save to localStorage
      localStorage.setItem('roomItems', JSON.stringify(roomItems));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving room:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle wall visibility
  const handleToggleWalls = () => {
    setShowWalls(prev => !prev);
  };
  
  return (
    <div className="my-room-page">
      <div className="room-header">
        <h1>My Custom Room</h1>
        <div className="room-actions">
          <button
            className="toggle-walls-btn"
            onClick={handleToggleWalls}
          >
            {showWalls ? 'Hide Walls' : 'Show Walls'}
          </button>
          <button
            className="save-room-btn"
            onClick={handleSaveRoom}
            disabled={isSaving || !roomItems.length}
          >
            {isSaving ? 'Saving...' : 'Save Room Layout'}
          </button>
          <button
            className="inventory-btn"
            onClick={() => navigate('/my-inventory')}
          >
            View Inventory
          </button>
          <button
            className="shop-btn"
            onClick={() => navigate('/products')}
          >
            Browse More Furniture
          </button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="save-success">
          <p>Room layout saved successfully!</p>
        </div>
      )}
      
      <div className="room-container">
        <div className="room-canvas">
          <Canvas shadows camera={{ position: [0, 10, 15], fov: 50 }}>
            <CameraController />
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize-width={2048} 
              shadow-mapSize-height={2048}
            />
            <Suspense fallback={null}>
              <Room showWalls={showWalls} />
              {roomItems.map(item => (
                <FurnitureModel 
                  key={item._id}
                  item={item}
                  selected={selectedItem === item._id}
                  onClick={handleSelectItem}
                  onPositionChange={handlePositionChange}
                  onRotationChange={handleRotationChange}
                />
              ))}
            </Suspense>
            <OrbitControls 
              maxPolarAngle={Math.PI / 2} 
              enablePan 
              enableZoom 
              enableRotate 
            />
            <gridHelper args={[20, 20]} />
          </Canvas>
        </div>
        
        <div className="room-sidebar">
          <h2>My Furniture</h2>
          {roomItems.length === 0 ? (
            <div className="empty-room">
              <p>Your room is empty. Add furniture from the products page.</p>
              <button onClick={() => navigate('/products')}>
                Browse Furniture
              </button>
            </div>
          ) : (
            <ul className="room-items-list">
              {roomItems.map(item => (
                <li 
                  key={item._id} 
                  className={`room-item ${selectedItem === item._id ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item._id)}
                >
                  <div className="item-image">
                    <img 
                      src={`http://localhost:5001${item.thumbnail}`} 
                      alt={item.title}
                    />
                  </div>
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <div className="item-actions">
                      <button 
                        className="select-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item._id);
                        }}
                      >
                        {selectedItem === item._id ? 'Deselect' : 'Select'}
                      </button>
                      <button 
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item._id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          <div className="controls-help">
            <h3>Room Controls</h3>
            <ul>
              <li><strong>Select furniture:</strong> Click on an item in the list or in the room</li>
              <li><strong>Move furniture:</strong> Drag the arrows when an item is selected</li>
              <li><strong>Rotate view:</strong> Click and drag with right mouse button</li>
              <li><strong>Zoom:</strong> Use mouse wheel to zoom in/out</li>
              <li><strong>Pan:</strong> Click and drag with middle mouse button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRoom; 