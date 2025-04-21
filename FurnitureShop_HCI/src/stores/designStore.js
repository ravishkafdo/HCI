// src/stores/designStore.js
import { create } from "zustand";

export const useDesignStore = create((set) => ({
  room: null,
  furniture: [],
  selectedFurniture: null,
  is3DView: true,
  
  // Extended furniture details
  furnitureCategories: [
    "Bed", "Sofa", "Chair", "Table", "Storage", "Decor", "Lighting"
  ],
  
  materialOptions: [
    { id: "wood", name: "Wood", textures: ["oak", "walnut", "pine", "mahogany", "cherry"] },
    { id: "fabric", name: "Fabric", textures: ["cotton", "linen", "velvet", "leather", "suede"] },
    { id: "metal", name: "Metal", textures: ["stainless", "brass", "copper", "chrome", "matte-black"] },
    { id: "glass", name: "Glass", textures: ["clear", "frosted", "tinted", "textured"] },
    { id: "stone", name: "Stone", textures: ["marble", "granite", "quartz", "concrete", "terrazzo"] }
  ],
  
  dimensionPresets: {
    "Bed": [
      { name: "King", width: 193, length: 203, height: 45 },
      { name: "Queen", width: 152, length: 203, height: 45 },
      { name: "Twin", width: 99, length: 188, height: 45 }
    ],
    "Sofa": [
      { name: "Sectional", width: 270, length: 270, height: 85 },
      { name: "3-Seater", width: 220, length: 95, height: 85 },
      { name: "Loveseat", width: 170, length: 95, height: 85 }
    ]
  },
  
  // Actions
  setRoom: (room) => set({ room }),
  
  addFurniture: (item) =>
    set((state) => {
      // Generate a unique ID if not provided
      const id = item.id || Date.now().toString();
      
      // Ensure position is valid
      const position = item.position || { x: 0, y: 0, z: 0 };
      
      // Center the furniture in the room if room exists
      if (state.room && (!position.x && !position.z)) {
        position.x = 0; // Center X
        position.z = 0; // Center Z
      }
      
      // Ensure furniture item has all required properties
      const enhancedItem = {
        ...item,
        id,
        position,
        dimensions: item.dimensions || { 
          width: 50, 
          height: 50, 
          length: 50 
        },
        color: item.color || "#A0522D",
        rotation: item.rotation || 0,
        type: item.type || "Generic"
      };
      
      return {
        furniture: [...state.furniture, enhancedItem],
        selectedFurniture: enhancedItem,
      };
    }),
    
  removeFurniture: (id) =>
    set((state) => ({
      furniture: state.furniture.filter((f) => f.id !== id),
      selectedFurniture:
        state.selectedFurniture?.id === id ? null : state.selectedFurniture,
    })),
    
  selectFurniture: (item) => {
    console.log("Selecting furniture:", item);
    // Create a deep copy if item exists to ensure reactivity
    const selectedItem = item ? { ...item, position: { ...item.position } } : null;
    set({ selectedFurniture: selectedItem });
  },
  
  updateFurniture: (id, updates) =>
    set((state) => {
      // Handle nested detail updates
      const updatedFurniture = state.furniture.map((f) => {
        if (f.id === id) {
          if (updates.details) {
            return {
              ...f,
              ...updates,
              details: { ...f.details, ...updates.details }
            };
          }
          return { ...f, ...updates };
        }
        return f;
      });
      
      // Update selected furniture if it's the one being modified
      let updatedSelected = state.selectedFurniture;
      if (state.selectedFurniture?.id === id) {
        if (updates.details) {
          updatedSelected = {
            ...state.selectedFurniture,
            ...updates,
            details: { ...state.selectedFurniture.details, ...updates.details }
          };
        } else {
          updatedSelected = { ...state.selectedFurniture, ...updates };
        }
      }
      
      return {
        furniture: updatedFurniture,
        selectedFurniture: updatedSelected
      };
    }),
    
  updateFurnitureDetail: (id, detailKey, value) =>
    set((state) => {
      const updatedFurniture = state.furniture.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            details: { ...f.details, [detailKey]: value }
          };
        }
        return f;
      });
      
      let updatedSelected = state.selectedFurniture;
      if (state.selectedFurniture?.id === id) {
        updatedSelected = {
          ...state.selectedFurniture,
          details: { ...state.selectedFurniture.details, [detailKey]: value }
        };
      }
      
      return {
        furniture: updatedFurniture,
        selectedFurniture: updatedSelected
      };
    }),
    
  toggleView: () => set((state) => ({ is3DView: !state.is3DView })),
  
  clearDesign: () =>
    set({ room: null, furniture: [], selectedFurniture: null }),
}));
