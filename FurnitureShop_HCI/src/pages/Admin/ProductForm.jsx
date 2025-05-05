import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./ProductForm.css";

const socket = io("http://localhost:5001", { withCredentials: true });

function ProductForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  // Product Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Living Room",
    dimensions: {
      width: "",
      height: "",
      length: ""
    },
    materials: [""],
    colors: [""],
    inStock: true,
    featured: false
  });
  
  // Files State
  const [files, setFiles] = useState({
    thumbnail: null,
    images: [],
    model: null
  });
  
  // File Previews
  const [previews, setPreviews] = useState({
    thumbnail: "",
    images: [],
    model: ""
  });
  
  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Categories
  const categories = ["Living Room", "Bedroom", "Dining Room", "Office", "Storage"];
  
  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);
  
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/products/${id}`, {
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Failed to fetch product");
      
      const data = await response.json();
      
      if (data.success && data.product) {
        const product = data.product;
        
        // Set form data from product
        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price || "",
          category: product.category || "Living Room",
          dimensions: {
            width: product.dimensions?.width || "",
            height: product.dimensions?.height || "",
            length: product.dimensions?.length || ""
          },
          materials: product.materials && product.materials.length > 0 ? product.materials : [""],
          colors: product.colors && product.colors.length > 0 ? product.colors : [""],
          inStock: product.inStock !== undefined ? product.inStock : true,
          featured: product.featured || false
        });
        
        // Set previews for existing files
        setPreviews({
          thumbnail: product.thumbnail ? `http://localhost:5001${product.thumbnail}` : "",
          images: product.images ? product.images.map(img => `http://localhost:5001${img}`) : [],
          model: product.modelUrl ? product.modelUrl : ""
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle dimension changes
  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [name]: value
      }
    });
  };
  
  // Handle materials and colors changes
  const handleArrayFieldChange = (e, index, field) => {
    const { value } = e.target;
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    
    setFormData({
      ...formData,
      [field]: updatedArray
    });
  };
  
  // Add new item to array fields
  const handleAddArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""]
    });
  };
  
  // Remove item from array fields
  const handleRemoveArrayItem = (index, field) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    
    setFormData({
      ...formData,
      [field]: updatedArray
    });
  };
  
  // Handle file inputs
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    
    if (name === "images") {
      // For multiple images
      setFiles({
        ...files,
        [name]: selectedFiles
      });
      
      // Create previews for multiple images
      const imagePreviews = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        imagePreviews.push(URL.createObjectURL(selectedFiles[i]));
      }
      
      setPreviews({
        ...previews,
        [name]: imagePreviews
      });
    } else {
      // For single files (thumbnail or 3D model)
      setFiles({
        ...files,
        [name]: selectedFiles[0]
      });
      
      // Create preview for single file
      if (selectedFiles[0]) {
        setPreviews({
          ...previews,
          [name]: URL.createObjectURL(selectedFiles[0])
        });
      }
    }
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      // Validate form
      if (!formData.title || !formData.description || !formData.price || !formData.category) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }
      
      // Validate dimensions
      if (!formData.dimensions.width || !formData.dimensions.height || !formData.dimensions.length) {
        setError("Please provide all dimension measurements");
        setLoading(false);
        return;
      }
      
      // In create mode, require thumbnail and 3D model
      if (!isEditMode && (!files.thumbnail || !files.model)) {
        setError("Please upload a thumbnail image and 3D model");
        setLoading(false);
        return;
      }
      
      // Prepare form data for submission
      const productFormData = new FormData();
      
      // Add basic fields
      productFormData.append("title", formData.title);
      productFormData.append("description", formData.description);
      productFormData.append("price", formData.price);
      productFormData.append("category", formData.category);
      
      // Add dimensions as JSON
      productFormData.append("dimensions", JSON.stringify(formData.dimensions));
      
      // Filter out empty values from arrays
      const filteredMaterials = formData.materials.filter(item => item.trim() !== "");
      const filteredColors = formData.colors.filter(item => item.trim() !== "");
      
      // Add arrays
      productFormData.append("materials", JSON.stringify(filteredMaterials));
      productFormData.append("colors", JSON.stringify(filteredColors));
      
      // Add boolean fields
      productFormData.append("inStock", formData.inStock);
      productFormData.append("featured", formData.featured);
      
      // Add files
      if (files.thumbnail) {
        productFormData.append("thumbnail", files.thumbnail);
      }
      
      if (files.model) {
        productFormData.append("model", files.model);
      }
      
      // Add multiple images
      if (files.images && files.images.length > 0) {
        for (let i = 0; i < files.images.length; i++) {
          productFormData.append("images", files.images[i]);
        }
      }
      
      // Get auth token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to perform this action");
        setLoading(false);
        return;
      }
      
      // API endpoint and method based on create/edit mode
      const url = isEditMode 
        ? `http://localhost:5001/api/products/${id}`
        : "http://localhost:5001/api/products";
      
      const method = isEditMode ? "PUT" : "POST";
      
      // Submit form
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productFormData,
        credentials: "include"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
      }
      
      // Success handling
      setSuccess(isEditMode ? "Product updated successfully" : "Product created successfully");
      
      // Emit socket event for real-time update
      socket.emit("product-update", { 
        action: isEditMode ? "update" : "create", 
        message: isEditMode ? "Product updated successfully" : "New product added" 
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="product-form-container">
      <div className="form-header">
        <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        <div className="form-actions">
          <button 
            className="cancel-btn" 
            onClick={() => navigate("/admin")}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Product Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($) <span className="required">*</span></label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category <span className="required">*</span></label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row checkbox-row">
              <div className="form-group">
                <label htmlFor="inStock" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="inStock"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                  />
                  In Stock
                </label>
              </div>
              
              <div className="form-group">
                <label htmlFor="featured" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  Featured Product
                </label>
              </div>
            </div>
          </div>
          
          {/* Dimensions */}
          <div className="form-section">
            <h2>Dimensions</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="width">Width (cm) <span className="required">*</span></label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  min="0"
                  step="0.1"
                  value={formData.dimensions.width}
                  onChange={handleDimensionChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (cm) <span className="required">*</span></label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min="0"
                  step="0.1"
                  value={formData.dimensions.height}
                  onChange={handleDimensionChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="length">Length (cm) <span className="required">*</span></label>
                <input
                  type="number"
                  id="length"
                  name="length"
                  min="0"
                  step="0.1"
                  value={formData.dimensions.length}
                  onChange={handleDimensionChange}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Materials */}
          <div className="form-section">
            <h2>Materials</h2>
            
            {formData.materials.map((material, index) => (
              <div className="form-row array-row" key={`material-${index}`}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder={`Material ${index + 1}`}
                    value={material}
                    onChange={(e) => handleArrayFieldChange(e, index, "materials")}
                  />
                </div>
                
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveArrayItem(index, "materials")}
                  disabled={formData.materials.length === 1}
                >
                  <i className="material-icons">remove</i>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="add-btn"
              onClick={() => handleAddArrayItem("materials")}
            >
              <i className="material-icons">add</i> Add Material
            </button>
          </div>
          
          {/* Colors */}
          <div className="form-section">
            <h2>Colors</h2>
            
            {formData.colors.map((color, index) => (
              <div className="form-row array-row" key={`color-${index}`}>
                <div className="form-group color-input-group">
                  <input
                    type="text"
                    placeholder={`Color ${index + 1} (Hex or name)`}
                    value={color}
                    onChange={(e) => handleArrayFieldChange(e, index, "colors")}
                  />
                  <input
                    type="color"
                    value={color.startsWith("#") ? color : "#000000"}
                    onChange={(e) => handleArrayFieldChange({ target: { value: e.target.value } }, index, "colors")}
                  />
                </div>
                
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveArrayItem(index, "colors")}
                  disabled={formData.colors.length === 1}
                >
                  <i className="material-icons">remove</i>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="add-btn"
              onClick={() => handleAddArrayItem("colors")}
            >
              <i className="material-icons">add</i> Add Color
            </button>
          </div>
          
          {/* Images */}
          <div className="form-section">
            <h2>Images</h2>
            
            <div className="form-group file-upload">
              <label>Thumbnail Image <span className="required">*</span></label>
              <div className="file-input-container">
                <input
                  type="file"
                  name="thumbnail"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`file-input ${isEditMode && !files.thumbnail ? 'optional' : ''}`}
                />
                <label htmlFor="thumbnail" className="file-label">
                  <i className="material-icons">cloud_upload</i>
                  <span>Choose Image</span>
                </label>
              </div>
              
              {previews.thumbnail && (
                <div className="image-preview">
                  <img src={previews.thumbnail} alt="Thumbnail Preview" />
                </div>
              )}
            </div>
            
            <div className="form-group file-upload">
              <label>Additional Images</label>
              <div className="file-input-container">
                <input
                  type="file"
                  name="images"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="images" className="file-label">
                  <i className="material-icons">cloud_upload</i>
                  <span>Choose Images</span>
                </label>
              </div>
              
              {previews.images && previews.images.length > 0 && (
                <div className="image-previews-grid">
                  {previews.images.map((preview, index) => (
                    <div className="image-preview" key={`image-${index}`}>
                      <img src={preview} alt={`Additional Image ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 3D Model */}
          <div className="form-section">
            <h2>3D Model</h2>
            
            <div className="form-group file-upload">
              <label>3D Model (.glb or .gltf) <span className="required">*</span></label>
              <div className="file-input-container">
                <input
                  type="file"
                  name="model"
                  id="model"
                  accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                  onChange={handleFileChange}
                  className={`file-input ${isEditMode && !files.model ? 'optional' : ''}`}
                />
                <label htmlFor="model" className="file-label">
                  <i className="material-icons">cloud_upload</i>
                  <span>Choose 3D Model</span>
                </label>
              </div>
              
              {previews.model && (
                <div className="model-info">
                  <i className="material-icons">check_circle</i>
                  <span>3D Model uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-footer">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate("/admin")}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm; 