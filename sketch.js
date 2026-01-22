// =========================
// ABOUT OVERLAY
// =========================
const aboutBtn = document.getElementById("about");
const aboutOverlay = document.getElementById("about-overlay");

let aboutOpen = false;

function toggleAbout(force) {
  aboutOpen = force !== undefined ? force : !aboutOpen;
  aboutOverlay.classList.toggle("hidden", !aboutOpen);
}

aboutBtn.addEventListener("click", () => {
  toggleAbout();
});

aboutOverlay.addEventListener("click", (e) => {
  if (e.target === aboutOverlay) {
    toggleAbout(false);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "a" || e.key === "A") {
    toggleAbout();
  }
});

// =========================
// CREDIT OVERLAY
// =========================
const creditBtn = document.querySelector(".credit");
const aboutBox = document.querySelector(".about-box");

let creditOpen = false;

creditBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  creditOpen = !creditOpen;
  aboutBox.classList.toggle("show-credit", creditOpen);

  creditBtn.textContent = creditOpen ? "[Back]" : "[Credit]";
});

const CREDIT_TEXTS = [
  `
  Song: Aura<br>
  Composer: Sappheiros<br>
  Website: https://open.spotify.com/artist/<br>
  5ZVHXQZAIn9WJXvy6qn9K0<br>
  License: Creative Commons (BY 3.0)<br> 
  https://creativecommons.org/licenses/by/3.0/<br>
  Music powered by BreakingCopyright:<br>
  https://breakingcopyright.com
  `,

  `
  Song: Waters Edge<br>
  Composer: Pyrosion<br>
  Website: https://www.youtube.com/channel/<br>
  UCHX5zwVupCDjLZ-3fINQvKQ<br>
  License: Creative Commons (BY 3.0)<br>
  https://creativecommons.org/licenses/by/3.0/<br>
  Music powered by BreakingCopyright:<br>
   https://breakingcopyright.com
  `,

  `
  Song: Origami<br>
  Composer: Scott Buckley<br>
  Website: https://youtube.com/user/musicbyscottb<br>
  License: Creative Commons (BY 4.0)<br>
  https://creativecommons.org/licenses/by/4.0/<br>
  Music powered by BreakingCopyright:<br>
  https://breakingcopyright.com
  `,

  `
Song: Flowing Into The Darkness<br>
Composer: Nyoko<br>
Website: https://soundcloud.com/redowthered<br>
License: Free To Use YouTube license youtube-free<br>
Music powered by BreakingCopyright:<br>
https://breakingcopyright.com<br>
  `,

  `
  Song: Snowfall<br>
  Composer: Scott Buckley<br>
  Website: https://youtube.com/user/musicbyscottb<br>
  License: Creative Commons (BY 3.0)<br> 
  https://creativecommons.org/licenses/by/3.0/<br>
  Music powered by BreakingCopyright:<br>
  https://breakingcopyright.com
  `,
];
const creditContent = document.querySelector(".credit-content");

function updateCredit() {
  if (!creditContent) return;
  creditContent.innerHTML = CREDIT_TEXTS[currentTrackIndex] || "";
}

// =========================
// MUSIC
// =========================

let tracks = [];
let currentTrackIndex = 0;
let bgm;
let musicPlaying = false;

const FADE_TIME = 0.6;

const TRACK_OFFSETS = [0, 0, 0, 0, 3];

function preload() {
  tracks = [
    loadSound("AURA.mp3"),
    loadSound("WATERS EDGE.mp3"),
    loadSound("ORIGAMI.mp3"),
    loadSound("Flowing Into The Darkness.mp3"),
    loadSound("Snowfall.mp3"),
  ];
}

function setup() {
  getAudioContext().suspend();
  bgm = tracks[currentTrackIndex];
}

function toggleMusic() {
  if (!bgm || !bgm.isLoaded()) return;

  userStartAudio();

  if (!musicPlaying) {
    bgm.setVolume(0);
    const offset = TRACK_OFFSETS[currentTrackIndex] || 0;
    bgm.play(0, 1, 1, offset);

    bgm.amp(1, FADE_TIME);
    musicPlaying = true;
  } else {
    bgm.amp(0, FADE_TIME);
    setTimeout(() => {
      bgm.pause();
    }, FADE_TIME * 1000);
    musicPlaying = false;
  }

  updateCredit();

  updatePlayButton();
}

