import * as htmlToImage from "https://cdn.skypack.dev/html-to-image@1.11.11";
import * as THREE from "https://cdn.skypack.dev/three@0.152.2";
import GUI from "https://cdn.skypack.dev/lil-gui";

// =====================
// Load image
// =====================]
const ImageState = {
  src: "./4.jpg",
  listeners: []
};

window.DistortionState = {
  value: 0.3   // same as params.distortion
};

function setImageSrc(src) {
  ImageState.src = src;
  ImageState.listeners.forEach(fn => fn(src));
}

function onImageChange(fn) {
  ImageState.listeners.push(fn);
}

window.ImageState = {
  get src() {
    return ImageState.src;
  },
  onChange(fn) {
    ImageState.listeners.push(fn);
  }
};

// =====================
// Load shaders
// =====================
async function loadShader(url) {
  const res = await fetch(url);
  return await res.text();
}

// =====================
// Canvas & Scene
// =====================
const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();

// =====================
// Camera
// =====================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 0, 1000);
scene.add(camera);

// =====================
// Renderer
// =====================
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

// =====================
// GUI - Bar
// =====================
const gui = new GUI();
gui.hide();

const params = { distortion: 0.3 };

const bar = document.getElementById("distortionBar");
const marker = bar.querySelector(".marker-svg");

const BAR_WIDTH = 128;
const MARKER_WIDTH = 1;
const MIN = 0.3;
const MAX = 1.0;
const STEP = 0.015;

let hoverBar = false;
let dragging = false;

bar.addEventListener("mouseenter", () => hoverBar = true);
bar.addEventListener("mouseleave", () => {
  hoverBar = false;
  dragging = false;
});

bar.addEventListener("mousedown", e => {
  dragging = true;
  e.preventDefault();
});

window.addEventListener("mouseup", () => dragging = false);

window.addEventListener("mousemove", e => {
  if (!dragging) return;

  const rect = bar.getBoundingClientRect();
  const x = THREE.MathUtils.clamp(e.clientX - rect.left, 0, rect.width);
  const t = x / rect.width;
  params.distortion = MIN + t * (MAX - MIN);
});

window.addEventListener("wheel", e => {
  if (!hoverBar) return;
  e.preventDefault();

  const dir = e.deltaY > 0 ? -1 : 1;
  params.distortion = THREE.MathUtils.clamp(
    params.distortion + dir * STEP,
    MIN,
    MAX
  );
}, { passive: false });

function updateMarker() {
  const t = (params.distortion - MIN) / (MAX - MIN);
  marker.style.transform = `translateX(${t * (BAR_WIDTH - MARKER_WIDTH)}px)`;
}

// =====================
// =====================
// DISTORTION
// =====================
// =====================
Promise.all([
  loadShader("./shaders/vertex.glsl"),
  loadShader("./shaders/fragment.glsl"),
]).then(([vertexShader, fragmentShader]) => {
  init(vertexShader, fragmentShader);
});

function init(vertexShader, fragmentShader) {

  // =====================
  // Pointcloud
  // =====================
  const geometry = new THREE.PlaneGeometry(330 * 1.5, 650 * 1.5, 330, 650);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: null },
      uTime: { value: 0 },
      uDistortion: { value: params.distortion },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // =====================
  // TEXTURE (SAU KHI MATERIAL TỒN TẠI)
  // =====================
  let texture;

  function loadTexture(src) {
    texture = new THREE.TextureLoader().load(src);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    material.uniforms.uTexture.value = texture;

    // sync CSS box image
    document.documentElement.style.setProperty(
      "--box-image",
      `url(${src})`
    );
  }

  loadTexture(ImageState.src);
  onImageChange(loadTexture);

  // =====================
  // Torus Knot
  // =====================
  const knotGeo = new THREE.TorusKnotGeometry(200, 200, 200);
  const knotEdges = new THREE.EdgesGeometry(knotGeo);
  const knotMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
  });
  const knot = new THREE.LineSegments(knotEdges, knotMaterial);
  scene.add(knot);

  // =====================
  // Cube
  // =====================
  const boxGeo = new THREE.BoxGeometry(170, 170, 170);
  const edges = new THREE.EdgesGeometry(boxGeo);
  const cubeMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const cube = new THREE.LineSegments(edges, cubeMaterial);
  scene.add(cube);

  // =====================
  // Dots
  // =====================
  const positions = edges.attributes.position.array;
  const dotCount = positions.length / 3;

  const dotGeo = new THREE.SphereGeometry(0.5, 9, 9);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const dots = new THREE.InstancedMesh(dotGeo, dotMat, dotCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < dotCount; i++) {
    dummy.position.set(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );
    dummy.updateMatrix();
    dots.setMatrixAt(i, dummy.matrix);
  }

  scene.add(dots);

  // =====================
  // Animate
  // =====================
  const clock = new THREE.Clock();

  function tick() {
    const time = clock.getElapsedTime();

    material.uniforms.uTime.value = time;
    material.uniforms.uDistortion.value = params.distortion;

window.DistortionState.value = params.distortion;


    updateMarker();

    cube.rotation.y += 0.001;
    cube.scale.setScalar(1 + params.distortion * 9);

    dots.rotation.copy(cube.rotation);
    dots.scale.copy(cube.scale);

    knot.rotation.y += 0.001;
    knot.scale.setScalar(1 + params.distortion * 9);

    knotMaterial.opacity =
      THREE.MathUtils.clamp(
        1.0 - (params.distortion - 0.12) / (1.0 - 0.12),
        0,
        1
      ) * 0.12;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}

  // ===============================
  // EXPORT PIPELINE
  // ===============================

  const EXPORT_KEY = "c";
  const EXPORT_NAME = "Your Elemento";

  const glCanvas = document.querySelector(".webgl");
  const uiNode = document.querySelector(".ui");
  const captureBtn = document.getElementById("capture");

  async function exportArtwork() {
    try {
      const width = glCanvas.width;
      const height = glCanvas.height;

      const uiDataUrl = await htmlToImage.toPng(uiNode, {
        pixelRatio: window.devicePixelRatio,
        backgroundColor: "transparent",
        preferredFontFormat: "woff2",
        cacheBust: true
      });

      const uiImage = new Image();
      uiImage.src = uiDataUrl;
      await uiImage.decode();

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = width;
      finalCanvas.height = height;

      const ctx = finalCanvas.getContext("2d");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(glCanvas, 0, 0, width, height);
      ctx.drawImage(uiImage, 0, 0, width, height);

      const link = document.createElement("a");
      link.download = `${EXPORT_NAME}.png`;
      link.href = finalCanvas.toDataURL("image/png");
      link.click();

      console.log("✅ Exported");

    } catch (e) {
      console.error("❌ Export failed", e);
    }
  }

  // Key C
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === EXPORT_KEY) {
      e.preventDefault();
      exportArtwork();
    }
  });

  // Click: #capture
  if (captureBtn) {
    captureBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportArtwork();
    });
  }


// =====================
// Resize
// =====================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});