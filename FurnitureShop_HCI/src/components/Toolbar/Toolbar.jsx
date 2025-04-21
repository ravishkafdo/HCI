import "./Toolbar.css";
import { Button } from "@mui/material";
import { useDesignStore } from "../../stores/designStore";

export default function Toolbar({ onNewRoom }) {
  const { is3DView, toggleView } = useDesignStore();

  return (
    <div className="toolbar">
      <Button
        variant="contained"
        onClick={onNewRoom}
        className="toolbar-button"
      >
        New Room
      </Button>

      <Button
        variant="outlined"
        onClick={toggleView}
        className="toolbar-button"
      >
        {is3DView ? "Switch to 2D" : "Switch to 3D"}
      </Button>

      <div className="spacer"></div>

      <Button variant="outlined" className="toolbar-button">
        Save Design
      </Button>

      <Button variant="outlined" className="toolbar-button">
        Load Design
      </Button>
    </div>
  );
}
