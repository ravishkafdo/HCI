import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import "./Design.css";
import { AuthContext } from "../../App";

// Wall Component
const Wall = React.forwardRef(({ colorInstance, geometryArgs, ...props }, ref) => {
  return (
    <mesh ref={ref} {...props} receiveShadow>
      <planeGeometry args={geometryArgs} />
      <meshStandardMaterial
        key={`wall-mat-${colorInstance.getHexString()}`}
        color={colorInstance}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

const Room = ({ wallColors, floorColor, ceilingColor, dimensions }) => {
  const frontWallRef = useRef();
  const backWallRef = useRef();
  const leftWallRef = useRef();
  const rightWallRef = useRef();

  const { width, depth, height } = dimensions;

  // Memoize colors
  const memoizedWallColors = useMemo(() => ({
    front: new THREE.Color(wallColors.front),
    back: new THREE.Color(wallColors.back),
    left: new THREE.Color(wallColors.left),
    right: new THREE.Color(wallColors.right),
  }), [wallColors]);

  const memoizedFloorColor = useMemo(() => new THREE.Color(floorColor), [floorColor]);
  const memoizedCeilingColor = useMemo(() => new THREE.Color(ceilingColor), [ceilingColor]);

  // Improved wall visibility handling
  useFrame(({ camera }) => {
    if (!frontWallRef.current || !backWallRef.current || 
        !leftWallRef.current || !rightWallRef.current) return;

    // Get camera position relative to room center
    const cameraPos = camera.position.clone();
    
    // Calculate which walls are between camera and room center
    const hideFront = cameraPos.z > depth/2; // Camera is in front of front wall
    const hideBack = cameraPos.z < -depth/2; // Camera is behind back wall
    const hideLeft = cameraPos.x < -width/2; // Camera is left of left wall
    const hideRight = cameraPos.x > width/2; // Camera is right of right wall

    // Only hide walls when camera is outside
    const isOutside = hideFront || hideBack || hideLeft || hideRight || cameraPos.y > height;

    if (isOutside) {
      // Hide walls that are between camera and room center
      frontWallRef.current.material.opacity = hideFront ? 0 : 0.6;
      backWallRef.current.material.opacity = hideBack ? 0 : 0.6;
      leftWallRef.current.material.opacity = hideLeft ? 0 : 0.6;
      rightWallRef.current.material.opacity = hideRight ? 0 : 0.6;

      // Special case: when looking diagonally from a corner, ensure we don't hide too many walls
      const diagonalView = 
        (hideFront && hideLeft) || 
        (hideFront && hideRight) || 
        (hideBack && hideLeft) || 
        (hideBack && hideRight);

      if (diagonalView) {
        // When looking from a corner, keep one side wall visible
        if (hideFront && hideLeft) {
          rightWallRef.current.material.opacity = 0.6;
        } else if (hideFront && hideRight) {
          leftWallRef.current.material.opacity = 0.6;
        } else if (hideBack && hideLeft) {
          rightWallRef.current.material.opacity = 0.6;
        } else if (hideBack && hideRight) {
          leftWallRef.current.material.opacity = 0.6;
        }
      }
    } else {
      // Inside the room - show all walls
      frontWallRef.current.material.opacity = 0.6;
      backWallRef.current.material.opacity = 0.6;
      leftWallRef.current.material.opacity = 0.6;
      rightWallRef.current.material.opacity = 0.6;
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={memoizedFloorColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={memoizedCeilingColor} side={THREE.DoubleSide} />
      </mesh>

      {/* All four walls */}
      <Wall 
        ref={backWallRef} 
        position={[0, height / 2, -depth / 2]} 
        geometryArgs={[width, height]} 
        colorInstance={memoizedWallColors.back} 
      />
      <Wall 
        ref={frontWallRef} 
        position={[0, height / 2, depth / 2]} 
        geometryArgs={[width, height]} 
        colorInstance={memoizedWallColors.front} 
      />
      <Wall 
        ref={leftWallRef} 
        position={[-width / 2, height / 2, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        geometryArgs={[depth, height]} 
        colorInstance={memoizedWallColors.left} 
      />
      <Wall 
        ref={rightWallRef} 
        position={[width / 2, height / 2, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        geometryArgs={[depth, height]} 
        colorInstance={memoizedWallColors.right} 
      />
    </group>
  );
};

// Model component for furniture
const Model = ({ url, position, rotation, onClick, scale = 1 }) => {
  const { scene } = useGLTF(url);
  const meshRef = useRef();
  
  // Ensure furniture sits on the floor
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1];
    }
  }, [position]);

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      position={position}
      rotation={rotation}
      onClick={onClick}
      scale={scale}
      castShadow
    />
  );
};

// 2D View Component
const TwoDView = ({ dimensions, roomItems }) => {
  const { width, depth } = dimensions;
  const scale = 20; // Scale factor for SVG coordinates

  return (
    <div className="two-d-view">
      <svg viewBox={`${-width/2*scale} ${-depth/2*scale} ${width*scale} ${depth*scale}`}>
        {/* Room outline */}
        <rect 
          x={-width/2*scale} 
          y={-depth/2*scale} 
          width={width*scale} 
          height={depth*scale} 
          fill="#f8f9fa" 
          stroke="#2d3436" 
          strokeWidth="2"
        />
        
        {/* Furniture items */}
        {roomItems.map((item, index) => (
          <rect
            key={index}
            x={item.position[0]*scale - 5} 
            y={-item.position[2]*scale - 5} // Invert Z for SVG Y
            width="10"
            height="10"
            fill="#6c5ce7"
            stroke="#2d3436"
            strokeWidth="1"
            transform={`rotate(${-item.rotation[1] * 180 / Math.PI} ${item.position[0]*scale} ${-item.position[2]*scale})`}
          />
        ))}
      </svg>
    </div>
  );
};

export default function Design() {
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [designName, setDesignName] = useState("My Room Design");
  const [roomItems, setRoomItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFurnitureCatalog, setShowFurnitureCatalog] = useState(false);
  const [showWallColors, setShowWallColors] = useState(false);
  const [is3DView, setIs3DView] = useState(true);
  const [uniformWallColor, setUniformWallColor] = useState(true);
  const [wallColors, setWallColors] = useState({
    all: "#E0E0E0", front: "#E0E0E0", back: "#E0E0E0",
    left: "#D3D3D3", right: "#D3D3D3",
  });
  const [floorColor, setFloorColor] = useState("#BFBFBF");
  const [ceilingColor, setCeilingColor] = useState("#f5f5f5");
  const [dimensions, setDimensions] = useState({
    width: 20,
    depth: 20,
    height: 5
  });

  useEffect(() => {
    const itemsFromStorage = JSON.parse(localStorage.getItem("roomItems") || "[]");
    setSavedItems(itemsFromStorage);
    if (location.state?.selectedProduct) {
      const product = location.state.selectedProduct;
      handleAddToRoom(product);
      setDesignName(`${product.title} Design`);
    }
  }, [location.state]);

  const handleAddToRoom = (item) => {
    const exists = roomItems.some((roomItem) => roomItem._id === item._id);
    if (!exists) {
      // Set initial position with Y based on item height (assuming 0.5 is default height)
      const newItem = { 
        ...item, 
        position: [0, 0.5, 0], 
        rotation: [0, 0, 0],
        dimensions: item.dimensions || { width: 1, depth: 1, height: 1 }
      };
      setRoomItems([...roomItems, newItem]);
    }
  };

  const handleSelectItem = (index) => setSelectedItem(selectedItem === index ? null : index);

  const handleRemoveItem = (index) => {
    setRoomItems(roomItems.filter((_, i) => i !== index));
    setSelectedItem(null);
  };

  const handlePositionChange = (axis, value) => {
    if (selectedItem !== null && roomItems[selectedItem]) {
      const newItems = [...roomItems];
      const item = newItems[selectedItem];
      const newPosition = [...item.position];
      newPosition[axis] = parseFloat(value);
      newItems[selectedItem] = { ...item, position: newPosition };
      setRoomItems(newItems);
    }
  };

  const handleRotationChange = (axis, value) => {
    if (selectedItem !== null && roomItems[selectedItem]) {
      const newItems = [...roomItems];
      const item = newItems[selectedItem];
      const newRotation = [...item.rotation];
      newRotation[axis] = parseFloat(value);
      newItems[selectedItem] = { ...item, rotation: newRotation };
      setRoomItems(newItems);
    }
  };

  const handleWallColorChange = (wall, color) => {
    if (uniformWallColor && wall === 'all') {
      setWallColors({ all: color, front: color, back: color, left: color, right: color });
    } else if (!uniformWallColor) {
      setWallColors(prev => ({ ...prev, [wall]: color, all: '' }));
    }
  };

  const handleDimensionChange = (dimension, value) => {
    setDimensions(prev => ({
      ...prev,
      [dimension]: Math.max(5, Math.min(50, parseFloat(value) || 10))
    }));
  };

  const handleSaveDesign = async () => {
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: location, message: 'Please login to save design' } });
      return;
    }
    
    try {
      // Show loading indicator if needed
      
      // Save to database
      const designData = {
        name: designName,
        items: roomItems,
        wallColors,
        floorColor,
        ceilingColor,
        dimensions
      };
      
      // Log token for debugging
      console.log('Auth token:', authState.token);
      
      const response = await fetch('http://localhost:5001/api/room-designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authState.token ? { 'Authorization': `Bearer ${authState.token}` } : {})
        },
        body: JSON.stringify(designData),
        credentials: 'include'
      });
      
      if (response.status === 401) {
        console.error('Authentication error - please login again');
        navigate('/login', { state: { from: location, message: 'Your session has expired. Please login again.' } });
        return;
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save design');
      }
      
      // Also save to localStorage as a backup
      localStorage.setItem("roomItems", JSON.stringify(roomItems));
      
      // Navigate to the my-room page
      navigate("/my-room");
    } catch (error) {
      console.error('Error saving design:', error);
      // Handle error (show error message)
      alert('Failed to save design: ' + error.message);
    }
  };

  return (
    <div className="design-page">
      <div className="design-header">
        <input 
          type="text" 
          className="design-name-input" 
          value={designName} 
          onChange={(e) => setDesignName(e.target.value)} 
          placeholder="Room Design Name"
        />
        <div className="header-actions">
          <button className="save-button-design" onClick={handleSaveDesign}>
            Save Design
          </button>
        </div>
      </div>

      <div className="design-content">
        <div className="design-toolbar">
          <button 
            className={`tool-button ${showFurnitureCatalog ? "active" : ""}`} 
            onClick={() => setShowFurnitureCatalog(!showFurnitureCatalog)}
          >
            <div className="tool-icon furniture-icon"></div>
            <span>Furniture</span>
          </button>
          <button 
            className={`tool-button ${showWallColors ? "active" : ""}`} 
            onClick={() => setShowWallColors(!showWallColors)}
          >
            <div className="tool-icon walls-icon"></div>
            <span>Room Colors</span>
          </button>
          <button 
            className="tool-button" 
            onClick={() => setIs3DView(!is3DView)}
          >
            <div className="tool-icon lighting-icon"></div>
            <span>{is3DView ? "2D View" : "3D View"}</span>
          </button>
        </div>

        <div className="design-canvas-container">
          <div className="view-toggle-wrapper">
            <div className="view-toggle">
              <button 
                className={`view-button ${is3DView ? "active" : ""}`}
                onClick={() => setIs3DView(true)}
              >
                3D
              </button>
              <button 
                className={`view-button ${!is3DView ? "active" : ""}`}
                onClick={() => setIs3DView(false)}
              >
                2D
              </button>
            </div>
          </div>

          <div className="design-canvas">
            {is3DView ? (
              <Canvas 
                shadows 
                camera={{ 
                  position: [0, dimensions.height * 1.5, dimensions.depth * 0.75], 
                  fov: 50, 
                  near: 0.1, 
                  far: 1000 
                }}
              >
                <ambientLight intensity={0.8} />
                <directionalLight 
                  position={[8, 12, 10]} 
                  intensity={1.0} 
                  castShadow 
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-camera-far={50}
                  shadow-camera-left={-15}
                  shadow-camera-right={15}
                  shadow-camera-top={15}
                  shadow-camera-bottom={-15}
                />
                <pointLight position={[0, dimensions.height * 0.75, 0]} intensity={0.5} />
                
                <Room 
                  wallColors={wallColors} 
                  floorColor={floorColor}
                  ceilingColor={ceilingColor}
                  dimensions={dimensions}
                />

                {roomItems.map((item, index) => (
                  <Model 
                    key={item._id || index} 
                    url={item.modelUrl?.startsWith('http') ? item.modelUrl : `http://localhost:5001${item.modelUrl}`} 
                    position={item.position} 
                    rotation={item.rotation}
                    scale={item.scale || 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem(index);
                    }}
                  />
                ))}

                <OrbitControls 
                  minDistance={1} 
                  maxDistance={50}
                  enablePan={true}
                  enableZoom={true}
                  target={[0, dimensions.height / 2, 0]}
                />
              </Canvas>
            ) : (
              <TwoDView dimensions={dimensions} roomItems={roomItems} />
            )}
          </div>
        </div>

        {/* Furniture Catalog Panel */}
        {showFurnitureCatalog && (
          <div className="catalog-panel">
            <div className="panel-header">
              <h3>Add Furniture</h3>
              <button className="close-button" onClick={() => setShowFurnitureCatalog(false)}>×</button>
            </div>
            <div className="catalog-tabs">
              <button className="tab-button active">Saved Items</button>
              <button className="tab-button" onClick={() => navigate("/products")}>Browse More</button>
            </div>
            <div className="catalog-items">
              {savedItems.length === 0 ? (
                <div className="empty-catalog">
                  <p>No saved furniture items found.</p>
                  <button className="browse-button" onClick={() => navigate("/products")}>
                    Browse Products
                  </button>
                </div>
              ) : (
                savedItems.map((item, index) => (
                  <div key={item._id || index} className="catalog-item">
                    <div className="catalog-thumbnail">
                      <img 
                        src={item.thumbnail?.startsWith('http') ? item.thumbnail : `http://localhost:5001${item.thumbnail}`} 
                        alt={item.title} 
                      />
                    </div>
                    <div className="catalog-details">
                      <h4>{item.title}</h4>
                      <p className="catalog-price">${item.price?.toFixed(2) || '0.00'}</p>
                      <button 
                        className="add-button" 
                        onClick={() => handleAddToRoom(item)} 
                        disabled={roomItems.some(ri => ri._id === item._id)}
                      >
                        {roomItems.some(ri => ri._id === item._id) ? "Added" : "Add to Room"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Wall Colors Panel */}
        {showWallColors && (
          <div className="wall-colors-panel">
            <div className="panel-header">
              <h3>Room Colors</h3>
              <button className="close-button" onClick={() => setShowWallColors(false)}>×</button>
            </div>
            
            <div className="wall-color-section">
              <div className="uniform-color-toggle">
                <label className="toggle-label">
                  <input 
                    type="checkbox" 
                    checked={uniformWallColor} 
                    onChange={() => setUniformWallColor(!uniformWallColor)} 
                  />
                  <span>Color all walls uniformly</span>
                </label>
              </div>
              
              {uniformWallColor ? (
                <div className="color-picker-section">
                  <h4 style={{'--current-color-indicator': wallColors.all }}>All Walls</h4>
                  <div className="color-presets">
                    {['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#FFCDD2', '#E1BEE7', '#BBDEFB', '#C8E6C9'].map(c => (
                      <div 
                        key={c} 
                        className={`color-preset ${wallColors.all === c ? 'selected' : ''}`} 
                        style={{ backgroundColor: c }} 
                        onClick={() => handleWallColorChange('all', c)} 
                      />
                    ))}
                  </div>
                  <input 
                    type="color" 
                    value={wallColors.all} 
                    onChange={(e) => handleWallColorChange('all', e.target.value)} 
                    className="color-input" 
                  />
                </div>
              ) : (
                <div className="individual-walls">
                  {['front', 'back', 'left', 'right'].map(ws => (
                    <div className="color-picker-section" key={ws}>
                      <h4 style={{'--current-color-indicator': wallColors[ws] }}>
                        {ws.charAt(0).toUpperCase() + ws.slice(1)} Wall
                      </h4>
                      <div className="color-presets">
                        {['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#FFCDD2', '#E1BEE7', '#BBDEFB', '#C8E6C9'].map(c => (
                          <div 
                            key={`${ws}-${c}`} 
                            className={`color-preset ${wallColors[ws] === c ? 'selected' : ''}`} 
                            style={{ backgroundColor: c }} 
                            onClick={() => handleWallColorChange(ws, c)} 
                          />
                        ))}
                      </div>
                      <input 
                        type="color" 
                        value={wallColors[ws]} 
                        onChange={(e) => handleWallColorChange(ws, e.target.value)} 
                        className="color-input" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Floor Color Section */}
            <div className="floor-color-section">
              <h4>Floor Color</h4>
              <div className="color-presets">
                {['#BFBFBF', '#9E9E9E', '#757575', '#616161', '#424242', '#795548', '#8D6E63', '#A1887F'].map(c => (
                  <div 
                    key={`floor-${c}`} 
                    className={`color-preset ${floorColor === c ? 'selected' : ''}`} 
                    style={{ backgroundColor: c }} 
                    onClick={() => setFloorColor(c)} 
                  />
                ))}
              </div>
              <input 
                type="color" 
                value={floorColor} 
                onChange={(e) => setFloorColor(e.target.value)} 
                className="color-input" 
              />
            </div>
            
            {/* Ceiling Color Section */}
            <div className="floor-color-section">
              <h4>Ceiling Color</h4>
              <div className="color-presets">
                {['#f5f5f5', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#ffffff', '#e1bee7', '#bbdefb', '#c8e6c9'].map(c => (
                  <div 
                    key={`ceiling-${c}`} 
                    className={`color-preset ${ceilingColor === c ? 'selected' : ''}`} 
                    style={{ backgroundColor: c }} 
                    onClick={() => setCeilingColor(c)} 
                  />
                ))}
              </div>
              <input 
                type="color" 
                value={ceilingColor} 
                onChange={(e) => setCeilingColor(e.target.value)} 
                className="color-input" 
              />
            </div>
            
            {/* Room Dimensions Section */}
            <div className="room-dimensions">
              <h4>Room Dimensions (meters)</h4>
              <div className="dimension-control">
                <label>Width</label>
                <input 
                  type="number" 
                  min="5" 
                  max="50" 
                  step="0.5" 
                  value={dimensions.width} 
                  onChange={(e) => handleDimensionChange('width', e.target.value)} 
                />
              </div>
              <div className="dimension-control">
                <label>Depth</label>
                <input 
                  type="number" 
                  min="5" 
                  max="50" 
                  step="0.5" 
                  value={dimensions.depth} 
                  onChange={(e) => handleDimensionChange('depth', e.target.value)} 
                />
              </div>
              <div className="dimension-control">
                <label>Height</label>
                <input 
                  type="number" 
                  min="2.5" 
                  max="10" 
                  step="0.25" 
                  value={dimensions.height} 
                  onChange={(e) => handleDimensionChange('height', e.target.value)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected Item Properties Panel */}
        {selectedItem !== null && roomItems[selectedItem] && (
          <div className="colors-panel property-panel">
            <div className="panel-header">
              <h3>{roomItems[selectedItem].title} Properties</h3>
              <button className="close-button" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            <div className="property-section">
              <h4>Position</h4>
              <div className="slider-group">
                <label>X: {roomItems[selectedItem].position[0].toFixed(1)}</label>
                <input 
                  type="range" 
                  min={-dimensions.width/2} 
                  max={dimensions.width/2} 
                  step="0.1" 
                  value={roomItems[selectedItem].position[0]} 
                  onChange={(e) => handlePositionChange(0, e.target.value)} 
                  className="position-slider"
                />
              </div>
              <div className="slider-group">
                <label>Y: {roomItems[selectedItem].position[1].toFixed(1)}</label>
                <input 
                  type="range" 
                  min="0" 
                  max={dimensions.height} 
                  step="0.1" 
                  value={roomItems[selectedItem].position[1]} 
                  onChange={(e) => handlePositionChange(1, e.target.value)} 
                  className="position-slider"
                />
              </div>
              <div className="slider-group">
                <label>Z: {roomItems[selectedItem].position[2].toFixed(1)}</label>
                <input 
                  type="range" 
                  min={-dimensions.depth/2} 
                  max={dimensions.depth/2} 
                  step="0.1" 
                  value={roomItems[selectedItem].position[2]} 
                  onChange={(e) => handlePositionChange(2, e.target.value)} 
                  className="position-slider"
                />
              </div>
            </div>
            <div className="property-section">
              <h4>Rotation (Y-axis)</h4>
              <div className="slider-group">
                <label>{(roomItems[selectedItem].rotation[1] * 180 / Math.PI).toFixed(0)}°</label>
                <input 
                  type="range" 
                  min="0" 
                  max={Math.PI * 2} 
                  step="0.01" 
                  value={roomItems[selectedItem].rotation[1]} 
                  onChange={(e) => handleRotationChange(1, e.target.value)} 
                  className="rotation-slider"
                />
              </div>
            </div>
            <button 
              className="remove-button" 
              onClick={() => handleRemoveItem(selectedItem)}
            >
              Remove from Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}