import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls, GLTFLoader } from "three-stdlib";

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Create gradient background
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d")!;

    // Create vertical gradient from light blue to white
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ffffff"); // White at top
    gradient.addColorStop(0.3, "#e6f3ff"); // Very light blue
    gradient.addColorStop(0.7, "#b3d9ff"); // Light blue
    gradient.addColorStop(1, "#87ceeb"); // Sky blue at bottom

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gradientTexture = new THREE.CanvasTexture(canvas);
    scene.background = gradientTexture;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ensure canvas fills the container properly
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";

    mountRef.current.appendChild(renderer.domElement);

    // Add orbit controls for camera interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth camera movements
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 100;
    // Removed maxPolarAngle restriction to allow viewing from below
    controls.target.set(0, 0, 0); // Set the target to the model center
    controls.enabled = true; // Explicitly enable controls
    controls.enableRotate = true; // Explicitly enable rotation
    controls.enableZoom = true; // Explicitly enable zoom
    controls.enablePan = true; // Explicitly enable panning

    // Mobile device optimizations
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE, // Single finger to rotate
      TWO: THREE.TOUCH.DOLLY_PAN, // Two fingers to zoom and pan
    };
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };

    // Adjust sensitivity for mobile
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    // Load 3D model from our assets
    const loader = new GLTFLoader();
    let loadedModel: THREE.Group | null = null;

    loader.load(
      "/models/helmet.glb", // Local asset path
      (gltf) => {
        loadedModel = gltf.scene;

        // Scale and position the model
        loadedModel.scale.setScalar(2);
        loadedModel.position.set(0, 0, 0);

        // Enable shadows for all meshes in the model
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(loadedModel);
        console.log("3D model loaded successfully!");
      },
      (progress) => {
        console.log(
          "Loading progress:",
          Math.round((progress.loaded / progress.total) * 100) + "%"
        );
      },
      (error) => {
        console.error("Error loading 3D model:", error);

        // Fallback: Create a simple colored cube if model fails to load
        const fallbackGeometry = new THREE.BoxGeometry(2, 2, 2);
        const fallbackMaterial = new THREE.MeshPhongMaterial({
          color: 0xff6b35, // Orange fallback color
          shininess: 50,
        });
        const fallbackCube = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackCube.position.set(0, 0, 0);
        fallbackCube.castShadow = true;
        scene.add(fallbackCube);
        console.log("Fallback cube created due to model loading error");
      }
    );

    // Add very bright ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 4.0); // Increased from 2.5 to 4.0
    scene.add(ambientLight);

    // Add bright directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0); // Increased from 2.5 to 4.0
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add a second bright directional light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 2.5); // Increased from 1.5 to 2.5
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    // Add bright point light for extra illumination
    const pointLight = new THREE.PointLight(0xffffff, 2.0, 50); // Increased from 1.2 to 2.0
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Add additional side lights for even more brightness
    const sideLight1 = new THREE.DirectionalLight(0xffffff, 1.8); // Increased from 1.0 to 1.8
    sideLight1.position.set(10, 0, 0);
    scene.add(sideLight1);

    const sideLight2 = new THREE.DirectionalLight(0xffffff, 1.8); // Increased from 1.0 to 1.8
    sideLight2.position.set(-10, 0, 0);
    scene.add(sideLight2);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Update controls for smooth damping
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      controls.update();

      // Adjust camera position for mobile devices
      if (width < 768) {
        // Mobile breakpoint
        camera.position.set(0, 1, 7); // Move camera further back on mobile
      } else {
        camera.position.set(0, 1, 5); // Default position for desktop
      }
    };

    // Initial mobile check
    if (window.innerWidth < 768) {
      camera.position.set(0, 1, 7);
    }

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();

      // Clean up loaded model if it exists
      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        scene.remove(loadedModel);
      }

      // Note: Lights don't typically need manual disposal in Three.js
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        touchAction: "none", // Prevent default touch behaviors
        background:
          "linear-gradient(to bottom, #ffffff 0%, #e6f3ff 30%, #b3d9ff 70%, #87ceeb 100%)", // Gradient background to match scene
        WebkitTouchCallout: "none", // Disable iOS callout
        WebkitUserSelect: "none", // Disable iOS text selection
        userSelect: "none", // Disable text selection
        WebkitTapHighlightColor: "transparent", // Remove tap highlight on iOS
      }}
    />
  );
};

export default ThreeScene;
