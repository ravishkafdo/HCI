import { Button, Typography } from "@mui/material";
import { useDesignStore } from "../../stores/designStore";
import "./Catalog.css";

const FURNITURE_ITEMS = [
  {
    type: "Chair",
    icon: "🪑",
    defaultSize: { width: 0.5, height: 1, depth: 0.5 },
    color: "#795548",
  },
  {
    type: "Table",
    icon: "🪵",
    defaultSize: { width: 1, height: 0.8, depth: 1 },
    color: "#8D6E63",
  },
  {
    type: "Sofa",
    icon: "🛋️",
    defaultSize: { width: 1.5, height: 0.8, depth: 0.7 },
    color: "#6D4C41",
  },
  {
    type: "Bed",
    icon: "🛏️",
    defaultSize: { width: 1.8, height: 0.5, depth: 2 },
    color: "#5D4037",
  },
  {
    type: "Bedside Table",
    icon: "🪑",
    defaultSize: { width: 0.5, height: 0.6, depth: 0.4 },
    color: "#795548",
  },
];

export default function Catalog() {
  const addFurniture = useDesignStore((state) => state.addFurniture);

  const handleAddFurniture = (item) => {
    addFurniture({
      id: Date.now(),
      type: item.type,
      color: item.color,
      x: 0,
      z: 0,
      rotation: 0,
      ...item.defaultSize,
    });
  };

  return (
    <div className="catalog">
      <Typography variant="h6" gutterBottom>
        Furniture Catalog
      </Typography>

      <div className="catalog-items">
        {FURNITURE_ITEMS.map((item) => (
          <Button
            key={item.type}
            variant="outlined"
            fullWidth
            className="catalog-item"
            onClick={() => handleAddFurniture(item)}
            startIcon={<span className="item-icon">{item.icon}</span>}
          >
            {item.type}
          </Button>
        ))}
      </div>
    </div>
  );
}
