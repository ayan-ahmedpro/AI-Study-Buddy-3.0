import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  isDarkMode?: boolean;
  className?: string;
  interactive?: boolean;
}

export default function ThreeBackground({
  isDarkMode = true,
  className = '',
  interactive = true,
}: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(
      isDarkMode ? 0x030712 : 0xfdfcfb,
      0.0018
    );

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color definitions based on dark / light mode
    const primaryColorHex = isDarkMode ? 0x3b82f6 : 0x2563eb; // blue
    const secondaryColorHex = isDarkMode ? 0x8b5cf6 : 0x4f46e5; // indigo/purple
    const cyanColorHex = isDarkMode ? 0x06b6d4 : 0x0d9488; // cyan/teal
    const lineOpacity = isDarkMode ? 0.22 : 0.14;

    // 1. Interactive Particle Network (Neural Nodes)
    const particleCount = 130;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const bounds = { x: 120, y: 70, z: 80 };

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * bounds.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z;

      velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.08,
        z: (Math.random() - 0.5) * 0.08,
      });
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    // Particle sprite canvas texture
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, isDarkMode ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.8)');
        gradient.addColorStop(0.7, isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(79, 70, 229, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const pMaterial = new THREE.PointsMaterial({
      size: 3.2,
      map: createParticleTexture(),
      transparent: true,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      opacity: isDarkMode ? 0.9 : 0.75,
    });

    const particleSystem = new THREE.Points(particlesGeometry, pMaterial);
    scene.add(particleSystem);

    // Dynamic Connecting Lines Geometry
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({
      color: primaryColorHex,
      transparent: true,
      opacity: lineOpacity,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // 2. Floating 3D Geometric Objects (Icosahedron, TorusKnot, Dodecahedron, Octahedron)
    const createFloatingShape = (
      geo: THREE.BufferGeometry,
      color: number,
      x: number,
      y: number,
      z: number,
      scale: number
    ) => {
      const group = new THREE.Group();

      // Translucent Mesh
      const meshMat = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: isDarkMode ? 0.15 : 0.08,
        shininess: 90,
        side: THREE.DoubleSide,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, meshMat);

      // Glowing Wireframe
      const wireGeo = new THREE.WireframeGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: isDarkMode ? 0.5 : 0.3,
      });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);

      group.add(mesh);
      group.add(wireframe);
      group.position.set(x, y, z);
      group.scale.setScalar(scale);

      scene.add(group);
      return group;
    };

    const shape1 = createFloatingShape(
      new THREE.IcosahedronGeometry(7, 1),
      primaryColorHex,
      -38,
      18,
      -10,
      1.1
    );

    const shape2 = createFloatingShape(
      new THREE.TorusKnotGeometry(5, 1.4, 80, 16),
      secondaryColorHex,
      42,
      -12,
      -15,
      1.2
    );

    const shape3 = createFloatingShape(
      new THREE.DodecahedronGeometry(6, 0),
      cyanColorHex,
      -28,
      -22,
      5,
      1.0
    );

    const shape4 = createFloatingShape(
      new THREE.OctahedronGeometry(6, 0),
      primaryColorHex,
      35,
      22,
      0,
      0.9
    );

    // Orbiting Ring around Shape 1
    const ringGeo = new THREE.TorusGeometry(12, 0.15, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cyanColorHex,
      transparent: true,
      opacity: isDarkMode ? 0.4 : 0.25,
      wireframe: true,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    shape1.add(ringMesh);
    ringMesh.rotation.x = Math.PI / 3;

    // 3. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? 0x1e293b : 0xffffff,
      isDarkMode ? 1.5 : 2.0
    );
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primaryColorHex, 3, 150);
    pointLight1.position.set(30, 40, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(secondaryColorHex, 2.5, 150);
    pointLight2.position.set(-40, -30, 40);
    scene.add(pointLight2);

    // Mouse Interaction Parallax & Mouse Pointer Vector
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseX = (x / width - 0.5) * 2;
      mouseY = -(y / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Gentle camera movement
      camera.position.x = targetX * 12;
      camera.position.y = targetY * 12;
      camera.lookAt(0, 0, 0);

      // Rotate Floating Shapes
      if (shape1) {
        shape1.rotation.x = elapsedTime * 0.2;
        shape1.rotation.y = elapsedTime * 0.25;
        shape1.position.y = 18 + Math.sin(elapsedTime * 0.8) * 3;
      }
      if (shape2) {
        shape2.rotation.x = elapsedTime * -0.15;
        shape2.rotation.z = elapsedTime * 0.2;
        shape2.position.y = -12 + Math.cos(elapsedTime * 0.9) * 3;
      }
      if (shape3) {
        shape3.rotation.y = elapsedTime * 0.3;
        shape3.rotation.z = elapsedTime * 0.15;
        shape3.position.y = -22 + Math.sin(elapsedTime * 1.1) * 2.5;
      }
      if (shape4) {
        shape4.rotation.x = elapsedTime * 0.25;
        shape4.rotation.y = elapsedTime * -0.2;
        shape4.position.y = 22 + Math.cos(elapsedTime * 0.7) * 2.5;
      }

      // Update Particle Positions & Calculate Distance Connections
      const posAttr = particlesGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        posArray[i3] += velocities[i].x;
        posArray[i3 + 1] += velocities[i].y;
        posArray[i3 + 2] += velocities[i].z;

        // Bounce off bounds
        if (Math.abs(posArray[i3]) > bounds.x / 2) velocities[i].x *= -1;
        if (Math.abs(posArray[i3 + 1]) > bounds.y / 2) velocities[i].y *= -1;
        if (Math.abs(posArray[i3 + 2]) > bounds.z / 2) velocities[i].z *= -1;
      }

      posAttr.needsUpdate = true;

      // Build Connecting Lines between nearby particles
      const linePositions: number[] = [];
      const connectDistance = 22;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectDistance) {
            linePositions.push(
              posArray[i * 3],
              posArray[i * 3 + 1],
              posArray[i * 3 + 2],
              posArray[j * 3],
              posArray[j * 3 + 1],
              posArray[j * 3 + 2]
            );
          }
        }
      }

      linesGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(linePositions, 3)
      );

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three objects
      particlesGeometry.dispose();
      pMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      renderer.dispose();
    };
  }, [isDarkMode, interactive]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
