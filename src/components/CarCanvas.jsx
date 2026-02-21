import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  SoftShadows,
  useGLTF,
} from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DefaultLoadingManager,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useCarStore } from "../store/useCarStore.js";
import CanvasLoader from "./CanvasLoader.jsx";

const BODY_COLOR_MAP = {
  "Racing Yellow": "#f5c400",
  "Guards Red": "#c5161d",
  "Carrara White": "#f5f5f5",
  "Jet Black": "#0b0b0b",
  "GT Silver": "#b8b8b8",
};

const WHEEL_COLOR_MAP = {
  "Satin Black": "#1f1f1f",
  "Dark Titanium": "#4b4b4b",
  "Platinum": "#b8b2a5",
};

const INTERIOR_WALL_COLOR_MAP = {
  "Graphite Black": "#1b1b1b",
  "Crayon Grey": "#8e8a84",
  "Bordeaux Red": "#5c1519",
};

const SEAT_SHELL_COLOR_MAP = {
  "Black Leather": "#1a1a1a",
  "Bordeaux Red": "#6b1a1f",
  "Two-Tone Beige": "#c8b9a2",
};

const SEAT_INSERT_COLOR_MAP = {
  "Perforated Black": "#101010",
  "Carbon Weave": "#2a2a2a",
  "Alcantara Red": "#7b1d24",
};

const RIM_STYLE_MAP = {
  "Classic 5-Spoke": { metalness: 0.85, roughness: 0.25 },
  "Turbo Aero": { metalness: 0.95, roughness: 0.15 },
  "RS Spyder": { metalness: 1, roughness: 0.1 },
};

let urlFixApplied = false;
if (!urlFixApplied) {
  DefaultLoadingManager.setURLModifier((url) => {
    if (!url.includes("/textures/")) return url;
    return url
      .replace("_baseColor.png", "_base.png")
      .replace("_normal.png", "_nor.png")
      .replace("_metallicRoughness.png", "_meta.png");
  });
  urlFixApplied = true;
}

const KEEP_MESH_KEYWORDS = [
  "porsche",
  "kit",
  "wheel",
  "rim",
  "tire",
  "tyre",
  "interior",
  "seat",
  "body",
  "grille",
  "window",
  "glass",
  "badge",
  "license",
  "light",
  "caliper",
];

