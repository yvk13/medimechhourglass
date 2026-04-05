import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./Model.css";

const BUTTON_SPEED = 0.03;

export default function Model() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    brain: THREE.Group | null;
    animId: number;
    controls: OrbitControls;
  } | null>(null);

  const buttonRotate = useRef({ x: 0, y: 0 });
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const btnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111111");

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // OrbitControls — handles click+drag and hold naturally
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Stop auto-rotate when user interacts
    renderer.domElement.addEventListener("pointerdown", () => {
      controls.autoRotate = false;
    });
    renderer.domElement.addEventListener("pointerup", () => {
      controls.autoRotate = true;
    });

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(5, 8, 5);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x7eb8d4, 0.6);
    fill.position.set(-5, 2, -3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x4a90d9, 0.4);
    rim.position.set(0, -5, -5);
    scene.add(rim);

    // Load brain model
    const loader = new GLTFLoader();
    loader.load(
      "/brain.glb",
      (gltf) => {
        const brain = gltf.scene;

        // Center and scale model to fit view
        const box = new THREE.Box3().setFromObject(brain);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;

        brain.scale.setScalar(scale);
        brain.position.sub(center.multiplyScalar(scale));

        scene.add(brain);
        sceneRef.current!.brain = brain;
        setLoading(false);
      },
      (progress) => {
        console.log(`Loading: ${Math.round(progress.loaded / progress.total * 100)}%`);
      },
      (err) => {
        console.error(err);
        setError("Could not load brain.glb — make sure it's in the public/ folder");
        setLoading(false);
      }
    );

    // Animate
    const animate = () => {
      const id = requestAnimationFrame(animate);
      sceneRef.current!.animId = id;
      controls.update();

      if (sceneRef.current?.brain) {
        sceneRef.current.brain.rotation.y += buttonRotate.current.y;
        sceneRef.current.brain.rotation.x += buttonRotate.current.x;
      }

      renderer.render(scene, camera);
    };

    sceneRef.current = { renderer, camera, brain: null, animId: 0, controls };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        controls.dispose();
        renderer.dispose();
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  const startButtonRotate = (dir: string) => {
    setActiveBtn(dir);
    buttonRotate.current = dirToRotation(dir, BUTTON_SPEED);

    const handleUp = () => {
      stopButtonRotate();
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mouseup", handleUp);
  };

  const stopButtonRotate = () => {
    setActiveBtn(null);
    buttonRotate.current = { x: 0, y: 0 };
    if (btnIntervalRef.current) clearInterval(btnIntervalRef.current);
  };

  const dirToRotation = (dir: string, speed: number) => {
    switch (dir) {
      case "left":  return { x: 0, y: -speed };
      case "right": return { x: 0, y: speed };
      case "up":    return { x: -speed, y: 0 };
      case "down":  return { x: speed, y: 0 };
      default:      return { x: 0, y: 0 };
    }
  };

  const btnClass = (dir: string) =>
    `model-btn ${activeBtn === dir ? "model-btn-active" : ""}`;

  return (
    <div className="model-page">
    <div className="model-canvas-wrap" ref={mountRef}>
      {loading && <div className="model-loading">Loading brain model...</div>}
      {error && <div className="model-error">{error}</div>}

      {/* Left button */}
      <button
        className={`model-edge-btn model-edge-left ${activeBtn === "left" ? "model-btn-active" : ""}`}
        onMouseDown={() => startButtonRotate("left")}
      >◀</button>

      {/* Right button */}
      <button
        className={`model-edge-btn model-edge-right ${activeBtn === "right" ? "model-btn-active" : ""}`}
        onMouseDown={() => startButtonRotate("right")}
      >▶</button>

      {/* Top button */}
      <button
        className={`model-edge-btn model-edge-top ${activeBtn === "up" ? "model-btn-active" : ""}`}
        onMouseDown={() => startButtonRotate("up")}
      >▲</button>

      {/* Bottom button */}
      <button
        className={`model-edge-btn model-edge-bottom ${activeBtn === "down" ? "model-btn-active" : ""}`}
        onMouseDown={() => startButtonRotate("down")}
      >▼</button>
    </div>
  </div>
  );
}