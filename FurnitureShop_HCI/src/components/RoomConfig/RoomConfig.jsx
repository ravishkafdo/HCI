import { useState, useEffect } from "react";
import { useDesignStore } from "../../stores/designStore";
import { ChromePicker } from "react-color";
import "./RoomConfig.css";

export default function RoomConfig({ open, onClose }) {
  const [roomSpecs, setRoomSpecs] = useState({
    shape: "rectangular", // rectangular, L-shaped, circular
    width: 12,
    length: 15,
    ceilingHeight: 8.5,
    wallColor: "#f5f5f5",
    floorColor: "#e5e5e5",
    ceilingColor: "#ffffff",
  });
  
  const [showColorPicker, setShowColorPicker] = useState(null);
  
  const room = useDesignStore((state) => state.room);
  const setRoomConfig = useDesignStore((state) => state.setRoom);

  // Update local state if the room in the store changes
  useEffect(() => {
    if (room) {
      setRoomSpecs({
        shape: room.shape || "rectangular",
        width: room.width,
        length: room.length,
        ceilingHeight: room.height,
        wallColor: room.wallColor,
        floorColor: room.floorColor,
        ceilingColor: room.ceilingColor || "#ffffff",
      });
    }
  }, [room]);

  const handleApplyChanges = () => {
    // Convert feet to meters for 3D rendering (assuming 1 foot = 0.3048 meters)
    const roomData = {
      shape: roomSpecs.shape,
      width: roomSpecs.width,
      length: roomSpecs.length,
      height: roomSpecs.ceilingHeight,
      wallColor: roomSpecs.wallColor,
      floorColor: roomSpecs.floorColor,
      ceilingColor: roomSpecs.ceilingColor,
    };
    
    setRoomConfig(roomData);
    onClose();
  };

  const handleShapeChange = (shape) => {
    setRoomSpecs({ ...roomSpecs, shape });
  };

  const handleColorChange = (type, color) => {
    setRoomSpecs({ ...roomSpecs, [type]: color });
  };
  
  const handleColorPickerToggle = (type) => {
    setShowColorPicker(showColorPicker === type ? null : type);
  };
  
  const handleColorPickerChange = (type, color) => {
    handleColorChange(type, color.hex);
  };

  return (
    <div className={`room-specs-panel ${open ? "open" : ""}`}>
      <div className="room-specs-header">
        <h2>Room Specifications</h2>
        <p>Set up your room dimensions and shape</p>
        <div className="room-specs-controls">
          <button className="expand-button" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="room-specs-content">
        <section className="room-shape">
          <h3>Room Shape</h3>
          <div className="shape-options">
            <div 
              className={`shape-option ${roomSpecs.shape === "rectangular" ? "selected" : ""}`}
              onClick={() => handleShapeChange("rectangular")}
            >
              <div className="shape-icon rectangular"></div>
            </div>
            <div 
              className={`shape-option ${roomSpecs.shape === "L-shaped" ? "selected" : ""}`}
              onClick={() => handleShapeChange("L-shaped")}
            >
              <div className="shape-icon L-shaped"></div>
            </div>
            <div 
              className={`shape-option ${roomSpecs.shape === "circular" ? "selected" : ""}`}
              onClick={() => handleShapeChange("circular")}
            >
              <div className="shape-icon circular"></div>
            </div>
          </div>
        </section>

        <section className="room-size">
          <h3>Room Size</h3>
          <div className="dimension-input">
            <label>Width</label>
            <div className="input-group">
              <input 
                type="number" 
                value={roomSpecs.width}
                onChange={(e) => setRoomSpecs({ ...roomSpecs, width: parseFloat(e.target.value) || 0 })}
              />
              <span>ft</span>
            </div>
          </div>
          <div className="dimension-input">
            <label>Length</label>
            <div className="input-group">
              <input 
                type="number" 
                value={roomSpecs.length}
                onChange={(e) => setRoomSpecs({ ...roomSpecs, length: parseFloat(e.target.value) || 0 })}
              />
              <span>ft</span>
            </div>
          </div>
        </section>

        <section className="ceiling-height">
          <h3>Ceiling height</h3>
          <div className="input-group">
            <input 
              type="number" 
              value={roomSpecs.ceilingHeight}
              onChange={(e) => setRoomSpecs({ ...roomSpecs, ceilingHeight: parseFloat(e.target.value) || 0 })}
            />
            <span>ft</span>
          </div>
        </section>

        <section className="color-scheme">
          <h3>Color Scheme</h3>
          <div className="color-option">
            <label>Walls</label>
            <div className="color-picker">
              <div 
                className="color-preview" 
                style={{ backgroundColor: roomSpecs.wallColor }}
                onClick={() => handleColorPickerToggle("wallColor")}
              ></div>
              <input 
                type="text" 
                value={roomSpecs.wallColor}
                onChange={(e) => handleColorChange("wallColor", e.target.value)}
              />
              {showColorPicker === "wallColor" && (
                <div className="color-picker-popover">
                  <div className="color-picker-cover" onClick={() => setShowColorPicker(null)} />
                  <ChromePicker 
                    color={roomSpecs.wallColor} 
                    onChange={(color) => handleColorPickerChange("wallColor", color)} 
                    disableAlpha
                  />
                </div>
              )}
            </div>
          </div>
          <div className="color-option">
            <label>Floor</label>
            <div className="color-picker">
              <div 
                className="color-preview" 
                style={{ backgroundColor: roomSpecs.floorColor }}
                onClick={() => handleColorPickerToggle("floorColor")}
              ></div>
              <input 
                type="text" 
                value={roomSpecs.floorColor}
                onChange={(e) => handleColorChange("floorColor", e.target.value)}
              />
              {showColorPicker === "floorColor" && (
                <div className="color-picker-popover">
                  <div className="color-picker-cover" onClick={() => setShowColorPicker(null)} />
                  <ChromePicker 
                    color={roomSpecs.floorColor} 
                    onChange={(color) => handleColorPickerChange("floorColor", color)} 
                    disableAlpha
                  />
                </div>
              )}
            </div>
          </div>
          <div className="color-option">
            <label>Ceiling</label>
            <div className="color-picker">
              <div 
                className="color-preview" 
                style={{ backgroundColor: roomSpecs.ceilingColor }}
                onClick={() => handleColorPickerToggle("ceilingColor")}
              ></div>
              <input 
                type="text" 
                value={roomSpecs.ceilingColor}
                onChange={(e) => handleColorChange("ceilingColor", e.target.value)}
              />
              {showColorPicker === "ceilingColor" && (
                <div className="color-picker-popover">
                  <div className="color-picker-cover" onClick={() => setShowColorPicker(null)} />
                  <ChromePicker 
                    color={roomSpecs.ceilingColor} 
                    onChange={(color) => handleColorPickerChange("ceilingColor", color)} 
                    disableAlpha
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="draggable-furniture">
          <h3>Furniture Collection</h3>
          <div className="furniture-grid">
            <div className="furniture-item">
              <div className="furniture-icon chair"></div>
              <span>Chair</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("Chair")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon dining-table"></div>
              <span>Dining Table</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("Table")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon sofa"></div>
              <span>Sofa</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("Sofa")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon bed"></div>
              <span>Bed</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("Bed")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon bookshelf"></div>
              <span>Bookshelf</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("Bookshelf")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon wardrobe"></div>
              <span>Wardrobe</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("Wardrobe")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon coffee-table"></div>
              <span>Coffee Table</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("CoffeeTable")}>+</button>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon lamp"></div>
              <span>Floor Lamp</span>
              <button className="add-furniture" onClick={() => addFurnitureItem("FloorLamp")}>+</button>
            </div>
          </div>
        </section>
      </div>

      <div className="room-specs-footer">
        <button className="apply-button" onClick={handleApplyChanges}>Apply Changes</button>
      </div>
    </div>
  );
  
  function addFurnitureItem(type) {
    const addFurniture = useDesignStore.getState().addFurniture;
    const room = useDesignStore.getState().room;
    
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
    
    // Create furniture item with default values based on type
    const furniture = {
      id: Date.now().toString(),
      type,
      position: { 
        // Center the furniture in the room if possible
        x: room ? Math.random() * (room.width / 2) - (room.width / 4) : 0,
        y: 0,
        z: room ? Math.random() * (room.length / 2) - (room.length / 4) : 0
      },
      dimensions: dimensions,
      color: color,
      rotation: Math.random() * Math.PI * 2 // Random rotation
    };
    
    addFurniture(furniture);
    onClose(); // Close the panel to see the newly added furniture
  }
}