function PorscheModel() {
  const { config, setInteriorBounds } = useCarStore();
  const { scene } = useGLTF("/models/scene.gltf", true);
  const groupRef = useRef(null);

  const bodyMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(BODY_COLOR_MAP[config.bodyColor] || "#c5161d"),
        metalness: 0.9,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    [config.bodyColor]
  );

  const wheelMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(WHEEL_COLOR_MAP[config.wheelColor] || "#1f1f1f"),
        metalness: 0.7,
        roughness: 0.35,
      }),
    [config.wheelColor]
  );

  const interiorWallMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(
          INTERIOR_WALL_COLOR_MAP[config.interiorWallColor] || "#1b1b1b"
        ),
        metalness: 0.2,
        roughness: 0.6,
      }),
    [config.interiorWallColor]
  );

  const seatShellMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(
          SEAT_SHELL_COLOR_MAP[config.seatShellColor] || "#1a1a1a"
        ),
        metalness: 0.25,
        roughness: 0.55,
      }),
    [config.seatShellColor]
  );

  const seatInsertMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(
          SEAT_INSERT_COLOR_MAP[config.seatInsertColor] || "#101010"
        ),
        metalness: 0.15,
        roughness: 0.7,
      }),
    [config.seatInsertColor]
  );

  const rimMaterial = useMemo(() => {
    const preset = RIM_STYLE_MAP[config.rimType] || RIM_STYLE_MAP["Classic 5-Spoke"];
    return new MeshPhysicalMaterial({
      color: new Color("#c2c2c2"),
      metalness: preset.metalness,
      roughness: preset.roughness,
      clearcoat: 0.7,
    });
  }, [config.rimType]);

  useEffect(() => {
    let keptMeshes = 0;
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;

      const materialName =
        typeof child.material?.name === "string"
          ? child.material.name.toLowerCase()
          : "";
      const name = `${child.name} ${materialName}`.toLowerCase();
      const keep = KEEP_MESH_KEYWORDS.some((key) => name.includes(key));
      child.visible = keep;
      if (keep) keptMeshes += 1;

      if (name.includes("body") || name.includes("paint")) {
        child.material = bodyMaterial;
      } else if (name.includes("rim") || name.includes("rims")) {
        child.material = rimMaterial;
      } else if (name.includes("wheel") || name.includes("tire")) {
        child.material = wheelMaterial;
      } else if (
        name.includes("seat") ||
        name.includes("coloured") ||
        name.includes("colored")
      ) {
        if (
          name.includes("insert") ||
          name.includes("cushion") ||
          name.includes("center") ||
          name.includes("padding") ||
          name.includes("carbon")
        ) {
          child.material = seatInsertMaterial;
        } else {
          child.material = seatShellMaterial;
        }
      } else if (
        name.includes("interior") ||
        name.includes("tilling") ||
        name.includes("cabin") ||
        name.includes("trim") ||
        name.includes("panel") ||
        name.includes("door") ||
        name.includes("dash") ||
        name.includes("console")
      ) {
        child.material = interiorWallMaterial;
      }
      child.material.needsUpdate = true;
    });

    if (keptMeshes === 0) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
        }
      });
    }
  }, [
    scene,
    bodyMaterial,
    wheelMaterial,
    interiorWallMaterial,
    seatShellMaterial,
    seatInsertMaterial,
    rimMaterial,
  ]);

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new Box3().setFromObject(groupRef.current);
    const size = new Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(maxDim) || maxDim === 0) return;

    const targetSize = 3.6;
    const scale = targetSize / maxDim;
    groupRef.current.scale.setScalar(scale);

    const scaledBox = new Box3().setFromObject(groupRef.current);
    const center = new Vector3();
    scaledBox.getCenter(center);
    groupRef.current.position.set(-center.x, -scaledBox.min.y, -center.z);
  }, [scene]);

  useEffect(() => {
    if (!groupRef.current) return;
    const interiorBox = new Box3();
    let foundInterior = false;

    groupRef.current.traverse((child) => {
      if (!child.isMesh) return;
      const name = child.name.toLowerCase();
      if (
        name.includes("interior") ||
        name.includes("seat") ||
        name.includes("cockpit") ||
        name.includes("cabin")
      ) {
        interiorBox.expandByObject(child);
        foundInterior = true;
      }
    });

    const targetBox = foundInterior
      ? interiorBox
      : new Box3().setFromObject(groupRef.current);
    const center = new Vector3();
    const size = new Vector3();
    targetBox.getCenter(center);
    targetBox.getSize(size);

    setInteriorBounds({
      center: [center.x, center.y, center.z],
      size: [size.x, size.y, size.z],
    });
  }, [scene, setInteriorBounds]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function CameraRig({
  controlsRef,
  cameraPreset,
  defaultCamPos,
  defaultTarget,
  interiorCamPos,
  interiorTarget,
  isInterior,
  interiorBounds,
  isUserInteractingRef,
  lastPresetRef,
  freezeRigRef,
}) {
  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    if (isUserInteractingRef.current) return;
    if (freezeRigRef.current) return;
    const targetPos = isInterior ? interiorCamPos : defaultCamPos;
    const targetLook = isInterior ? interiorTarget : defaultTarget;
    const lerpSpeed = lastPresetRef.current === cameraPreset ? 0.08 : 0.16;
    camera.position.lerp(targetPos, lerpSpeed);
    controlsRef.current.target.lerp(targetLook, lerpSpeed);
    controlsRef.current.update();
    lastPresetRef.current = cameraPreset;
    const posClose = camera.position.distanceTo(targetPos) < 0.01;
    const targetClose = controlsRef.current.target.distanceTo(targetLook) < 0.01;
    if (posClose && targetClose) {
      freezeRigRef.current = true;
    }
  });

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    if (!interiorBounds) return;
    if (!isInterior) return;

    const [cx, cy, cz] = interiorBounds.center;
    const [sx, sy, sz] = interiorBounds.size;
    const center = new Vector3(cx, cy, cz);
    const radius = Math.max(0.35, Math.max(sx, sy, sz) * 0.35);

    const dir = camera.position.clone().sub(center);
    const dist = dir.length();
    if (dist > radius) {
      dir.normalize().multiplyScalar(radius);
      camera.position.copy(center.clone().add(dir));
    }

    const target = controlsRef.current.target;
    const targetDir = target.clone().sub(center);
    const targetDist = targetDir.length();
    if (targetDist > radius) {
      targetDir.normalize().multiplyScalar(radius);
      controlsRef.current.target.copy(center.clone().add(targetDir));
    }
  });
  return null;
}

