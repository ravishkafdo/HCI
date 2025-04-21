import { Slider, TextField, Typography, Button, Box, Tooltip, IconButton } from "@mui/material";
import { ChromePicker } from "react-color";
import { useDesignStore } from "../../stores/designStore";
import "./PropertiesPanel.css";

export default function PropertiesPanel() {
  const selected = useDesignStore((state) => state.selectedFurniture);
  const updateFurniture = useDesignStore((state) => state.updateFurniture);
  const removeFurniture = useDesignStore((state) => state.removeFurniture);

  if (!selected) {
    return (
      <div className="empty-state">
        <Typography variant="h6">No item selected</Typography>
        <Typography>
          Click on a furniture item to edit its properties
        </Typography>
        <Typography variant="body2" style={{ marginTop: "20px", color: "#666" }}>
          Tip: You can drag items directly in the room view to reposition them
        </Typography>
      </div>
    );
  }

  const handleRemove = () => {
    removeFurniture(selected.id);
  };

  // Convert rotation from radians to degrees for display
  const rotationDegrees = ((selected.rotation || 0) * 180 / Math.PI) % 360;

  return (
    <div className="properties-panel">
      <Typography variant="h6" gutterBottom>
        {selected.type} Properties
      </Typography>

      <div className="property-group">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography gutterBottom>Position</Typography>
          <Tooltip title="You can also drag the item directly in the room view">
            <Typography variant="caption" color="textSecondary">
              (Draggable)
            </Typography>
          </Tooltip>
        </Box>
        
        <Typography>X Position: {selected.x.toFixed(1)}m</Typography>
        <Slider
          value={selected.x}
          onChange={(e, value) =>
            updateFurniture(selected.id, { x: value })
          }
          min={-10}
          max={10}
          step={0.1}
          valueLabelDisplay="auto"
        />
        <Typography>Z Position: {selected.z.toFixed(1)}m</Typography>
        <Slider
          value={selected.z}
          onChange={(e, value) =>
            updateFurniture(selected.id, { z: value })
          }
          min={-10}
          max={10}
          step={0.1}
          valueLabelDisplay="auto"
        />
        
        <Typography>Rotation: {rotationDegrees.toFixed(0)}°</Typography>
        <Slider
          value={rotationDegrees}
          onChange={(e, value) => {
            // Convert degrees back to radians for storage
            const radiansValue = (value * Math.PI / 180);
            updateFurniture(selected.id, { rotation: radiansValue });
          }}
          min={0}
          max={359}
          step={1}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: '0°' },
            { value: 90, label: '90°' },
            { value: 180, label: '180°' },
            { value: 270, label: '270°' }
          ]}
        />
      </div>

      <div className="property-group">
        <Typography gutterBottom>Dimensions</Typography>
        <Typography>Width: {selected.width.toFixed(1)}m</Typography>
        <Slider
          value={selected.width}
          onChange={(e, value) =>
            updateFurniture(selected.id, { width: value })
          }
          min={0.1}
          max={5}
          step={0.1}
          valueLabelDisplay="auto"
        />

        <Typography>Height: {selected.height.toFixed(1)}m</Typography>
        <Slider
          value={selected.height}
          onChange={(e, value) =>
            updateFurniture(selected.id, { height: value })
          }
          min={0.1}
          max={3}
          step={0.1}
          valueLabelDisplay="auto"
        />
      </div>

      <div className="property-group">
        <Typography gutterBottom>Color</Typography>
        <ChromePicker
          color={selected.color}
          onChangeComplete={(color) =>
            updateFurniture(selected.id, { color: color.hex })
          }
          disableAlpha
          className="color-picker"
        />
      </div>

      <Button variant="contained" color="secondary" onClick={handleRemove}>
        Remove {selected.type}
      </Button>
    </div>
  );
}
