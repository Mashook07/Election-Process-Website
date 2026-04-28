// ============================================
// VoteGuide AI — Three.js 3D Background
// ============================================

export function initThreeBackground(canvasContainer) {
  if (!canvasContainer || !window.THREE) return null;

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  canvasContainer.appendChild(renderer.domElement);

  // ── Particle System - Floating democratic particles ──
  const particleCount = 300;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  // Saffron: rgb(255,153,51), White: rgb(255,255,255), Emerald: rgb(19,136,8)
  const tricolors = [
    [1.0, 0.6, 0.2],   // Saffron
    [0.9, 0.92, 0.95],  // White-ish
    [0.075, 0.533, 0.031], // Emerald
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 15;

    const col = tricolors[Math.floor(Math.random() * tricolors.length)];
    colors[i * 3] = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];

    sizes[i] = Math.random() * 3 + 1;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ── Geometric shapes - Democracy symbols ──
  const shapes = [];
  
  // Ashoka Chakra-inspired ring
  const ringGeometry = new THREE.TorusGeometry(3, 0.05, 16, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x3366aa, transparent: true, opacity: 0.15, wireframe: true });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.set(6, 2, -10);
  scene.add(ring);
  shapes.push({ mesh: ring, rotSpeed: { x: 0.003, y: 0.005, z: 0.002 }, floatSpeed: 0.5, floatAmp: 0.5 });

  // Wireframe sphere - representing unity
  const sphereGeo = new THREE.IcosahedronGeometry(2, 1);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff9933, transparent: true, opacity: 0.08, wireframe: true });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(-8, -3, -12);
  scene.add(sphere);
  shapes.push({ mesh: sphere, rotSpeed: { x: 0.002, y: 0.003, z: 0.001 }, floatSpeed: 0.7, floatAmp: 0.8 });

  // Diamond shape
  const octGeo = new THREE.OctahedronGeometry(1.5, 0);
  const octMat = new THREE.MeshBasicMaterial({ color: 0x138808, transparent: true, opacity: 0.1, wireframe: true });
  const octahedron = new THREE.Mesh(octGeo, octMat);
  octahedron.position.set(-5, 4, -8);
  scene.add(octahedron);
  shapes.push({ mesh: octahedron, rotSpeed: { x: 0.004, y: 0.002, z: 0.003 }, floatSpeed: 0.6, floatAmp: 0.6 });

  // Additional small shapes
  for (let i = 0; i < 5; i++) {
    const geo = i % 2 === 0 ? new THREE.TetrahedronGeometry(0.5, 0) : new THREE.OctahedronGeometry(0.4, 0);
    const color = tricolors[i % 3];
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      transparent: true, opacity: 0.12, wireframe: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, -5 - Math.random() * 10);
    scene.add(mesh);
    shapes.push({
      mesh,
      rotSpeed: { x: 0.002 + Math.random() * 0.005, y: 0.003 + Math.random() * 0.004, z: 0.001 + Math.random() * 0.003 },
      floatSpeed: 0.3 + Math.random() * 0.7,
      floatAmp: 0.3 + Math.random() * 0.5
    });
  }

  // ── Connection lines between particles ──
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(300 * 6); // 300 lines max
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3d6291, transparent: true, opacity: 0.06 });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  camera.position.z = 20;

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation loop
  let animId;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Rotate particles slowly
    particles.rotation.y = time * 0.05 + mouseX * 0.1;
    particles.rotation.x = time * 0.03 + mouseY * 0.05;

    // Float particles
    const pos = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.003;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Animate shapes
    shapes.forEach(({ mesh, rotSpeed, floatSpeed, floatAmp }) => {
      mesh.rotation.x += rotSpeed.x;
      mesh.rotation.y += rotSpeed.y;
      mesh.rotation.z += rotSpeed.z;
      mesh.position.y += Math.sin(time * floatSpeed) * 0.005 * floatAmp;
    });

    // Camera subtle movement
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // Handle resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    canvasContainer.innerHTML = '';
  };
}