// =========================
// CHANGE TRACK
// =========================
function changeTrack(direction) {
  if (!tracks.length) return;

  userStartAudio();

  const wasPlaying = musicPlaying;

  if (bgm && bgm.isPlaying()) {
    bgm.amp(0, FADE_TIME);
  }

  setTimeout(() => {
    if (bgm) bgm.stop();

    currentTrackIndex =
      (currentTrackIndex + direction + tracks.length) % tracks.length;

    bgm = tracks[currentTrackIndex];

    if (wasPlaying && bgm.isLoaded()) {
      bgm.setVolume(0);
      const offset = TRACK_OFFSETS[currentTrackIndex] || 0;
      bgm.play(0, 1, 1, offset);

      bgm.amp(1, FADE_TIME);
      musicPlaying = true;
    }

    updateCredit();

    updatePlayButton();
  }, FADE_TIME * 1000);
}

// PLAY / PAUSE
function updatePlayButton() {
  const playBtn = document.getElementById("play");
  if (!playBtn) return;

  playBtn.textContent = musicPlaying ? "[P]ause music" : "[P]lay music";
}

// PLAY / PAUSE BUTTON
const playBtn = document.getElementById("play");
if (playBtn) {
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMusic();
  });
}

// PREV BUTTON
const prevBtn = document.getElementById("prev");
if (prevBtn) {
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    changeTrack(-1);
  });
}

// NEXT BUTTON
const nextBtn = document.getElementById("next");
if (nextBtn) {
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    changeTrack(1);
  });
}

// KEYBOARD
function keyPressed() {
  if (key === "p" || key === "P") {
    toggleMusic();
  }

  if (keyCode === RIGHT_ARROW) {
    changeTrack(1);
  }

  if (keyCode === LEFT_ARROW) {
    changeTrack(-1);
  }
}

// =====================
// ZEN MODE LOOP
// =====================
const navigation = document.querySelector(".navigation");
const content = document.querySelector(".content");
const boxesContainer = document.querySelector(".boxes");
const zenBtn = document.getElementById("zen");

let zenStep = 0;

function applyZenStep() {
  navigation.classList.remove("zen-hidden");
  content.classList.remove("zen-hidden");
  boxesContainer.classList.remove("zen-hidden");

  if (zenStep === 1) {
    navigation.classList.add("zen-hidden");
  }

  if (zenStep === 2) {
    navigation.classList.add("zen-hidden");
    content.classList.add("zen-hidden");
    boxesContainer.classList.add("zen-hidden");
  }
}

function toggleZen() {
  zenStep = (zenStep + 1) % 3;
  applyZenStep();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "z" || e.key === "Z") toggleZen();
});

zenBtn.addEventListener("click", toggleZen);

function resetZen() {
  zenStep = 0;
  applyZenStep();
}

// CLICK ANYWHERE
window.addEventListener("click", (e) => {
  if (e.target.closest("#zen")) return;
  resetZen();
});

// =====================
// BOX1 – DITHER
// =====================

const box1Sketch = (p) => {
  let ditherImg;
  let box1;
  let ditherTime = 0;

  let pixelSize = 1.0;

  const PIXEL_MIN = 1.0;
  const PIXEL_MAX = 5.0;

  const bayer4 = [
    [15, 7, 13, 5],
    [3, 11, 1, 9],
    [12, 4, 14, 6],
    [0, 8, 2, 10],
  ];

  // SETUP
  p.setup = () => {
    window.requestAnimationFrame(() => {
      box1 = document.getElementById("box1");
      if (!box1) {
        console.error("❌ box1 not found");
        return;
      }

      const c = p.createCanvas(box1.clientWidth, box1.clientHeight);
      c.parent(box1);
      c.style("position", "absolute");
      c.style("inset", "0");
      c.style("z-index", "1");

      p.noSmooth();
      p.pixelDensity(1);
      p.loop();

      loadDither(window.ImageState.src);
      window.ImageState.onChange(loadDither);

      box1.addEventListener("wheel", onBoxScroll, { passive: false });
    });
  };

  // SCROLL
  function onBoxScroll(e) {
    e.preventDefault();

    const dir = e.deltaY < 0 ? 1 : -1;
    pixelSize += dir * 0.5;
    pixelSize = p.constrain(pixelSize, PIXEL_MIN, PIXEL_MAX);
  }

  // LOAD IMAGE
  function loadDither(src) {
    ditherImg = p.loadImage(
      src,
      () => p.redraw(),
      () => console.error("❌ Dither image failed:", src),
    );
  }

  // DRAW
  p.draw = () => {
    if (!ditherImg) return;

    p.clear();
    ditherImg.loadPixels();

    ditherTime += 0.1;

    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        const ix = Math.floor(p.map(x, 0, p.width, 0, ditherImg.width));
        const iy = Math.floor(p.map(y, 0, p.height, 0, ditherImg.height));
        const idx = (iy * ditherImg.width + ix) * 4;

        const r = ditherImg.pixels[idx];
        const g = ditherImg.pixels[idx + 1];
        const b = ditherImg.pixels[idx + 2];

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        const bx = x & 3;
        const by = y & 3;

        const pulse = Math.sin(ditherTime + (x + y) * 0.01) * 20;

        const threshold = (bayer4[by][bx] / 16) * 255 * 1.6 + pulse + 40;

        if (gray > threshold) {
          p.noStroke();
          p.fill(255);
          p.rect(
            Math.floor(x / pixelSize) * pixelSize,
            Math.floor(y / pixelSize) * pixelSize,
            pixelSize,
            pixelSize,
          );
        }
      }
    }
  };
};

