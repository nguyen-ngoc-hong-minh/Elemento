import * as htmlToImage from "https://cdn.skypack.dev/html-to-image@1.11.11";

/* ==================================================
   IMAGE LIST & IMAGE STATE (STATIC ONLY)
================================================== */
const IMAGES = ["./1.jpg", "./3.jpg", "./2.jpg", "./4.jpg", "./5.jpg"];
let currentIndex = 1;

const ImageState = {
  src: IMAGES[0],
  listeners: [],
  set(src) {
    this.src = src;
    this.listeners.forEach(fn => fn(src));
  },
  onChange(fn) {
    this.listeners.push(fn);
  }
};
window.ImageState = ImageState;

/* ==================================================
   IMAGE ↔ CONTENT MAP
================================================== */
const imageToContentMap = new Map();
IMAGES.forEach((_, i) => imageToContentMap.set(i, i));

/* ==================================================
   DOM
================================================== */
const headingEl = document.querySelector(".heading");
const subtitleEl = document.querySelector(".subtitle");
const bodyEl = document.querySelector(".body-text");

/* ==================================================
   IMAGE NAVIGATION
================================================== */
function goToIndex(index) {
  currentIndex = index;
  ImageState.set(IMAGES[index]);

  const key = imageToContentMap.get(index);
  setContent(key);
}

function nextImage() {
  goToIndex((currentIndex + 1) % IMAGES.length);
}

function prevImage() {
  goToIndex((currentIndex - 1 + IMAGES.length) % IMAGES.length);
}

/* ==================================================
   CONTENT DATA
================================================== */
const CONTENTS = [
  {
    title: "Wade of Eternity",
    subtitle: [
      "| Song of Grief Song of |",
      "| Grief Song of Grief Song of Grief |",
      "| Song of Grief Song of Grief |"
    ],
    body: "Wade of Eternity Lorem Ipsum is simply dummy text."
  },
  {
    title: "Breath of Wood",
    subtitle: [
      "| Growth without force |",
      "| Direction without noise |",
      "| Becoming unseen |"
    ],
    body: "Breath of Wood Lorem Ipsum is simply dummy text."
  },
  {
    title: "Still Water",
    subtitle: [
      "| Reflection without source |",
      "| Depth without gravity |",
      "| Motion without trace |"
    ],
    body: "Water does not resist."
  },
  {
    title: "Veins of Stone",
    subtitle: [
      "| Pressure remembers |",
      "| Weight becomes form |",
      "| Time hardens |"
    ],
    body: "Veins of Stone Lorem Ipsum."
  },
  {
    title: "Ash and Fire",
    subtitle: [
      "| Heat without memory |",
      "| Destruction clarifies |",
      "| Essence remains |"
    ],
    body: "Ash and Fire Lorem Ipsum."
  }
];

/* ==================================================
   SET CONTENT
================================================== */
function setContent(key) {
  const data = CONTENTS[key];
  if (!data) return;

  headingEl.textContent = data.title;
  setSubtitleLines(data.subtitle);
  setBodyText(data.body);
}

/* ==================================================
   SUBTITLE ENGINE
================================================== */
let subtitlePaused = false;
let subtitleTimer = null;
const SUBTITLE_DELAY = 400;

function rotateSubtitleOnce() {
  if (subtitlePaused || subtitleEl.children.length < 2) return;
  subtitleEl.appendChild(subtitleEl.children[0]);
  subtitleTimer = setTimeout(rotateSubtitleOnce, SUBTITLE_DELAY);
}

function stopSubtitle() {
  subtitlePaused = true;
  clearTimeout(subtitleTimer);
}

function startSubtitle() {
  subtitlePaused = false;
  rotateSubtitleOnce();
}

function setSubtitleLines(lines = []) {
  stopSubtitle();
  subtitleEl.innerHTML = "";

  lines.forEach(text => {
    const d = document.createElement("div");
    d.className = "subtitle-line";
    d.textContent = text;
    subtitleEl.appendChild(d);
  });

  requestAnimationFrame(startSubtitle);
}

