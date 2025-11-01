let currentDocType = "kyc";
let models = [];
let docManifest = {};

const colorPalette = [
  "#4285F4", "#34A853", "#FBBC05", "#EA4335",
  "#9C27B0", "#00ACC1", "#F4511E", "#7CB342",
  "#8E24AA", "#039BE5", "#C0CA33"
];

// Enable KaTeX inside marked
if (window.markedKatex) marked.use(window.markedKatex({ throwOnError: false }));

async function loadManifest() {
  try {
    const res = await fetch("assets/manifest.json");
    if (!res.ok) throw new Error("Manifest not found");
    docManifest = await res.json();
    populateDropdown();
  } catch (e) {
    console.error(e);
    alert("Error loading document manifest");
  }
}

function populateDropdown() {
  const select = document.getElementById("docSelect");
  select.innerHTML = "";

  for (const key in docManifest) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = docManifest[key].label;
    select.appendChild(opt);
  }

  select.value = currentDocType;
  select.addEventListener("change", (e) => {
    currentDocType = e.target.value;
    updatePreviewImage();
    buildGrid();
  });

  updatePreviewImage();
  buildGrid();
}

function updatePreviewImage() {
  const imageElement = document.getElementById("kycImage");
  const loading = document.getElementById("loading-indicator");

  if (!docManifest[currentDocType]) {
    imageElement.src = "assets/no-preview.svg";
    return;
  }

  const info = docManifest[currentDocType];
  const imagePath = `assets/${currentDocType}/${info.image}`;

  loading.style.display = "block";
  imageElement.style.opacity = 0;

  const newImg = new Image();
  newImg.src = imagePath;
  newImg.onload = () => {
    imageElement.src = newImg.src;
    imageElement.style.opacity = 1;
    loading.style.display = "none";
  };
  newImg.onerror = () => {
    imageElement.src = "assets/no-preview.svg";
    imageElement.style.opacity = 1;
    loading.style.display = "none";
  };
}

document.getElementById("kycImage").addEventListener("click", (e) => {
  e.target.classList.toggle("enlarged");
});

function buildGrid() {
  const grid = document.getElementById("model-grid");
  grid.innerHTML = "";

  models = [
    { label: "Infinity Parser", file: "assets/kyc/model1.md" },
    { label: "DeepSeek-OCR", file: "assets/kyc/model2.md" },
    { label: "OlmOCR2", file: "assets/kyc/model3.md" },
    { label: "Dots.OCR", file: "assets/kyc/model4.md" },
    { label: "Chandra OCR", file: "assets/kyc/model5.md" },
    { label: "PaddleOCR-VL", file: "assets/kyc/model6.md" },
    { label: "MinerU 2.5", file: "assets/kyc/model7.md" },
    { label: "LightON OCR 1B", file: "assets/kyc/model8.md" },
    { label: "Nanonets-OCR2", file: "assets/kyc/model9.md" },
    { label: "Qwen3-VL", file: "assets/kyc/model10.md" },
    { label: "MonkeyOCR", file: "assets/kyc/model11.md" },
  ];

  models.forEach((m, i) => {
    const color = colorPalette[i % colorPalette.length];
    const box = document.createElement("div");
    box.className = "model-box";
    box.innerHTML = `
      <div class="model-header-bar" style="background:${color}">
        <h3 class="model-header" data-index="${i}">${m.label}</h3>
        <button class="maximize-btn" data-index="${i}" title="Maximize">⤢</button>
      </div>
      <div class="markdown-box" id="model-${i}"><em>Loading...</em></div>
    `;
    grid.appendChild(box);
    loadMarkdown(i);
  });
}

async function loadMarkdown(index) {
  const model = models[index];
  const path = model.file.replace("kyc", currentDocType);
  const box = document.getElementById(`model-${index}`);

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Not found");
    const text = await res.text();
    box.innerHTML = marked.parse(text);
  } catch {
    box.innerHTML = `<p style="color:red;">Missing file: ${path}</p>`;
  }
}

// Collapse on header click
document.addEventListener("click", (e) => {
  if (e.target.matches(".model-header")) {
    const box = e.target.closest(".model-box").querySelector(".markdown-box");
    box.classList.toggle("collapsed");
  }
});

// Fullscreen view
document.addEventListener("click", (e) => {
  if (e.target.matches(".maximize-btn")) {
    const i = e.target.getAttribute("data-index");
    const box = document.getElementById(`model-${i}`);
    const modal = document.getElementById("fullscreen-modal");
    const body = document.getElementById("fullscreen-body");
    body.innerHTML = box.innerHTML;
    modal.classList.remove("hidden");
  }
});

document.getElementById("close-fullscreen").onclick = () => {
  document.getElementById("fullscreen-modal").classList.add("hidden");
  document.getElementById("fullscreen-body").innerHTML = "";
};

loadManifest();
