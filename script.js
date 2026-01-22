import * as htmlToImage from "https://cdn.skypack.dev/html-to-image@1.11.11";

/* ==================================================
   IMAGE LIST & GLOBAL IMAGE STATE
================================================== */

const IMAGES = ["./1.jpg", "./3.jpg", "./2.jpg", "./4.jpg", "./5.jpg"];
let currentIndex = 0;

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
   IMAGE ↔ CONTENT INDEX MAP
================================================== */

const imageToContentMap = new Map();
IMAGES.forEach((_, i) => imageToContentMap.set(i, i));

/* ==================================================
   DOM REFERENCES (TEXT CONTENT)
================================================== */

const headingEl  = document.querySelector(".heading");
const subtitleEl = document.querySelector(".subtitle");
const bodyEl     = document.querySelector(".body-text");

/* ==================================================
   CONTENT DATA
================================================== */

const CONTENTS = [
  {
    title: "Edge Of Legacy",
    subtitle: [
      "| First blades to conquer new lands. |",
      "| Bells and gongs ringing through rituals. |",
      "| Coins clinking of exchange and civilization. |"
    ],
    body:
      "We have forgotten the weight of what we hold. Metal speaks in voices we've dulled over time — the ring of a blade cutting through history, the resonance of bronze bells calling to something sacred, the sharp clink of currency passing from hand to hand, building empires and breaking them. But if you pause, if you feel the cold surface warming under your palm, you'll hear them converging. This is not hardness. This is the element that has shaped us, sharpened us, taught us that strength and fragility are forged in the same fire. Elemento invites you to hold still. To listen to what endures. To let the metallic hum awaken something ancient within you, where sound becomes resolve, and resolve becomes legacy."
  },

  {
    title: "Currents Of Inheritance",
    subtitle: [
      "| Gentle ripples to rushing currents. |",
      "| Ancient songs passed down through centuries. |",
      "| Sweat falling, carrying weight of survival. |"
    ],
    body:
      "We move too quickly past the sounds that hold us. Water speaks in layers we've learned to ignore — the rush of a stream, the breath of something living beneath the waves, the quiet exhaustion of survival. But if you stop, if you truly listen, you'll hear them weaving together. This is not background noise. This is the harmony that has shaped us, sustained us, connected us to something older and larger than ourselves. Elemento invites you to slow down. To close your eyes. To let the current carry you inward, where sound becomes feeling, and feeling becomes memory."
  },

  {
    title: "Roots Of Wild",
    subtitle: [
      "| The tangled neurons of nature's great soul. |",
      "| Submission before the sovereign of forest. |",
      "| Sweet berries that nourish or kill. |"
    ],
    body:
      "We walk through green worlds we no longer understand. Wood speaks in whispers we've stopped translating — the deep network beneath our feet connecting everything unseen, the commanding presence of ancient trees that bend us to silence, the seductive taste of fruit that offers life or death with equal indifference. But if you kneel, if you press your ear to the earth, you'll hear them breathing as one. This is not stillness. This is the intelligence that has outlasted us, sheltered us, reminded us that survival is both gift and gamble. Elemento invites you to step into the canopy. To shed your certainty. To let the forest reclaim something wild within you, where sound becomes instinct, and instinct becomes reverence."
  },

  {
    title: "Flames Of Becoming",
    subtitle: [
      "| The first spark to roaring wildfire. |",
      "| Embers breathing in the darkness, alive. |",
      "| Burning away what no longer serves. |"
    ],
    body:
      "We fear what burns, yet fire has always been our companion. It crackles in layers we've forgotten how to read — the snap of kindling catching light, the low hum of embers holding heat through the night, the roar of something unleashed and unstoppable. But if you lean closer, if you let the warmth reach you, you'll hear them speaking as one. This is not destruction. This is the force that has forged us, renewed us, reminded us that growth requires letting go. Elemento invites you to sit by the flame. To feel its pulse. To let the heat stir something dormant inside you, where sound becomes urgency, and urgency becomes change."
  },

  {
    title: "Ground Of Return",
    subtitle: [
      "| Clay shaped into vessels, civilization. |",
      "| Treasures buried deep beneath tombs. |",
      "| Earth receives things back into silence. |"
    ],
    body:
      "We build upon what we refuse to remember. Earth speaks in echoes we've paved over — the hands that molded clay into memory, the weight of gold and bone sleeping undisturbed in darkness, the patient soil that opens to receive every ending and turn it into beginning. But if you dig, if you let the dirt gather under your nails, you'll hear them holding everything together. This is not emptiness. This is the foundation that has cradled us, claimed us, promised us that nothing is ever truly lost. Elemento invites you to touch the ground. To feel its pull. To let the earth remind you of something buried within you, where sound becomes gravity, and gravity becomes home."
  }
];

/* ==================================================
   CONTENT SETTERS
================================================== */

function setContent(key) {
  const data = CONTENTS[key];
  if (!data) return;

  headingEl.textContent = data.title;
  setSubtitleLines(data.subtitle);
  setBodyText(data.body);
}

/* ==================================================
   IMAGE NAVIGATION
================================================== */

function goToIndex(index) {
  currentIndex = index;
  ImageState.set(IMAGES[index]);

  const contentKey = imageToContentMap.get(index);
  setContent(contentKey);
}

function nextImage() {
  goToIndex((currentIndex + 1) % IMAGES.length);
}

function prevImage() {
  goToIndex((currentIndex - 1 + IMAGES.length) % IMAGES.length);
}

/* ==================================================
   SUBTITLE ROTATION ENGINE
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
   BODY TEXT REVEAL ENGINE
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

  words.forEach(word => {
    const s = document.createElement("span");
    s.textContent = word + " ";
    bodyEl.appendChild(s);
    spans.push(s);
  });

  const lineMap = {};
  spans.forEach(s => {
    const top = s.offsetTop;
    (lineMap[top] ||= []).push(s);
  });

  bodyEl.innerHTML = "";
  Object.values(lineMap).forEach(words => {
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
   EXPORT IMAGE
================================================== */

const EXPORT_KEY  = "c";
const EXPORT_NAME = "Your Elemento";

const glCanvas  = document.querySelector(".webgl");
const uiNode    = document.querySelector(".ui");
const captureBtn = document.getElementById("capture");

async function exportArtwork() {
  const width  = glCanvas.width;
  const height = glCanvas.height;

  const uiDataUrl = await htmlToImage.toPng(uiNode, {
    backgroundColor: "transparent",
    cacheBust: true
  });

  const uiImage = new Image();
  uiImage.src = uiDataUrl;
  await uiImage.decode();

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width  = width;
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
   INPUT EVENTS
================================================== */

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft")  prevImage();
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
