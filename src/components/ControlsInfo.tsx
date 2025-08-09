import React from "react";

const ControlsInfo: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        pointerEvents: "none", // Ensure this doesn't block mouse events
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#00ff88" }}>
        🎮 Camera Controls
      </h3>
      <div style={{ lineHeight: "1.5" }}>
        <div>
          <strong>Left Mouse:</strong> Rotate camera
        </div>
        <div>
          <strong>Right Mouse:</strong> Pan camera
        </div>
        <div>
          <strong>Scroll Wheel:</strong> Zoom in/out
        </div>
      </div>
    </div>
  );
};

export default ControlsInfo;