function InteriorLookControls({ enabled, cameraPosition, target }) {
  const { gl, camera } = useThree();
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const lastFovRef = useRef(camera.fov);

  useEffect(() => {
    if (!enabled) return;
    const element = gl.domElement;
    const handleDown = (event) => {
      isDraggingRef.current = true;
      lastRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleUp = () => {
      isDraggingRef.current = false;
    };
    const handleMove = (event) => {
      if (!isDraggingRef.current) return;
      const dx = event.clientX - lastRef.current.x;
      const dy = event.clientY - lastRef.current.y;
      lastRef.current = { x: event.clientX, y: event.clientY };
      yawRef.current -= dx * 0.004;
      pitchRef.current -= dy * 0.004;
      const limit = Math.PI / 2 - 0.05;
      pitchRef.current = Math.max(-limit, Math.min(limit, pitchRef.current));
    };

    element.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointermove", handleMove);
    return () => {
      element.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointermove", handleMove);
    };
  }, [enabled, gl]);

  useFrame(() => {
    if (!enabled) return;
    const desiredFov = 24;
    if (camera.fov !== desiredFov) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
      lastFovRef.current = desiredFov;
    }
    camera.position.copy(cameraPosition);
    const dir = new Vector3(
      Math.cos(pitchRef.current) * Math.sin(yawRef.current),
      Math.sin(pitchRef.current),
      Math.cos(pitchRef.current) * Math.cos(yawRef.current)
    );
    const lookAtPos = cameraPosition.clone().add(dir);
    camera.lookAt(lookAtPos);
  });

  useEffect(() => {
    if (!enabled) return;
    const yaw = Math.atan2(
      target.x - cameraPosition.x,
      target.z - cameraPosition.z
    );
    const pitch =
      Math.atan2(
        target.y - cameraPosition.y,
        Math.hypot(target.x - cameraPosition.x, target.z - cameraPosition.z)
      ) || 0;
    yawRef.current = yaw;
    pitchRef.current = pitch;
    return () => {
      if (camera.fov !== 35) {
        camera.fov = 35;
        camera.updateProjectionMatrix();
      }
    };
  }, [enabled, camera, cameraPosition, target]);

  return null;
}