subtitleEl.addEventListener("mouseenter", stopSubtitle);
subtitleEl.addEventListener("mouseleave", startSubtitle);

/* ==================================================
   BODY TEXT ENGINE
================================================== */
let bodyLines = [];
let currentLine = 0;
let bodyPaused = false;
let revealTimer = null;
let loopTimer = null;

const REVEAL_DELAY = 220;
const LOOP_DELAY = 300;

function buildBodyLines(text) {
  bodyEl.innerHTML = "";
  const words = text.trim().split(" ");
  const spans = [];

  words.forEach(w => {
    const s = document.createElement("span");
    s.textContent = w + " ";
    bodyEl.appendChild(s);
    spans.push(s);
  });

  const map = {};
  spans.forEach(s => {
    const top = s.offsetTop;
    (map[top] ||= []).push(s);
  });

  bodyEl.innerHTML = "";
  Object.values(map).forEach(words => {
    const line = document.createElement("div");
    line.className = "body-line";

    const span = document.createElement("span");
    span.textContent = words.map(w => w.textContent).join("");
    span.style.opacity = 0;

    line.appendChild(span);
    bodyEl.appendChild(line);
  });

  bodyLines = [...bodyEl.querySelectorAll(".body-line span")];
}

function resetBody() {
  bodyLines.forEach(s => (s.style.opacity = 0));
  bodyEl.style.transform = "translateY(50%)";
  currentLine = 0;
}

function revealNextLine() {
  if (bodyPaused) return;

  if (currentLine >= bodyLines.length) {
    loopTimer = setTimeout(playBodyFromStart, LOOP_DELAY);
    return;
  }

  bodyLines[currentLine].style.opacity = 1;
  bodyEl.style.transform =
    `translateY(${50 - ((currentLine + 1) / bodyLines.length) * 50}%)`;

  currentLine++;
  revealTimer = setTimeout(revealNextLine, REVEAL_DELAY);
}

function playBodyFromStart() {
  clearTimeout(revealTimer);
  clearTimeout(loopTimer);
  resetBody();
  revealNextLine();
}

function setBodyText(text) {
  bodyPaused = false;
  buildBodyLines(text);
  playBodyFromStart();
}

bodyEl.addEventListener("mouseenter", () => (bodyPaused = true));
bodyEl.addEventListener("mouseleave", () => {
  if (!bodyPaused) return;
  bodyPaused = false;
  revealNextLine();
});

/* ==================================================
   SAFE BOOT
================================================== */
document.fonts.ready.then(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      goToIndex(0);
    });
  });
});

/* ==================================================
   EXPORT
================================================== */
const EXPORT_KEY = "c";
const EXPORT_NAME = "Your Elemento";

const glCanvas = document.querySelector(".webgl");
const uiNode = document.querySelector(".ui");
const captureBtn = document.getElementById("capture");

async function exportArtwork() {
  const width = glCanvas.width;
  const height = glCanvas.height;

  const uiDataUrl = await htmlToImage.toPng(uiNode, {
    backgroundColor: "transparent",
    cacheBust: true,
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
  ctx.drawImage(glCanvas, 0, 0);
  ctx.drawImage(uiImage, 0, 0);

  const link = document.createElement("a");
  link.download = `${EXPORT_NAME}.png`;
  link.href = finalCanvas.toDataURL();
  link.click();
}

/* ==================================================
   KEY EVENTS
================================================== */
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key.toLowerCase() === EXPORT_KEY) exportArtwork();
});

document.getElementById("next")?.addEventListener("click", e => {
  e.stopPropagation();
  nextImage();
});

document.getElementById("prev")?.addEventListener("click", e => {
  e.stopPropagation();
  prevImage();
});

captureBtn?.addEventListener("click", e => {
  e.stopPropagation();
  exportArtwork();
});
