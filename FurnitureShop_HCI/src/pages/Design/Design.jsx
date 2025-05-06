import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./Design.css";
import { AuthContext } from "../../App";

const Model = ({ url, position, rotation, onClick }) => {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      onClick={onClick}
      scale={2}
    />
  );
};

export default function Design() {
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [designName, setDesignName] = useState("My Room Design");
  const [roomItems, setRoomItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFurnitureCatalog, setShowFurnitureCatalog] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [is3DView, setIs3DView] = useState(true);

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("roomItems") || "[]");

    if (location.state?.selectedProduct) {
      const product = location.state.selectedProduct;
      const exists = savedItems.some((item) => item._id === product._id);

      if (!exists) {
        const newItems = [
          ...savedItems,
          {
            ...product,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
          },
        ];
        setRoomItems(newItems);
        localStorage.setItem("roomItems", JSON.stringify(newItems));
      } else {
        setRoomItems(savedItems);
      }

      setDesignName(`${product.title} Design`);
    } else {
      setRoomItems(savedItems);
    }
  }, [location.state]);



  const handleSelectItem = (index) => {
    setSelectedItem(selectedItem === index ? null : index);
  };

  const handleRemoveItem = (index) => {
    const newItems = roomItems.filter((_, i) => i !== index);
    setRoomItems(newItems);
    localStorage.setItem("roomItems", JSON.stringify(newItems));
    setSelectedItem(null);
  };

  const handleSaveDesign = () => {
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: location, message: 'Please login to save your design' } });
      return;
    }
    localStorage.setItem("roomItems", JSON.stringify(roomItems));
    navigate("/my-room");
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
        </div>

        <div className="header-actions">
          <button className="icon-button" onClick={() => navigate("/")}>
            <span className="material-icons">home</span>
          </button>
          <button
            className="action-button save-button"
            onClick={handleSaveDesign}
          >
            Save & View Room
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
            className={`tool-button ${showColorPalette ? "active" : ""}`}
            onClick={() => setShowColorPalette(!showColorPalette)}
          >
            <div className="tool-icon colors-icon"></div>
            <span>Colors</span>
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
          <div className="design-canvas">
            {is3DView ? (
              <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <gridHelper args={[10, 10]} />

                {roomItems.map((item, index) => (
                  <Model
                    key={index}
                    url={`http://localhost:5001${item.modelUrl}`}
                    position={item.position}
                    rotation={item.rotation}
                    onClick={() => handleSelectItem(index)}
                  />
                ))}

                <OrbitControls />
              </Canvas>
            ) : (
              <div className="2d-view-placeholder">
                <p>2D View Coming Soon</p>
              </div>
            )}
          </div>
        </div>

        {showFurnitureCatalog && (
          <div className="catalog-panel">
            <div className="panel-header">
              <h3>Add Furniture</h3>
              <button
                className="close-button"
                onClick={() => setShowFurnitureCatalog(false)}
              >
                ×
              </button>
            </div>

            <div className="catalog-items">
              <div className="catalog-item">
                <div className="catalog-thumbnail">
                  <img
                    src="https://via.placeholder.com/80"
                    alt="Add from Products"
                  />
                </div>
                <div className="catalog-details">
                  <h4>Browse Products</h4>
                  <p className="catalog-price">Add more items</p>
                  <button
                    className="add-button"
                    onClick={() => navigate("/products")}
                  >
                    Go to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedItem !== null && roomItems[selectedItem] && (
          <div className="colors-panel">
            <div className="panel-header">
              <h3>{roomItems[selectedItem].title}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>

            <div className="color-swatches">
              {roomItems[selectedItem].colors?.map((color, i) => (
                <div
                  key={i}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
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