export default function CarCanvas() {
  const { config, cameraResetKey, cameraPreset, interiorBounds } = useCarStore();
  const [dpr, setDpr] = useState([1, 1.5]);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(config.autoRotate);
  const idleTimeout = useRef(null);
  const controlsRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const lastPresetRef = useRef(cameraPreset);
  const freezeRigRef = useRef(false);
  const defaultCamPos = useMemo(() => new Vector3(5.2, 2.2, 9), []);
  const defaultTarget = useMemo(() => new Vector3(0, 0.6, 0), []);
  const isInterior = cameraPreset.startsWith("interior");
  const interiorCamPos = useMemo(() => {
    if (!interiorBounds) return new Vector3(0, 1.1, 0.6);
    const [cx, cy, cz] = interiorBounds.center;
    const [, sy, sz] = interiorBounds.size;
    if (cameraPreset === "interior-rear") {
      return new Vector3(cx, cy + sy * 0.18, cz - sz * 0.05);
    }
    return new Vector3(cx, cy + sy * 0.2, cz + sz * 0.25);
  }, [interiorBounds, cameraPreset]);
  const interiorTarget = useMemo(() => {
    if (!interiorBounds) return new Vector3(0, 1.02, -0.2);
    const [cx, cy, cz] = interiorBounds.center;
    const [, , sz] = interiorBounds.size;
    if (cameraPreset === "interior-rear") {
      return new Vector3(cx, cy, cz + sz * 0.15);
    }
    return new Vector3(cx, cy, cz + sz * 0.05);
  }, [interiorBounds, cameraPreset]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const setMatch = () => setDpr(mq.matches ? [1, 1.3] : [1, 2]);
    setMatch();
    mq.addEventListener("change", setMatch);
    return () => mq.removeEventListener("change", setMatch);
  }, []);

  useEffect(() => {
    setAutoRotateEnabled(config.autoRotate);
  }, [config.autoRotate]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    freezeRigRef.current = false;
  }, [cameraResetKey]);

  useEffect(() => {
    freezeRigRef.current = false;
    lastPresetRef.current = cameraPreset;
  }, [cameraPreset]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isInterior;
    }
  }, [isInterior]);

  const handleStart = useCallback(() => {
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }
    isUserInteractingRef.current = true;
    if (isInterior) {
      freezeRigRef.current = true;
    }
    setAutoRotateEnabled(false);
  }, [isInterior]);

  const handleEnd = useCallback(() => {
    isUserInteractingRef.current = false;
    if (!config.autoRotate || isInterior) return;
    idleTimeout.current = setTimeout(() => {
      setAutoRotateEnabled(true);
    }, 2200);
  }, [config.autoRotate, isInterior]);

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [5.2, 2.2, 9], fov: 35 }}
        gl={{
          physicallyCorrectLights: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <SoftShadows size={35} samples={10} focus={0.5} />
          <ambientLight intensity={0.4} />
          <directionalLight
            intensity={2.2}
            position={[5, 8, 4]}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <PorscheModel />
          <CameraRig
            controlsRef={controlsRef}
            cameraPreset={cameraPreset}
            defaultCamPos={defaultCamPos}
            defaultTarget={defaultTarget}
            interiorCamPos={interiorCamPos}
            interiorTarget={interiorTarget}
            isInterior={isInterior}
            interiorBounds={interiorBounds}
            isUserInteractingRef={isUserInteractingRef}
            lastPresetRef={lastPresetRef}
            freezeRigRef={freezeRigRef}
          />
          <InteriorLookControls
            enabled={isInterior}
            cameraPosition={interiorCamPos}
            target={interiorTarget}
          />
          <OrbitControls
            ref={controlsRef}
            enabled={!isInterior}
            enablePan={false}
            enableZoom={!isInterior}
            enableDamping
            dampingFactor={0.08}
            minDistance={isInterior ? 0.15 : 2}
            maxDistance={
              isInterior
                ? Math.max(1.5, (interiorBounds?.size?.[2] || 1) * 1.2)
                : 14
            }
            minPolarAngle={isInterior ? 0.6 : 0}
            maxPolarAngle={isInterior ? 2.6 : Math.PI}
            minAzimuthAngle={isInterior ? -2.2 : -Infinity}
            maxAzimuthAngle={isInterior ? 2.2 : Infinity}
            autoRotate={autoRotateEnabled}
            autoRotateSpeed={0.6}
            onStart={handleStart}
            onEnd={handleEnd}
          />
          <ContactShadows
            opacity={0.6}
            scale={10}
            blur={2.8}
            far={6}
            resolution={1024}
            position={[0, -1.15, 0]}
          />
          <Environment preset={config.environment} background />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/scene.gltf", true);
