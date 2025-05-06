import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import "./Design.css";
import { AuthContext } from "../../App";
import { Vector3, DoubleSide, Color, PlaneGeometry, MeshStandardMaterial } from "three";

// --- Helper Wall Component ---
const Wall = React.forwardRef(({ colorInstance, geometryArgs, ...props }, ref) => {
  return (
    <mesh ref={ref} {...props} receiveShadow>
      <planeGeometry args={geometryArgs} />
      <meshStandardMaterial
        key={`wall-mat-${colorInstance.getHexString()}`}
        color={colorInstance}
        transparent
        opacity={0.6} // Initial, controlled by useFrame
        side={DoubleSide}
      />
    </mesh>
  );
});
// --- End of Wall Component ---

// --- Completely New and Optimized Room Component ---
const NewRoom = ({ wallColors }) => {
  const frontWallRef = useRef();
  const backWallRef = useRef();
  const leftWallRef = useRef();
  const rightWallRef = useRef();

  const roomWidth = 20;
  const roomDepth = 20;
  const roomHeight = 5;

  // Memoize THREE.Color instances to prevent re-creation if string values are the same
  const memoizedWallColors = useMemo(() => ({
    front: new Color(wallColors.front),
    back: new Color(wallColors.back),
    left: new Color(wallColors.left),
    right: new Color(wallColors.right),
  }), [wallColors.front, wallColors.back, wallColors.left, wallColors.right]);

  useFrame(({ camera }) => {
    const walls = [
      { ref: frontWallRef, name: 'front' },
      { ref: backWallRef, name: 'back' },
      { ref: leftWallRef, name: 'left' },
      { ref: rightWallRef, name: 'right' },
    ];

    let allRefsExist = true;
    for (const wall of walls) {
      if (!wall.ref.current || !wall.ref.current.material) {
        allRefsExist = false;
        break;
      }
    }
    if (!allRefsExist) return;

    const direction = new Vector3();
    camera.getWorldDirection(direction);

    const absX = Math.abs(direction.x);
    const absZ = Math.abs(direction.z);

    walls.forEach(wall => {
      if (wall.ref.current) wall.ref.current.material.opacity = 0.6;
    });

    if (absX > absZ) { // Primarily X-axis
      if (direction.x < 0) { // Facing -X (Left wall)
        if (leftWallRef.current) leftWallRef.current.material.opacity = 0;
      } else { // Facing +X (Right wall)
        if (rightWallRef.current) rightWallRef.current.material.opacity = 0;
      }
    } else { // Primarily Z-axis
      if (direction.z < 0) { // Facing -Z (Back wall)
        if (backWallRef.current) backWallRef.current.material.opacity = 0;
      } else { // Facing +Z (Front wall)
        if (frontWallRef.current) frontWallRef.current.material.opacity = 0;
      }
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#BFBFBF" side={DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomHeight, 0]}>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#F0F0F0" side={DoubleSide} />
      </mesh>

      {/* Walls using the helper component */}
      <Wall ref={backWallRef} position={[0, roomHeight / 2, -roomDepth / 2]} geometryArgs={[roomWidth, roomHeight]} colorInstance={memoizedWallColors.back} />
      <Wall ref={frontWallRef} position={[0, roomHeight / 2, roomDepth / 2]} geometryArgs={[roomWidth, roomHeight]} colorInstance={memoizedWallColors.front} />
      <Wall ref={leftWallRef} position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} geometryArgs={[roomDepth, roomHeight]} colorInstance={memoizedWallColors.left} />
      <Wall ref={rightWallRef} position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]} geometryArgs={[roomDepth, roomHeight]} colorInstance={memoizedWallColors.right} />
    </group>
  );
};
// --- End of New Room Component ---

// Model component (for furniture - unchanged)
const Model = ({ url, position, rotation, onClick }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} rotation={rotation} onClick={onClick} scale={2} />;
};

const DESIGN_ROOM_HEIGHT = 5;
const DESIGN_ROOM_DEPTH = 20; 

