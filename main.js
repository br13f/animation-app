const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");
const clearFrameBtn = document.getElementById("clearFrameBtn");

const framesContainer = document.getElementById("framesContainer");
const addFrameBtn = document.getElementById("addFrameBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const fpsInput = document.getElementById("fpsInput");

let isDrawing = false;
let frames = [];
let currentFrameIndex = 0;
let playInterval = null;

// --- Drawing logic ---
function getBrushSettings() {
  return {
    color: colorPicker.value,
    size: parseInt(brushSizeInput.value, 10),
  };
}

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const { color, size } = getBrushSettings();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx.closePath();
  saveCurrentFrame();
});

canvas.addEventListener("mouseleave", () => {
  if (isDrawing) {
    isDrawing = false;
    ctx.closePath();
    saveCurrentFrame();
  }
});

// --- Frames logic ---
function createBlankFrame() {
  const offscreen = document.createElement("canvas");
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const offCtx = offscreen.getContext("2d");
  offCtx.fillStyle = "#ffffff";
  offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
  return offscreen;
}

function saveCurrentFrame() {
  const offscreen = document.createElement("canvas");
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const offCtx = offscreen.getContext("2d");
  offCtx.drawImage(canvas, 0, 0);
  frames[currentFrameIndex] = offscreen;
  renderFrameThumbnails();
}

function loadFrame(index) {
  currentFrameIndex = index;
  const frame = frames[index];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (frame) {
    ctx.drawImage(frame, 0, 0);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  renderFrameThumbnails();
}

function addFrame() {
  const newFrame = createBlankFrame();
  frames.push(newFrame);
  loadFrame(frames.length - 1);
}

function renderFrameThumbnails() {
  framesContainer.innerHTML = "";
  frames.forEach((frameCanvas, index) => {
    const thumb = document.createElement("div");
    thumb.className = "frame-thumb";
    if (index === currentFrameIndex) thumb.classList.add("active");
    thumb.textContent = index + 1;
    thumb.addEventListener("click", () => loadFrame(index));
    framesContainer.appendChild(thumb);
  });
}

// --- Playback ---
function playAnimation() {
  if (frames.length === 0) return;
  stopAnimation();
  let i = 0;
  const fps = Math.max(1, Math.min(60, parseInt(fpsInput.value, 10) || 8));
  const delay = 1000 / fps;

  playInterval = setInterval(() => {
    loadFrame(i);
    i = (i + 1) % frames.length;
  }, delay);
}

function stopAnimation() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

// --- Buttons ---
addFrameBtn.addEventListener("click", addFrame);
playBtn.addEventListener("click", playAnimation);
stopBtn.addEventListener("click", stopAnimation);

clearFrameBtn.addEventListener("click", () => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveCurrentFrame();
});

// --- Init ---
function init() {
  frames = [];
  const firstFrame = createBlankFrame();
  frames.push(firstFrame);
  loadFrame(0);
}

init();
