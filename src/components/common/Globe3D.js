import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_RADIUS = 2.5;
const UP = new THREE.Vector3(0, 1, 0);
// Bấm = nhả chuột gần chỗ nhấn; kéo xoay quả địa cầu thì không tính là chọn ghim
const CLICK_MAX_DRAG_PX = 6;
const NO_RAYCAST = () => null;
// r3f chỉ chiếu tia vào vật có handler → gắn handler rỗng cho quả địa cầu để nó che ghim ở mặt sau
const NOOP = () => {};

/** Vĩ độ/kinh độ → toạ độ trên sphereGeometry của three (texture equirectangular, u=0 ở kinh độ -180). */
function latLonToVector(lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda)
  );
}

/**
 * Ghim đâm theo pháp tuyến bề mặt. Chỉ vùng bấm vô hình nhận tia chiếu; ghim chỉ phản hồi khi nó là vật gần nhất
 * (ghim ở mặt sau bị quả địa cầu che thì bỏ qua). Nhãn ẩn khi bị quả địa cầu (`earthRef`) che.
 */
function Pin({ place, label, selected, onSelect, onHover, earthRef }) {
  const [hovered, setHovered] = useState(false);
  const { position, quaternion } = useMemo(() => {
    const pos = latLonToVector(place.lat, place.lon, EARTH_RADIUS);
    return { position: pos, quaternion: new THREE.Quaternion().setFromUnitVectors(UP, pos.clone().normalize()) };
  }, [place.lat, place.lon]);

  const isFront = (e) => e.intersections[0]?.object.userData.pinKey === place.key;
  const setHover = (value) => {
    setHovered(value);
    onHover(value);
    document.body.style.cursor = value ? 'pointer' : '';
  };

  const color = selected ? '#f59e0b' : hovered ? '#ffffff' : '#ef4444';
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.09, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 6]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.2, 0]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[selected || hovered ? 0.075 : 0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Vùng bấm lớn hơn đầu ghim cho dễ chọn (vô hình) */}
      <mesh
        position={[0, 0.18, 0]}
        userData={{ pinKey: place.key }}
        onPointerOver={(e) => isFront(e) && setHover(true)}
        onPointerOut={() => hovered && setHover(false)}
        onClick={(e) => {
          if (!isFront(e) || e.delta > CLICK_MAX_DRAG_PX) return;
          e.stopPropagation();
          onSelect(place.key);
        }}
      >
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {(hovered || selected) && (
        // Nhãn đặt ở đầu ghim, đẩy lên theo màn hình (ghim quay thẳng ra trước thì "phía trên" 3D trùng chính ghim)
        <Html position={[0, 0.2, 0]} occlude={[earthRef]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none', transform: 'translate(-50%, calc(-100% - 14px))' }}>
          <span className="block whitespace-nowrap rounded-full bg-slate-900/85 px-3 py-1 text-xs font-bold text-white shadow-lg">
            {label(place)}
          </span>
        </Html>
      )}
    </group>
  );
}

/**
 * Chọn ghim (bấm ghim hoặc nút tên địa điểm) → xoay camera quanh tâm cho ghim quay ra phía trước,
 * giữ nguyên khoảng cách zoom hiện tại.
 */
function FocusOnSelected({ place, groupRef }) {
  const { camera, controls } = useThree();
  const animating = useRef(false);
  useEffect(() => {
    animating.current = !!place;
  }, [place]);
  // Người dùng tự kéo xoay → thôi tự quay tới ghim
  useEffect(() => {
    if (!controls) return undefined;
    const stop = () => {
      animating.current = false;
    };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame(() => {
    if (!animating.current || !place || !groupRef.current) return;
    const center = new THREE.Vector3();
    groupRef.current.getWorldPosition(center);
    const pinWorld = groupRef.current.localToWorld(latLonToVector(place.lat, place.lon, EARTH_RADIUS));
    const dir = pinWorld.sub(center).normalize();
    const distance = camera.position.distanceTo(center);
    const current = camera.position.clone().sub(center).normalize();
    if (current.angleTo(dir) < 0.005) {
      animating.current = false;
      return;
    }
    current.lerp(dir, 0.08).normalize();
    camera.position.copy(center).addScaledVector(current, distance);
    camera.lookAt(center);
    controls?.update();
  });
  return null;
}

function EarthMesh({ places, selectedKey, onSelect, pinLabel, paused, onPinHover }) {
  const groupRef = useRef();
  const earthRef = useRef();

  // Load realistic earth textures
  const [colorMap, normalMap, specularMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  ]);

  // Rotate the earth slightly for a dynamic feel (dừng khi đang trỏ / đã chọn ghim)
  useFrame(() => {
    if (groupRef.current && !paused) groupRef.current.rotation.y += 0.0005;
  });

  return (
    <group>
      {/* Lighting for the earth */}
      <ambientLight intensity={4.5} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={4} color="#ffffff" />
      <directionalLight position={[-10, 0, -5]} intensity={2.5} color="#ffffff" />

      {/* Base Earth + ghim quay cùng nhau */}
      <group ref={groupRef}>
        <mesh ref={earthRef} onPointerMove={NOOP}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            roughnessMap={specularMap}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        {places.map((place) => (
          <Pin
            key={place.key}
            place={place}
            label={pinLabel}
            selected={place.key === selectedKey}
            onSelect={onSelect}
            onHover={onPinHover}
            earthRef={earthRef}
          />
        ))}
      </group>
      <FocusOnSelected place={places.find((p) => p.key === selectedKey)} groupRef={groupRef} />
    </group>
  );
}

/**
 * Quả địa cầu 3D. `places` [{key, lat, lon}] hiện thành ghim; bấm ghim → onSelect(key).
 * `pinLabel(place)` là nhãn hiện khi trỏ / đang chọn. Đang trỏ hoặc đã chọn ghim thì ngừng tự quay.
 */
function Globe({ places = [], selectedKey = null, onSelect = () => {}, pinLabel = (p) => p.key }) {
  const [hoveringPin, setHoveringPin] = useState(false);
  const paused = hoveringPin || selectedKey != null;
  // body có `zoom` (index.css: 0.75) → canvas đo khung bằng getBoundingClientRect bị thu nhỏ và vẽ lệch góc trên-trái.
  // Bù ngược zoom cho riêng khung canvas để kích thước đo = kích thước hiển thị.
  const [bodyZoom] = useState(() => parseFloat(window.getComputedStyle(document.body).zoom) || 1);

  return (
    <div className="w-full h-full relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617]">
      {/* Phần trăm không bị zoom nhân lên → giữ 100% */}
      <div style={{ zoom: 1 / bodyZoom, width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Dừng bồng bềnh khi đang trỏ / đã chọn ghim để ghim không trôi khỏi con trỏ */}
          <Float enabled={!paused} speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <EarthMesh
              places={places}
              selectedKey={selectedKey}
              onSelect={onSelect}
              pinLabel={pinLabel}
              paused={paused}
              onPinHover={setHoveringPin}
            />

            {/* Stars background */}
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
          </Float>
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.8}
          minDistance={2.6}
          maxDistance={15}
          makeDefault
          autoRotate={!paused}
          autoRotateSpeed={0.3}
        />
      </Canvas>
      </div>

      {/* Overlay gradient for better visual integration */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none opacity-80" />
    </div>
  );
}

export default Globe;