export default function Design() {
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [designName, setDesignName] = useState("My Room Design");
  const [roomItems, setRoomItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFurnitureCatalog, setShowFurnitureCatalog] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false); // For item properties
  const [showWallColors, setShowWallColors] = useState(false);
  const [is3DView, setIs3DView] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [cameraPosition, setCameraPosition] = useState([0, DESIGN_ROOM_HEIGHT / 2, 10]);
  const [uniformWallColor, setUniformWallColor] = useState(true);
  const [wallColors, setWallColors] = useState({
    all: "#E0E0E0", front: "#E0E0E0", back: "#E0E0E0",
    left: "#D3D3D3", right: "#D3D3D3",
  });

  useEffect(() => {
    const itemsFromStorage = JSON.parse(localStorage.getItem("roomItems") || "[]");
    setSavedItems(itemsFromStorage);
    if (location.state?.selectedProduct) {
      const product = location.state.selectedProduct;
      handleAddToRoom(product);
      setDesignName(`${product.title} Design`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleAddToRoom = (item) => {
    const exists = roomItems.some((roomItem) => roomItem._id === item._id);
    if (!exists) {
      const newItem = { ...item, position: [0, 0.5, 0], rotation: [0, 0, 0] };
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

  const handleSaveDesign = () => {
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: location, message: 'Please login to save design' } });
      return;
    }
    localStorage.setItem("roomItems", JSON.stringify(roomItems));
    navigate("/my-room");
  };

  return (
    <div className="design-page">
      <div className="design-header">
        <div className="header-left">
          <input type="text" className="design-name-input" value={designName} onChange={(e) => setDesignName(e.target.value)} />
        </div>
        <div className="header-actions">
          <button className="icon-button" onClick={() => navigate("/")}>
            <span className="material-icons">home</span>
          </button>
          <button className="action-button save-button" onClick={handleSaveDesign}>Save & View Room</button>
        </div>
      </div>

      <div className="design-content">
        <div className="design-toolbar">
          <button className={`tool-button ${showFurnitureCatalog ? "active" : ""}`} onClick={() => { setShowFurnitureCatalog(!showFurnitureCatalog); setShowColorPalette(false); setShowWallColors(false); }}>
            <div className="tool-icon furniture-icon"></div><span>Furniture</span>
          </button>
          <button className={`tool-button ${showColorPalette ? "active" : ""}`} onClick={() => { setShowColorPalette(!showColorPalette); setShowFurnitureCatalog(false); setShowWallColors(false); }}>
            <div className="tool-icon colors-icon"></div><span>Item Colors</span>
          </button>
          <button className={`tool-button ${showWallColors ? "active" : ""}`} onClick={() => { setShowWallColors(!showWallColors); setShowFurnitureCatalog(false); setShowColorPalette(false); }}>
            <div className="tool-icon walls-icon"></div><span>Wall Colors</span>
          </button>
          <button className="tool-button" onClick={() => setIs3DView(!is3DView)}>
            <div className="tool-icon lighting-icon"></div><span>{is3DView ? "2D View" : "3D View"}</span>
          </button>
        </div>

        <div className="design-canvas-container">
          <div className="design-canvas">
            {is3DView ? (
              <Canvas shadows camera={{ position: cameraPosition, fov: 60, near: 0.1, far: 1000 }}>
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
                <pointLight position={[0, DESIGN_ROOM_HEIGHT * 0.75, 0]} intensity={0.5} distance={DESIGN_ROOM_DEPTH * 1.5} decay={2} />
                                
                <NewRoom wallColors={wallColors} /> {/* <-- Using the NewRoom component */}

                {roomItems.map((item, index) => (
                  <Model key={item._id || index} url={item.modelUrl?.startsWith('http') ? item.modelUrl : `http://localhost:5001${item.modelUrl}`} position={item.position} rotation={item.rotation} onClick={() => handleSelectItem(index)} />
                ))}

                <OrbitControls 
                  minDistance={1} 
                  maxDistance={30}
                  enablePan={true}
                  enableZoom={true}
                  target={[0, DESIGN_ROOM_HEIGHT / 2, 0]}
                  onChange={(event) => {
                    if (event?.target?.object?.position) {
                      const camPos = event.target.object.position;
                      setCameraPosition([camPos.x, camPos.y, camPos.z]);
                    }
                  }}
                />
              </Canvas>
            ) : (
              <div className="2d-view-placeholder"><p>2D View Coming Soon</p></div>
            )}
          </div>
        </div>

        {/* Panels (Furniture Catalog, Wall Colors, Item Properties) */}
        {showFurnitureCatalog && (
          <div className="catalog-panel">
            <div className="panel-header"><h3>Add Furniture</h3><button className="close-button" onClick={() => setShowFurnitureCatalog(false)}>×</button></div>
            <div className="catalog-tabs"><button className="tab-button active">Saved Items</button><button className="tab-button" onClick={() => navigate("/products")}>Browse More</button></div>
            <div className="catalog-items">
              {savedItems.length === 0 ? (
                <div className="empty-catalog"><p>No saved furniture items found.</p><button className="browse-button" onClick={() => navigate("/products")}>Browse Products</button></div>
              ) : (
                savedItems.map((item, index) => (
                  <div key={item._id || index} className="catalog-item">
                    <div className="catalog-thumbnail"><img src={item.thumbnail?.startsWith('http') ? item.thumbnail : `http://localhost:5001${item.thumbnail}`} alt={item.title} onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }} /></div>
                    <div className="catalog-details">
                      <h4>{item.title}</h4><p className="catalog-price">${item.price?.toFixed(2) || '0.00'}</p>
                      <button className="add-button" onClick={() => handleAddToRoom(item)} disabled={roomItems.some(ri => ri._id === item._id)}>{roomItems.some(ri => ri._id === item._id) ? "Added" : "Add to Room"}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showWallColors && (
          <div className="wall-colors-panel">
            <div className="panel-header"><h3>Wall Colors</h3><button className="close-button" onClick={() => setShowWallColors(false)}>×</button></div>
            <div className="wall-color-section">
              <div className="uniform-color-toggle"><label className="toggle-label"><input type="checkbox" checked={uniformWallColor} onChange={() => setUniformWallColor(!uniformWallColor)} /><span>Color all walls uniformly</span></label></div>
              {uniformWallColor ? (
                <div className="color-picker-section">
                  <h4 style={{'--current-color-indicator': wallColors.all }}>All Walls</h4>
                  <div className="color-presets"> {['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#FFCDD2', '#E1BEE7', '#BBDEFB', '#C8E6C9'].map(c => <div key={c} className={`color-preset ${wallColors.all === c ? 'selected' : ''}`} style={{ backgroundColor: c }} onClick={() => handleWallColorChange('all', c)} />)}</div>
                  <input type="color" value={wallColors.all} onChange={(e) => handleWallColorChange('all', e.target.value)} className="color-input" />
                </div>
              ) : (
                <div className="individual-walls">
                  {['front', 'back', 'left', 'right'].map(ws => (
                    <div className="color-picker-section" key={ws}>
                      <h4 style={{'--current-color-indicator': wallColors[ws] }}>{ws.charAt(0).toUpperCase() + ws.slice(1)} Wall</h4>
                      <div className="color-presets"> {['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#FFCDD2', '#E1BEE7', '#BBDEFB', '#C8E6C9'].map(c => <div key={`${ws}-${c}`} className={`color-preset ${wallColors[ws] === c ? 'selected' : ''}`} style={{ backgroundColor: c }} onClick={() => handleWallColorChange(ws, c)} />)}</div>
                      <input type="color" value={wallColors[ws]} onChange={(e) => handleWallColorChange(ws, e.target.value)} className="color-input" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedItem !== null && roomItems[selectedItem] && showColorPalette && (
          <div className="colors-panel property-panel"> {/* Item Properties Panel */}
            <div className="panel-header"><h3>{roomItems[selectedItem].title} Properties</h3><button className="close-button" onClick={() => setSelectedItem(null)}>×</button></div>
            <div className="property-section">
              <h4>Position</h4>
              <div className="slider-group"><label>X: {roomItems[selectedItem].position[0].toFixed(1)}</label><input type="range" min="-10" max="10" step="0.1" value={roomItems[selectedItem].position[0]} onChange={(e) => handlePositionChange(0, e.target.value)} className="position-slider"/></div>
              <div className="slider-group"><label>Y: {roomItems[selectedItem].position[1].toFixed(1)}</label><input type="range" min="0" max="5" step="0.1" value={roomItems[selectedItem].position[1]} onChange={(e) => handlePositionChange(1, e.target.value)} className="position-slider"/></div>
              <div className="slider-group"><label>Z: {roomItems[selectedItem].position[2].toFixed(1)}</label><input type="range" min="-10" max="10" step="0.1" value={roomItems[selectedItem].position[2]} onChange={(e) => handlePositionChange(2, e.target.value)} className="position-slider"/></div>
            </div>
            <div className="property-section">
              <h4>Rotation (Y-axis)</h4>
              <div className="slider-group"><label>{(roomItems[selectedItem].rotation[1] * 180 / Math.PI).toFixed(0)}°</label><input type="range" min="0" max={Math.PI * 2} step="0.01" value={roomItems[selectedItem].rotation[1]} onChange={(e) => handleRotationChange(1, e.target.value)} className="rotation-slider"/></div>
            </div>
            <button className="remove-button" onClick={() => handleRemoveItem(selectedItem)}>Remove from Room</button>
          </div>
        )}
      </div>
    </div>
  );
}