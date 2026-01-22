import * as THREE from "https://cdn.skypack.dev/three@0.152.2";
import GUI from "https://cdn.skypack.dev/lil-gui";

/* ==================================================
   IMAGE LIST (MATCH script.js)
================================================== */
const IMAGES = ["./1.jpg", "./3.jpg", "./2.jpg", "./4.jpg", "./5.jpg"];

/* ==================================================
   DISTORTION SEEDS PER IMAGE
================================================== */
const DISTORTION_AB = [
  { A: 1.5, B: 0.1},
  { A: 2.0, B: 0.3 },
  { A: 1.7, B: 0.05 },
  { A: 1.9, B: 0.3 },
  { A: 1.5, B: 0.04 }
];

const MIN_X = 0.005;
const MAX_X = 0.035;

const MIN_Y = 0.003;
const MAX_Y = 0.015;

let mouseX = 0.5; // normalized
let mouseY = 0.5;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

function mapRange(v, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin));
}


/* ==================================================
   Load shaders
================================================== */
async function loadShader(url) {
  const res = await fetch(url);
  return await res.text();
}

/* ==================================================
   Canvas & Scene
================================================== */
const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();

/* ==================================================
   Camera
================================================== */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 0, 1000);
scene.add(camera);

/* ==================================================
   Renderer
================================================== */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

/* ==================================================
   GUI BAR (GIỮ NGUYÊN)
================================================== */
const gui = new GUI();
gui.hide();

const params = { distortion: 0.3 };
window.DistortionState = params;

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
  marker.style.transform =
    `translateX(${t * (BAR_WIDTH - MARKER_WIDTH)}px)`;
}

/* ==================================================
   INIT SHADERS
================================================== */
Promise.all([
  loadShader("./shaders/vertex.glsl"),
  loadShader("./shaders/fragment.glsl"),
]).then(([vertexShader, fragmentShader]) => {
  init(vertexShader, fragmentShader);
});

function init(vertexShader, fragmentShader) {

  /* =====================
     POINT CLOUD (CHỈ SỬA PHẦN NÀY)
  ===================== */
  const geometry = new THREE.PlaneGeometry(
    330 * 1.5,
    650 * 1.5,
    330,
    650
  );

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: null },
      uTime: { value: 0 },
      uDistortion: { value: params.distortion },
        uA: { value: 1.3 },
  uB: { value: 0.1 },

  uX: { value: 0.02 },
    uY: { value: 0.009 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

/* =====================
   TEXTURE + DISTORTION SYNC
===================== */
const textureLoader = new THREE.TextureLoader();

function applyDistortionByImage(src) {
  const index = IMAGES.indexOf(src);
  const profile = DISTORTION_AB[index] ?? DISTORTION_AB[0];

  material.uniforms.uA.value = profile.A;
  material.uniforms.uB.value = profile.B;
}

function applyImage(src) {
  if (!src) return;

  textureLoader.load(src, tex => {
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    material.uniforms.uTexture.value = tex;

    document.documentElement.style.setProperty(
      "--box-image",
      `url(${src})`
    );
  });
}

const ImageState = window.ImageState;

// init lần đầu
if (ImageState?.src) {
  applyDistortionByImage(ImageState.src);
  applyImage(ImageState.src);
}

// khi đổi scene
ImageState?.onChange(src => {
  applyDistortionByImage(src);
  applyImage(src);
});


  /* =====================
     TORUS – GIỮ NGUYÊN
  ===================== */
  const knotGeo = new THREE.TorusKnotGeometry(200, 200, 200);
  const knotEdges = new THREE.EdgesGeometry(knotGeo);
  const knotMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
  });
  const knot = new THREE.LineSegments(knotEdges, knotMaterial);
  scene.add(knot);

  /* =====================
     CUBE – GIỮ NGUYÊN
  ===================== */
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

  /* =====================
     DOTS – GIỮ NGUYÊN
  ===================== */
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

  /* =====================
     ANIMATE – GIỮ NGUYÊN HOÀN TOÀN
  ===================== */
  const clock = new THREE.Clock();

  function tick() {
    const time = clock.getElapsedTime();

    material.uniforms.uTime.value = time;
    material.uniforms.uDistortion.value = params.distortion;

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

    // map mouse → target values
const targetX = mapRange(mouseX, 0, 1, MIN_X, MAX_X);
const targetY = mapRange(mouseY, 0, 1, MIN_Y, MAX_Y);

// smooth speed
const XY_SPEED = 0.06;

// lerp cho mượt
material.uniforms.uX.value = THREE.MathUtils.lerp(
  material.uniforms.uX.value,
  targetX,
  XY_SPEED
);

material.uniforms.uY.value = THREE.MathUtils.lerp(
  material.uniforms.uY.value,
  targetY,
  XY_SPEED
);


    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}

// =========================
// LOADING SCREEN
// =========================
// =========================
// LOADING SCREEN
// =========================

const loadingOverlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");

let canStart = false;
let experienceStarted = false;

let loadingInterval = null;
let dotCount = 0;

// START DOT ANIMATION
function startLoadingAnimation() {
  loadingInterval = setInterval(() => {
    const dots = ".".repeat(dotCount);
    loadingText.textContent = `[Loading${dots}]`;

    dotCount = (dotCount + 1) % 4; // 0 → 1 → 2 → 3 → 0
  }, 400);
}

// STOP DOT ANIMATION
function stopLoadingAnimation() {
  clearInterval(loadingInterval);
}

// LOAD ÍT NHẤT 2s
window.addEventListener("load", () => {
  startLoadingAnimation();

  setTimeout(() => {
    stopLoadingAnimation();
    loadingText.textContent = "[S]tart";
    loadingText.classList.add("ready");
    canStart = true;
  }, 2000);
});


// START EXPERIENCE (CHỈ GỌI 1 LẦN)
function startExperience() {
  if (!canStart || experienceStarted) return;

  experienceStarted = true;
  loadingOverlay.classList.add("hidden");

  // 🔊 CHỈ BẬT NHẠC LẦN ĐẦU Ở ĐÂY
  if (typeof toggleMusic === "function" && !musicPlaying) {
    toggleMusic();
  }
}

// CLICK START
loadingText.addEventListener("click", () => {
  startExperience();
});

// PRESS S — CHỈ HOẠT ĐỘNG TRƯỚC KHI START
window.addEventListener("keydown", (e) => {
  if ((e.key === "s" || e.key === "S") && canStart && !experienceStarted) {
    startExperience();
  }
});


/* ==================================================
   RESIZE
================================================== */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
