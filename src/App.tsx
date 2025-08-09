import ThreeScene from "./components/ThreeScene";

function App() {
  return (
    <>
      <ThreeScene />
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          color: "#333",
          fontSize: "clamp(1.2rem, 4vw, 2rem)", // Responsive font size
          fontWeight: "bold",
          fontFamily: "Arial, sans-serif",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          pointerEvents: "none",
          userSelect: "none",
          // padding: "0 20px", // Add padding for mobile
          textAlign: "center", // Center text on mobile
        }}
      >
        Sample 3D Object
      </div>
    </>
  );
}

export default App;
