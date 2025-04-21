import { useState, useEffect } from "react";
import { useDesignStore } from "../../stores/designStore";
import RoomConfig from "../../components/RoomConfig/RoomConfig";
import Canvas3D from "../../components/Canvas3D/Canvas3D";
import TestCanvas from "../../components/TestCanvas/TestCanvas";
import { useNavigate } from "react-router-dom";
import "./Design.css";

export default function Design() {
  const [activeTab, setActiveTab] = useState("design");
  const [showRoomConfig, setShowRoomConfig] = useState(false);
  const [is3DView, setIs3DView] = useState(false);
  const [ceilingHeight, setCeilingHeight] = useState(8.5);
  
  const navigate = useNavigate();
  const toggleView = useDesignStore((state) => state.toggleView);
  const room = useDesignStore((state) => state.room);
  const setRoomConfig = useDesignStore((state) => state.setRoom);

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
    } else {
      setCeilingHeight(room.height);
    }
  }, [room, setRoomConfig]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewToggle = () => {
    setIs3DView(!is3DView);
    toggleView();
  };

  const handleApplyChanges = () => {
    // Apply ceiling height changes
    if (room) {
      setRoomConfig({
        ...room,
        height: ceilingHeight
      });
    }
  };

  return (
    <div className="design-page">
      <div className="design-header">
        <div className="logo">
          CREATE ROOM
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
          <button className="icon-button" title="Profile">
            <span className="material-icons">account_circle</span>
          </button>
        </div>
      </div>
      
      <div className="design-toolbar">
        <button 
          className="tool-button" 
          onClick={() => setShowRoomConfig(true)}
          title="Room Specs"
        >
          <div className="tool-icon room-specs-icon"></div>
          <span>Room Specs</span>
        </button>
        <button className="tool-button" title="Colors">
          <div className="tool-icon colors-icon"></div>
          <span>Colors</span>
        </button>
        <button className="tool-button" title="Furniture">
          <div className="tool-icon furniture-icon"></div>
          <span>Furniture</span>
        </button>
        <button className="tool-button" title="Lighting">
          <div className="tool-icon lighting-icon"></div>
          <span>Lighting</span>
        </button>
        <button className="tool-button" title="Openings">
          <div className="tool-icon openings-icon"></div>
          <span>Openings</span>
        </button>
      </div>
      
      <div className="design-content">
        <div className="ceiling-height-control">
          <label>Ceiling height</label>
          <div className="input-control">
            <input 
              type="number" 
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(parseFloat(e.target.value) || 0)}
            />
            <span className="unit">ft</span>
          </div>
        </div>

        <div className="design-canvas">
          {/* Use the actual Canvas3D component */}
          {room && <Canvas3D />}
          {/* <TestCanvas /> */}
        </div>

        <div className="canvas-controls">
          <button className="icon-button" title="Fullscreen">
            <span className="material-icons">fullscreen</span>
          </button>
          <button className="icon-button" title="Reset View">
            <span className="material-icons">refresh</span>
          </button>
          <div className="view-toggle">
            <button 
              className={`view-button ${!is3DView ? "active" : ""}`} 
              onClick={() => handleViewToggle(false)}
            >
              2D
            </button>
            <button 
              className={`view-button ${is3DView ? "active" : ""}`} 
              onClick={() => handleViewToggle(true)}
            >
              3D
            </button>
          </div>
          <button className="icon-button" title="Layer Settings">
            <span className="material-icons">layers</span>
          </button>
        </div>
      </div>
      
      <div className="design-footer">
        <button className="apply-button" onClick={handleApplyChanges}>
          Apply Changes
        </button>
      </div>

      <RoomConfig
        open={showRoomConfig}
        onClose={() => setShowRoomConfig(false)}
      />
    </div>
  );
}
