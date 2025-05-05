import { useState, useEffect } from "react";
import { useDesignStore } from "../../stores/designStore";
import RoomConfig from "../../components/RoomConfig/RoomConfig";
import Canvas3D from "../../components/Canvas3D/Canvas3D";
import { useNavigate, useParams } from "react-router-dom";
import "./Design.css";

export default function Design() {
  const { id } = useParams(); // Get furniture ID from URL if available
  const [activeTab, setActiveTab] = useState("design");
  const [showRoomConfig, setShowRoomConfig] = useState(false);
  const [is3DView, setIs3DView] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showFurnitureCatalog, setShowFurnitureCatalog] = useState(false);
  const [designName, setDesignName] = useState("My Room Design");
  const [isSaved, setIsSaved] = useState(false);
  
  const navigate = useNavigate();
  const toggleView = useDesignStore((state) => state.toggleView);
  const room = useDesignStore((state) => state.room);
  const setRoomConfig = useDesignStore((state) => state.setRoom);
  const furniture = useDesignStore((state) => state.furniture);
  const addFurniture = useDesignStore((state) => state.addFurniture);

  // Sample furniture catalog
  const furnitureCatalog = [
    {
      id: "chair-001",
      name: "Accent Chair",
      type: "Chair",
      thumbnail: "/furniture/chair-1.jpg",
      price: "$249.99",
      dimensions: { width: 60, height: 80, length: 65 },
      colors: ["#8B4513", "#A0522D", "#CD853F", "#D2B48C"]
    },
    {
      id: "sofa-001",
      name: "Modern Sofa",
      type: "Sofa",
      thumbnail: "/furniture/sofa-1.jpg",
      price: "$899.99",
      dimensions: { width: 220, height: 85, length: 90 },
      colors: ["#191970", "#000080", "#483D8B", "#6A5ACD"]
    },
    {
      id: "table-001",
      name: "Dining Table",
      type: "Table",
      thumbnail: "/furniture/table-1.jpg",
      price: "$599.99",
      dimensions: { width: 150, height: 75, length: 90 },
      colors: ["#8B4513", "#A0522D", "#D2691E", "#CD853F"]
    },
    {
      id: "storage-001",
      name: "Bookshelf",
      type: "Storage",
      thumbnail: "/furniture/bookshelf-1.jpg",
      price: "$349.99",
      dimensions: { width: 100, height: 180, length: 30 },
      colors: ["#8B4513", "#A0522D", "#FFFFFF", "#F5F5F5"]
    }
  ];

  // Initialize room if not already set
  useEffect(() => {
    if (!room) {
      setRoomConfig({
        width: 5,
        length: 5,
        height: 2.5,
        wallColor: "#f5f5f5",
        floorColor: "#e5e5e5"
      });
    }
    
    // If furniture ID was provided in URL, load that specific furniture
    if (id && furnitureCatalog) {
      const selectedFurniture = furnitureCatalog.find(item => item.id === id);
      
      if (selectedFurniture && furniture.length === 0) {
        addFurniture({
          ...selectedFurniture,
          position: { x: 0, z: 0 },
          rotation: 0,
          color: selectedFurniture.colors[0]
        });
        
        setDesignName(`${selectedFurniture.name} Design`);
      }
    }
  }, [room, setRoomConfig, id, furniture, addFurniture]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewToggle = () => {
    setIs3DView(!is3DView);
    toggleView();
  };

  const handleAddFurniture = (item) => {
    addFurniture({
      id: item.id,
      type: item.type,
      name: item.name,
      dimensions: item.dimensions,
      position: { x: 0, z: 0 },
      rotation: 0,
      color: item.colors[0]
    });
    
    setShowFurnitureCatalog(false);
  };

  const handleSaveDesign = () => {
    // In a real application, this would save to a backend
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="design-page">
      <div className="design-header">
        <div className="header-left">
          <input 
            type="text" 
            className="design-name-input" 
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
          />
          {isSaved && <span className="saved-indicator">✓ Saved</span>}
        </div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "design" ? "active" : ""}`}
            onClick={() => handleTabChange("design")}
          >
            Design Room
          </button>
          <button 
            className={`tab ${activeTab === "visualize" ? "active" : ""}`}
            onClick={() => handleTabChange("visualize")}
          >
            Visualize
          </button>
          <button 
            className={`tab ${activeTab === "share" ? "active" : ""}`}
            onClick={() => handleTabChange("share")}
          >
            Share
          </button>
        </div>
        
        <div className="header-actions">
          <button className="icon-button" title="Home" onClick={() => navigate("/")}>
            <span className="material-icons">home</span>
          </button>
          <button className="icon-button" title="Undo">
            <span className="material-icons">undo</span>
          </button>
          <button className="icon-button" title="Redo">
            <span className="material-icons">redo</span>
          </button>
          <button className="action-button save-button" onClick={handleSaveDesign}>
            Save Design
          </button>
        </div>
      </div>
      
      <div className="design-content">
        <div className="design-toolbar">
          <button 
            className={`tool-button ${showRoomConfig ? 'active' : ''}`}
            onClick={() => setShowRoomConfig(!showRoomConfig)}
            title="Room Configuration"
          >
            <div className="tool-icon room-icon"></div>
            <span>Room</span>
          </button>
          <button 
            className={`tool-button ${showFurnitureCatalog ? 'active' : ''}`}
            onClick={() => setShowFurnitureCatalog(!showFurnitureCatalog)}
            title="Furniture"
          >
            <div className="tool-icon furniture-icon"></div>
            <span>Furniture</span>
          </button>
          <button 
            className={`tool-button ${showColorPalette ? 'active' : ''}`}
            onClick={() => setShowColorPalette(!showColorPalette)}
            title="Colors"
          >
            <div className="tool-icon colors-icon"></div>
            <span>Colors</span>
          </button>
          <button 
            className="tool-button"
            title="Lighting"
          >
            <div className="tool-icon lighting-icon"></div>
            <span>Lighting</span>
          </button>
          <button 
            className="tool-button"
            title="Measurements"
          >
            <div className="tool-icon measure-icon"></div>
            <span>Measure</span>
          </button>
        </div>

        <div className="design-canvas-container">
          <div className="view-toggle-wrapper">
            <div className="view-toggle">
              <button 
                className={`view-button ${!is3DView ? "active" : ""}`} 
                onClick={() => handleViewToggle(false)}
              >
                2D View
              </button>
              <button 
                className={`view-button ${is3DView ? "active" : ""}`} 
                onClick={() => handleViewToggle(true)}
              >
                3D View
              </button>
            </div>
          </div>

          <div className="design-canvas">
            {room && <Canvas3D />}
          </div>

          <div className="canvas-controls">
            <button className="icon-button" title="Zoom In">
              <span className="material-icons">add</span>
            </button>
            <button className="icon-button" title="Zoom Out">
              <span className="material-icons">remove</span>
            </button>
            <button className="icon-button" title="Reset View">
              <span className="material-icons">refresh</span>
            </button>
            <button className="icon-button" title="Fullscreen">
              <span className="material-icons">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Furniture Catalog Panel */}
        {showFurnitureCatalog && (
          <div className="catalog-panel">
            <div className="panel-header">
              <h3>Furniture Catalog</h3>
              <button className="close-button" onClick={() => setShowFurnitureCatalog(false)}>×</button>
            </div>
            
            <div className="catalog-items">
              {furnitureCatalog.map(item => (
                <div key={item.id} className="catalog-item">
                  <div className="catalog-thumbnail">
                    <img src={item.thumbnail} alt={item.name} />
                  </div>
                  <div className="catalog-details">
                    <h4>{item.name}</h4>
                    <p className="catalog-price">{item.price}</p>
                    <button 
                      className="add-button"
                      onClick={() => handleAddFurniture(item)}
                    >
                      Add to Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Colors Panel */}
        {showColorPalette && (
          <div className="colors-panel">
            <div className="panel-header">
              <h3>Color Palette</h3>
              <button className="close-button" onClick={() => setShowColorPalette(false)}>×</button>
            </div>
            
            <div className="color-categories">
              <button className="color-category active">Room</button>
              <button className="color-category">Furniture</button>
              <button className="color-category">Accent</button>
            </div>
            
            <div className="color-swatches">
              <div className="color-swatch" style={{backgroundColor: "#FFFFFF"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#F5F5F5"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#E0E0E0"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#BBBBBB"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#F5F0DC"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#FFF4E0"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#F8E9D6"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#F9DCC4"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#F7CAC9"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#C6D7EB"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#D8E2DC"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#D0E8D2"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#666666"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#333333"}}></div>
              <div className="color-swatch" style={{backgroundColor: "#000000"}}></div>
            </div>
            
            <div className="custom-color">
              <label>Custom Color:</label>
              <input type="color" value="#F5F5F5" />
            </div>
          </div>
        )}
      </div>
      
      <RoomConfig
        open={showRoomConfig}
        onClose={() => setShowRoomConfig(false)}
      />
    </div>
  );
}