new p5(box1Sketch);

// =====================
// BOX3 - ASCII
// =====================

new p5((p) => {
  let img;
  let box3;

  // ASCII SETTINGS
  const ASCII_CHARS = ".#-+";
  let cellSize = 10;
  let t = 0;

  const CELL_MIN = 6;
  const CELL_MAX = 24;

  let hoverBox3 = false;

  // LOAD IMAGE
  function loadImg(src) {
    img = p.loadImage(src, () => {
      if (!p._loop) p.loop();
    });
  }

  // SETUP
  p.setup = () => {
    window.requestAnimationFrame(() => {
      box3 = document.getElementById("box3");
      if (!box3) {
        console.error("❌ box3 not found");
        return;
      }

      const c = p.createCanvas(box3.clientWidth, box3.clientHeight);
      c.parent(box3);
      c.style("display", "block");

      p.pixelDensity(1);
      p.textFont("monospace");
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(255);
      p.loop();

      loadImg(window.ImageState.src);

      window.ImageState.onChange(loadImg);
      if (window.ImageState.src) {
        loadImg(window.ImageState.src);
      }

      // HOVER + SCROLL CONTROL
      box3.addEventListener("mouseenter", () => {
        hoverBox3 = true;
      });

      box3.addEventListener("mouseleave", () => {
        hoverBox3 = false;
      });

      box3.addEventListener(
        "wheel",
        (e) => {
          if (!hoverBox3) return;

          e.preventDefault();

          const dir = e.deltaY < 0 ? 1 : -1;
          cellSize += dir * 1.5;
          cellSize = p.constrain(cellSize, CELL_MIN, CELL_MAX);
        },
        { passive: false },
      );
    });
  };

  // DRAW – ASCII ANIMATED
  p.draw = () => {
    if (!img || !img.width) return;

    p.clear();
    p.textSize(cellSize);

    t += 0.15;

    const scale = p.height / img.height;
    const drawW = img.width * scale;
    const offsetX = (p.width - drawW) * 0.5;

    img.loadPixels();

    const BASE_CELL = 10;

    const cols = Math.floor(drawW / BASE_CELL);
    const rows = Math.floor(p.height / BASE_CELL);

    const skip = Math.max(1, Math.floor(cellSize / BASE_CELL));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if ((x + y) % skip !== 0) continue;

        const ix = Math.floor(p.map(x * BASE_CELL, 0, drawW, 0, img.width));
        const iy = Math.floor(p.map(y * BASE_CELL, 0, p.height, 0, img.height));

        const idx = (iy * img.width + ix) * 4;
        const r = img.pixels[idx];
        const g = img.pixels[idx + 1];
        const b = img.pixels[idx + 2];

        const v = 0.299 * r + 0.587 * g + 0.114 * b;
        if (v < 150) continue;

        const charIndex = Math.floor(
          (v * 0.02 + t + (x + y) * 0.1) % ASCII_CHARS.length,
        );

        const ch = ASCII_CHARS.charAt(charIndex);

        p.text(
          ch,
          offsetX + x * BASE_CELL + BASE_CELL * 0.5,
          y * BASE_CELL + BASE_CELL * 0.6,
        );
      }
    }
  };

  // RESIZE
  p.windowResized = () => {
    if (!box3) return;
    p.resizeCanvas(box3.clientWidth, box3.clientHeight);
    p.redraw();
  };
});

