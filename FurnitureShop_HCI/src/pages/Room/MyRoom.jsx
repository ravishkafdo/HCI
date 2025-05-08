import React, { useState, useEffect, Suspense, useRef, useContext } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  TransformControls,
  Grid,
  Html
} from "@react-three/drei";
import { Vector3 } from "three";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../App";
import "./MyRoom.css";

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Model loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Error loading model</div>;
    }

    return this.props.children;
  }
}

const ModelLoadingFallback = () => {
  return (
    <Html center>
      <div style={{ 
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "10px 20px",
        borderRadius: "4px",
        fontFamily: "Arial, sans-serif"
      }}>
        Loading furniture...
      </div>
    </Html>
  );
};

const FallbackCube = ({ item }) => {
  const ref = useRef();
  return (
    <mesh ref={ref} position={item?.position || [0, 0.5, 0]} scale={item?.scale || [1,1,1]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" wireframe />
      <Html position={[0, 0.75, 0]} center>
        <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '3px' }}>
          {item?.title || 'Model Error'}
        </div>
      </Html>
    </mesh>
  );
};

const FurnitureModel = ({ item, selected, onClick, onPositionChange, onRotationChange }) => {
  const [modelError, setModelError] = useState(false);
  const modelUrl = `http://localhost:5001${item.modelUrl}`;
  
  let model;
  try {
    model = useGLTF(modelUrl);
  } catch (error) {
    console.error(`Error loading model: ${modelUrl}`, error);
  }
  
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      if (item.position) {
        ref.current.position.set(...item.position);
      }
      
      if (item.rotation) {
        ref.current.rotation.set(...item.rotation);
      }
    }
  }, [item]);
  
  if (!model || modelError) {
    return (
      <>
        {selected && (
          <TransformControls
            object={ref}
            mode="translate"
            showX={true}
            showY={true}
            showZ={true}
            onObjectChange={() => {
              if (ref.current) {
                const newPosition = [
                  ref.current.position.x,
                  ref.current.position.y,
                  ref.current.position.z
                ];
                onPositionChange(item._id, newPosition);
                
                const newRotation = [
                  ref.current.rotation.x,
                  ref.current.rotation.y,
                  ref.current.rotation.z
                ];
                onRotationChange(item._id, newRotation);
              }
            }}
          />
        )}
        <mesh 
          ref={ref}
          scale={2}
          onClick={(e) => {
            e.stopPropagation();
            onClick(item._id);
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        {selected && (
          <Html position={[0, 2, 0]} center>
            <div className="model-label">{item.title} (Model not found)</div>
          </Html>
        )}
      </>
    );
  }
  
  return (
    <>
      {selected && (
        <TransformControls
          object={ref}
          mode="translate"
          showX={true}
          showY={true}
          showZ={true}
          onObjectChange={() => {
            if (ref.current) {
              const newPosition = [
                ref.current.position.x,
                ref.current.position.y,
                ref.current.position.z
              ];
              onPositionChange(item._id, newPosition);
              
              const newRotation = [
                ref.current.rotation.x,
                ref.current.rotation.y,
                ref.current.rotation.z
              ];
              onRotationChange(item._id, newRotation);
            }
          }}
        />
      )}
      <primitive 
        ref={ref}
        object={model.scene} 
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

const Room = ({ showWalls, wallColors, floorColor, dimensions }) => {
  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[dimensions.width, dimensions.depth]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      
      {showWalls && (
        <>
          <mesh position={[0, dimensions.height, -10]} receiveShadow>
            <boxGeometry args={[dimensions.width, 10, 0.2]} />
            <meshStandardMaterial color={wallColors.all} />
          </mesh>
          
          <mesh position={[-10, dimensions.height, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[dimensions.width, 10, 0.2]} />
            <meshStandardMaterial color={wallColors.front} />
          </mesh>
          
          <mesh position={[10, dimensions.height, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[dimensions.width, 10, 0.2]} />
            <meshStandardMaterial color={wallColors.back} />
          </mesh>
        </>
      )}
      
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

const CameraController = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 10, 15);
    camera.lookAt(new Vector3(0, 0, 0));
  }, [camera]);
  
  return null;
};

const MyRoom = () => {
  const { authState } = useContext(AuthContext);
  const [roomItems, setRoomItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showWalls, setShowWalls] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [wallColors, setWallColors] = useState({
    all: "#E0E0E0", front: "#E0E0E0", back: "#E0E0E0",
    left: "#D3D3D3", right: "#D3D3D3",
  });
  const [floorColor, setFloorColor] = useState("#BFBFBF");
  const [dimensions, setDimensions] = useState({
    width: 20,
    depth: 20,
    height: 5
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchSavedDesigns();
    }
  }, [authState.isAuthenticated]);
  
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('roomItems') || '[]');
    console.log('Loaded items from localStorage:', savedItems);
    
    const hasInvalidModels = savedItems.some(item => {
      const knownModelIds = [
        '95326590-bf9f-4669-acfd-8bd6be2461d8',
        'dac378ba-25dd-4538-b71d-7db98466286d',
        'f71ad59d-c416-4d6c-9035-7211a140c1cc'
      ];
      
      const modelUrlMatch = item.modelUrl?.match(/\/([^\/]+)\.glb$/);
      const modelId = modelUrlMatch ? modelUrlMatch[1] : null;
      
      return modelId && !knownModelIds.includes(modelId);
    });
    
    if (hasInvalidModels) {
      console.warn('Some models in localStorage may not exist on server!');
    }
    
    if (savedItems.length > 0 && !currentDesign) {
      setRoomItems(savedItems);
    }
  }, [currentDesign]);
  
  const fetchSavedDesigns = async () => {
    if (!authState.isAuthenticated) return;
    
    try {
      setLoadingDesigns(true);
      console.log('Auth token in MyRoom:', authState.token);
      
      const response = await fetch('http://localhost:5001/api/room-designs', {
        method: 'GET',
        headers: {
          ...(authState.token ? { 'Authorization': `Bearer ${authState.token}` } : {})
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        console.error('Authentication error - redirecting to login');
        navigate('/login', { state: { from: location, message: 'Your session has expired. Please login again.' } });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved designs');
      }
      
      const data = await response.json();
      setSavedDesigns(data.data || []);
    } catch (error) {
      console.error('Error fetching saved designs:', error);
    } finally {
      setLoadingDesigns(false);
    }
  };
  
  const loadDesign = (design) => {
    setCurrentDesign(design);
    setRoomItems(design.items || []);
    
    if (design.wallColors) setWallColors(design.wallColors);
    if (design.floorColor) setFloorColor(design.floorColor);
    if (design.dimensions) setDimensions(design.dimensions);
  };
  
  const handleDeleteDesign = async (designId, e) => {
    e.stopPropagation(); 
    
    if (!window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/room-designs/${designId}`, {
        method: 'DELETE',
        headers: {
          ...(authState.token ? { 'Authorization': `Bearer ${authState.token}` } : {})
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        navigate('/login', { state: { from: location, message: 'Your session has expired. Please login again.' } });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to delete design');
      }
      
      setSavedDesigns(prev => prev.filter(design => design._id !== designId));
      
      if (currentDesign?._id === designId) {
        setCurrentDesign(null);
        setRoomItems([]);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting design:', error);
      alert(`Failed to delete design: ${error.message}`);
    }
  };
  
  const handlePositionChange = (itemId, position) => {
    setRoomItems(prev => 
      prev.map(item => 
        item._id === itemId 
          ? { ...item, position }
          : item
      )
    );
  };
  
  const handleRotationChange = (itemId, rotation) => {
    setRoomItems(prev => 
      prev.map(item => 
        item._id === itemId 
          ? { ...item, rotation }
          : item
      )
    );
  };
  
  const handleSelectItem = (itemId) => {
    setSelectedItem(prev => prev === itemId ? null : itemId);
  };
  
  const handleCanvasClick = () => {
    setSelectedItem(null);
  };
  
  const handleRemoveItem = (itemId) => {
    setRoomItems(prev => prev.filter(item => item._id !== itemId));
    
    if (selectedItem === itemId) {
      setSelectedItem(null);
    }
    
    if (currentDesign) {
      setCurrentDesign({
        ...currentDesign,
        isModified: true
      });
    }
  };
  
  const handleSaveRoom = async () => {
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: location, message: 'Please login to save design' } });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const designData = {
        name: currentDesign?.name || "My Room Design",
        items: roomItems,
        wallColors,
        floorColor,
        dimensions
      };
      
      let response;
      let endpoint = 'http://localhost:5001/api/room-designs';
      let method = 'POST';
      
      if (currentDesign && currentDesign._id) {
        endpoint = `${endpoint}/${currentDesign._id}`;
        method = 'PUT';
      }
      
      console.log('Auth token in handleSaveRoom:', authState.token);
      
      response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authState.token ? { 'Authorization': `Bearer ${authState.token}` } : {})
        },
        body: JSON.stringify(designData),
        credentials: 'include'
      });
      
      if (response.status === 401) {
        console.error('Authentication error - redirecting to login');
        navigate('/login', { state: { from: location, message: 'Your session has expired. Please login again.' } });
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save room design');
      }
      
      const result = await response.json();
      
      setCurrentDesign(result.data);
      
      setSavedDesigns(prev => {
        const updatedList = [...prev];
        const existingIndex = updatedList.findIndex(d => d._id === result.data._id);
        
        if (existingIndex >= 0) {
          updatedList[existingIndex] = result.data;
        } else {
          updatedList.unshift(result.data);
        }
        
        return updatedList;
      });
      
      localStorage.setItem('roomItems', JSON.stringify(roomItems));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving room design:', error);
      alert(`Failed to save room design: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleWalls = () => {
    setShowWalls(!showWalls);
  };
  
  const handleResetRoom = () => {
    if (window.confirm('Are you sure you want to reset the room? All unsaved changes will be lost.')) {
      setRoomItems([]);
      setSelectedItem(null);
      setCurrentDesign(null);
      localStorage.removeItem('roomItems');
    }
  };
  
  return (
    <div className="my-room-page">
      <div className="room-header">
        <h1>Room Designs</h1>
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
            className="reset-room-btn"
            onClick={handleResetRoom}
            style={{ backgroundColor: "#ff6b6b" }}
          >
            Reset Room
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
      
      <div className="my-room-content">
        <div className="room-container">
          <Canvas shadows>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Suspense fallback={null}>
              <Room showWalls={showWalls} wallColors={wallColors} floorColor={floorColor} dimensions={dimensions} />
              {roomItems.map((item, index) => (
                <ModelErrorBoundary key={item._id || index} fallback={<FallbackCube item={item} />}>
                  <Suspense fallback={<ModelLoadingFallback />}>
                    <FurnitureModel 
                      item={item}
                      selected={selectedItem === item._id}
                      onClick={handleSelectItem}
                      onPositionChange={handlePositionChange}
                      onRotationChange={handleRotationChange}
                    />
                  </Suspense>
                </ModelErrorBoundary>
              ))}
              <CameraController />
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={30}
                target={[0, 0, 0]}
                onClick={handleCanvasClick}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="saved-designs">
          <h2>My Saved Designs</h2>
          {loadingDesigns ? (
            <div className="loading-designs">Loading saved designs...</div>
          ) : savedDesigns.length > 0 ? (
            <div className="designs-list">
              {savedDesigns.map((design) => (
                <div 
                  key={design._id} 
                  className={`design-item ${currentDesign?._id === design._id ? 'active' : ''}`}
                  onClick={() => loadDesign(design)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{design.name}</h3>
                    <button 
                      onClick={(e) => handleDeleteDesign(design._id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff5252',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '1rem'
                      }}
                      title="Delete design"
                    >
                      ×
                    </button>
                  </div>
                  <p className="design-date">
                    {new Date(design.createdAt).toLocaleDateString()}
                  </p>
                  <div className="design-preview">
                    <span className="item-count">{design.items.length} items</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-designs">
              <p>You haven't saved any room designs yet.</p>
              <button 
                className="create-design-btn"
                onClick={() => navigate('/design')}
              >
                Create New Design
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRoom;