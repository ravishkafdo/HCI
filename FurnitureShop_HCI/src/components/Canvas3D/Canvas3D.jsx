import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDesignStore } from "../../stores/designStore";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import "./Canvas3D.css";

// Room component to render walls and floor
function Room({ width, length, height, wallColor, floorColor }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, height / 2, -length / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      <mesh position={[0, height / 2, length / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}

// Simple furniture component
function SimpleFurniture({ item, isSelected, onSelect }) {
  // Get dimensions
  const width = (item.dimensions?.width || 50) / 100;
  const height = (item.dimensions?.height || 50) / 100;
  const depth = (item.dimensions?.length || 50) / 100;
  
  // Position and rotation
  const position = [
    item.position?.x || 0,
    height / 2, // Center height
    item.position?.z || 0
  ];
  
  const [hovered, setHovered] = useState(false);
  
  return (
    <group>
      <mesh
        position={position}
        rotation={[0, item.rotation || 0, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={item.color || "#A0522D"} 
          emissive={hovered || isSelected ? "#555555" : "#000000"}
          emissiveIntensity={hovered || isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Selection outline */}
      {isSelected && (
        <mesh
          position={position}
          rotation={[0, item.rotation || 0, 0]}
        >
          <boxGeometry args={[width * 1.05, height * 1.05, depth * 1.05]} />
          <meshBasicMaterial color="#4a90e2" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Grid helper component
function FloorGrid({ size }) {
  return (
    <gridHelper 
      args={[size, size, "#888888", "#444444"]} 
      position={[0, 0.01, 0]}
    />
  );
}

// Controls panel component
function ControlsPanel({ selectedItem, updateItem, room, removeFurniture }) {
  if (!selectedItem) return null;
  
  const handlePositionChange = (axis, value) => {
    const position = { ...selectedItem.position };
    position[axis] = parseFloat(value);
    updateItem(selectedItem.id, { position });
  };
  
  const handleRotationChange = (value) => {
    updateItem(selectedItem.id, { rotation: parseFloat(value) });
  };
  
  const handleColorChange = (color) => {
    updateItem(selectedItem.id, { color });
  };
  
  const handleRemove = () => {
    if (removeFurniture) {
      removeFurniture(selectedItem.id);
    }
  };
  
  // Predefined colors
  const colors = [
    "#A0522D", "#8B4513", "#4682B4", "#708090", 
    "#333333", "#F5F5F5", "#B22222", "#2E8B57"
  ];
  
  return (
    <div className="controls-panel">
      <h3>{selectedItem.type} Controls</h3>
      
      <div className="control-row">
        <label>X Position</label>
        <input 
          type="range" 
          min={-room.width/2} 
          max={room.width/2} 
          step="0.1" 
          value={selectedItem.position?.x || 0} 
          onChange={(e) => handlePositionChange('x', e.target.value)} 
        />
        <span>{(selectedItem.position?.x || 0).toFixed(1)}</span>
      </div>
      
      <div className="control-row">
        <label>Z Position</label>
        <input 
          type="range" 
          min={-room.length/2} 
          max={room.length/2} 
          step="0.1" 
          value={selectedItem.position?.z || 0} 
          onChange={(e) => handlePositionChange('z', e.target.value)} 
        />
        <span>{(selectedItem.position?.z || 0).toFixed(1)}</span>
      </div>
      
      <div className="control-row">
        <label>Rotation</label>
        <input 
          type="range" 
          min="0" 
          max={Math.PI * 2} 
          step="0.1" 
          value={selectedItem.rotation || 0} 
          onChange={(e) => handleRotationChange(e.target.value)} 
        />
        <span>{Math.round(((selectedItem.rotation || 0) / (Math.PI * 2)) * 360)}°</span>
      </div>
      
      <div className="control-group">
        <label>Quick Rotate</label>
        <div className="button-row">
          <button onClick={() => handleRotationChange(0)}>0°</button>
          <button onClick={() => handleRotationChange(Math.PI / 2)}>90°</button>
          <button onClick={() => handleRotationChange(Math.PI)}>180°</button>
          <button onClick={() => handleRotationChange(Math.PI * 1.5)}>270°</button>
        </div>
      </div>
      
      <div className="control-group">
        <label>Color</label>
        <div className="color-grid">
          {colors.map(color => (
            <div
              key={color}
              className={`color-swatch ${selectedItem.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
      </div>
      
      <div className="control-group control-actions">
        <button className="remove-button" onClick={handleRemove}>
          Remove {selectedItem.type}
        </button>
      </div>
    </div>
  );
}

// Main Canvas3D component
export default function Canvas3D() {
  const room = useDesignStore((state) => state.room);
  const furniture = useDesignStore((state) => state.furniture);
  const updateFurniture = useDesignStore((state) => state.updateFurniture);
  const addFurniture = useDesignStore((state) => state.addFurniture);
  const removeFurniture = useDesignStore((state) => state.removeFurniture);
  
  const [selectedId, setSelectedId] = useState(null);
  
  // Get the selected item
  const selectedItem = furniture.find(item => item.id === selectedId);
  
  // Handle furniture selection
  const handleSelect = (id) => {
    setSelectedId(id === selectedId ? null : id);
  };
  
  // Handle clearing selection on canvas click
  const handleCanvasClick = () => {
    setSelectedId(null);
  };
  
  // Add furniture handler
  const handleAddFurniture = (type) => {
    const newId = Date.now().toString();
    
    // Define default dimensions based on furniture type
    let dimensions = { width: 50, height: 50, length: 50 };
    let color = "#A0522D";
    
    switch(type) {
      case "Chair":
        dimensions = { width: 50, height: 45, length: 50 };
        color = "#A0522D";
        break;
      case "Table":
        dimensions = { width: 150, height: 75, length: 150 };
        color = "#8B4513";
        break;
      case "Sofa":
        dimensions = { width: 200, height: 85, length: 90 };
        color = "#4682B4";
        break;
      case "Bed":
        dimensions = { width: 180, height: 50, length: 200 };
        color = "#6A5ACD";
        break;
      case "Bookshelf":
        dimensions = { width: 120, height: 180, length: 40 };
        color = "#8B8589";
        break;
      case "Wardrobe":
        dimensions = { width: 120, height: 200, length: 60 };
        color = "#CD853F";
        break;
      case "CoffeeTable":
        dimensions = { width: 100, height: 45, length: 60 };
        color = "#A0522D";
        break;
      case "FloorLamp":
        dimensions = { width: 30, height: 150, length: 30 };
        color = "#FFD700";
        break;
      default:
        break;
    }
    
    const newItem = {
      id: newId,
      type,
      position: { x: 0, y: 0, z: 0 },
      dimensions: dimensions,
      color: color,
      rotation: 0
    };
    
    addFurniture(newItem);
    setSelectedId(newId);
  };
  
  if (!room) return <div className="canvas-message">Please configure a room first</div>;
  
  return (
    <div className="canvas-container">
      <div className="canvas-toolbar">
        <button onClick={() => handleAddFurniture("Chair")}>Add Chair</button>
        <button onClick={() => handleAddFurniture("Table")}>Add Table</button>
        <button onClick={() => handleAddFurniture("Sofa")}>Add Sofa</button>
      </div>
      
      <div className="canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 50 }}
          onClick={(e) => {
            // Only clear selection if we clicked on the background
            if (e.object === e.eventObject) {
              handleCanvasClick();
            }
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[-5, 8, -5]} 
            intensity={0.6} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          
          <OrbitControls 
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={20}
          />
          
          <Room 
            width={room.width}
            length={room.length}
            height={room.height}
            wallColor={room.wallColor}
            floorColor={room.floorColor}
          />
          
          <FloorGrid size={Math.max(room.width, room.length) * 1.5} />
          
          {/* Render furniture */}
          {furniture.map(item => (
            <SimpleFurniture 
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={handleSelect}
            />
          ))}
        </Canvas>
      </div>
      
      {/* Controls panel for selected item */}
      {selectedItem && (
        <ControlsPanel 
          selectedItem={selectedItem}
          updateItem={updateFurniture}
          room={room}
          removeFurniture={removeFurniture}
        />
      )}
      
      <div className="canvas-instructions">
        <p>Click on a furniture item to select it.</p>
        <p>Use the controls panel to adjust position, rotation, and color.</p>
        <p>Click anywhere else to deselect.</p>
      </div>
    </div>
  );
}