// =====================
// BOX2 – HALFTONE
// =====================

new p5((p) => {
  let img;
  let box2;
  let t = 0;

  // HALFTONE SETTINGS
  let DOT_SIZE = 6;
  let DOT_MAX = 4;

  const DOT_SIZE_MIN = 5;
  const DOT_SIZE_MAX = 10;

  const DOT_MAX_MIN = 2;
  const DOT_MAX_MAX = 6;

  const THRESHOLD = 30;

  let hoverBox2 = false;

  // LOAD IMAGE
  function loadImg(src) {
    if (!src) return;
    img = p.loadImage(src, () => {
      if (!p._loop) p.loop();
    });
  }

  // SETUP
  p.setup = () => {
    window.requestAnimationFrame(() => {
      box2 = document.getElementById("box2");
      if (!box2) {
        console.error("❌ box2 not found");
        return;
      }

      const c = p.createCanvas(box2.clientWidth, box2.clientHeight);
      c.parent(box2);
      c.style("display", "block");

      c.elt.style.width = box2.clientWidth + "px";
      c.elt.style.height = box2.clientHeight + "px";

      // PRINT / PIXEL STYLE
      p.pixelDensity(1);
      p.noSmooth();
      p.noStroke();
      p.ellipseMode(p.CENTER);
      p.loop();

      if (window.ImageState?.src) {
        loadImg(window.ImageState.src);
      }
      window.ImageState?.onChange(loadImg);

      // HOVER + SCROLL
      box2.addEventListener("mouseenter", () => {
        hoverBox2 = true;
      });

      box2.addEventListener("mouseleave", () => {
        hoverBox2 = false;
      });

      box2.addEventListener(
        "wheel",
        (e) => {
          if (!hoverBox2) return;

          e.preventDefault();
          const dir = e.deltaY < 0 ? 1 : -1;

          DOT_SIZE += dir * 0.5;
          DOT_MAX += dir * 0.5;

          DOT_SIZE = p.constrain(DOT_SIZE, DOT_SIZE_MIN, DOT_SIZE_MAX);
          DOT_MAX = p.constrain(DOT_MAX, DOT_MAX_MIN, DOT_MAX_MAX);
        },
        { passive: false },
      );
    });
  };

  // DRAW – HALFTONE
  p.draw = () => {
    if (!img || !img.width) return;

    t += 0.03;

    p.clear();
    p.fill(255);

    // ===== FULL HEIGHT =====
    const scale = p.height / img.height;
    const drawW = img.width * scale;
    const offsetX = (p.width - drawW) * 0.5;

    img.loadPixels();

    const cols = Math.floor(drawW / DOT_SIZE);
    const rows = Math.floor(p.height / DOT_SIZE);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let px = offsetX + x * DOT_SIZE + DOT_SIZE * 0.5;
        let py = y * DOT_SIZE + DOT_SIZE * 0.5;

        px = Math.round(px);
        py = Math.round(py);

        const ix = Math.floor(p.map(px - offsetX, 0, drawW, 0, img.width));
        const iy = Math.floor(p.map(py, 0, p.height, 0, img.height));

        const idx = (iy * img.width + ix) * 4;
        const r = img.pixels[idx];
        const g = img.pixels[idx + 1];
        const b = img.pixels[idx + 2];

        const v = 0.299 * r + 0.587 * g + 0.114 * b;
        if (v < THRESHOLD) continue;

        const l = p.constrain(v, 50, 210);
        let radius = p.map(l, 50, 210, DOT_MAX, 0);

        // ===== ANIMATION =====
        const anim = p.map(p.sin(t + py * 0.05), -1, 1, 0.6, 1.0);

        radius *= anim;

        // ===== SNAP RADIUS =====
        radius = Math.max(2, radius);
        radius = Math.round(radius);

        p.circle(px, py, radius);
      }
    }
  };

  // RESIZE
  p.windowResized = () => {
    if (!box2) return;
    p.resizeCanvas(box2.clientWidth, box2.clientHeight);
  };
});