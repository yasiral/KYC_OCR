// === Define models ===
const models = [
  { label: "Infinity Parser", file: "assets/model1.md"},
  { label: "DeepSeek-OCR", file: "assets/model2.md"},
  { label: "OlmOCR2", file: "assets/model3.md"},
  { label: "Dots.OCR", file: "assets/model4.md"},
  { label: "Chandra OCR", file: "assets/model5.md"},
  { label: "PaddleOCR-VL", file: "assets/model6.md"},
  { label: "MinerU 2.5", file: "assets/model7.md"},
  { label: "LightON OCR 1B", file: "assets/model8.md"},
  { label: "Nanonets-OCR2", file: "assets/model9.md"},
  { label: "Qwen3-VL", file: "assets/model10.md"},
  { label: "MonkeyOCR", file: "assets/model11.md"},
];

const docTypes = {
  "KYC Form": "kyc",
  "Research Paper": "research",
  "Invoice": "invoice",
  "Arabic Document": "arabic",
  "Old Document": "old"
};

/* ================ ELEMENTS ================ */
const grid = document.getElementById("modelGrid");
const modelA = document.getElementById("modelA");
const modelB = document.getElementById("modelB");
const compareBtn = document.getElementById("compareBtn");
const splitBtn = document.getElementById("splitModeBtn");
const diffModal = document.getElementById("diffModal");
const diffOutput = document.getElementById("diffOutput");
const kycImage = document.getElementById("kycImage");
const searchBox = document.getElementById("searchBox");
const clearSearch = document.getElementById("clearSearch");

let currentDocType = "kyc";
let splitActive = false;
let scrollSyncActive = false;
let syncedBoxes = [];
let syncLock = false;

/* ================ INIT ================ */
function populateDocTypeSelector() {
  const sel = document.createElement("select");
  sel.id = "docTypeSelector";
  Object.entries(docTypes).forEach(([label, folder]) => {
    const opt = document.createElement("option");
    opt.value = folder;
    opt.textContent = label;
    sel.appendChild(opt);
  });
  sel.value = currentDocType;
  sel.addEventListener("change", () => {
    currentDocType = sel.value;
    loadAllMarkdowns();
  });
  document.querySelector(".toolbar").prepend(sel);
}

function buildGrid() {
  grid.innerHTML = "";
  models.forEach((m, i) => {
    const col = document.createElement("div");
    col.className = "markdown-column";
    col.innerHTML = `
      <h3 style="background:${m.color}" data-index="${i}">${m.label}</h3>
      <div class="markdown-box" id="model-${i}"><em>Loading...</em></div>
    `;
    grid.appendChild(col);
  });

  modelA.innerHTML = "";
  modelB.innerHTML = "";
  models.forEach((m, i) => {
    modelA.add(new Option(m.label, i));
    modelB.add(new Option(m.label, i));
  });
}

/* ================ LOAD MARKDOWN ================ */
async function loadMarkdown(modelIndex) {
  const file = `assets/${currentDocType}/model${modelIndex + 1}.md`;
  const box = document.getElementById(`model-${modelIndex}`);
  try {
    const res = await fetch(file);
    const text = await res.text();
    const html = marked.parse(text, { breaks: true });
    box.innerHTML = html;
    box.dataset.raw = html;
  } catch {
    box.innerHTML = `<p style="color:red">Missing file: ${file}</p>`;
  }
}
function loadAllMarkdowns() {
  models.forEach((_, i) => loadMarkdown(i));
}

/* ================ COLLAPSIBLE ================ */
document.addEventListener("click", (e) => {
  if (e.target.matches(".markdown-column h3")) {
    const box = e.target.nextElementSibling;
    box.classList.toggle("collapsed");
    refreshScrollSync();
  }
});

/* ================ IMAGE ZOOM ================ */
kycImage.addEventListener("click", () => {
  kycImage.classList.toggle("enlarged");
});

/* ================ SEARCH / HIGHLIGHT ================ */
function applyHighlight(term) {
  document.querySelectorAll(".markdown-box").forEach((box) => {
    if (box.dataset.raw) box.innerHTML = box.dataset.raw;
    if (term && term.trim()) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      box.innerHTML = box.innerHTML.replace(regex, (m) => `<mark>${m}</mark>`);
    }
  });
}
searchBox.addEventListener("input", () => applyHighlight(searchBox.value));
clearSearch.addEventListener("click", () => {
  searchBox.value = "";
  applyHighlight("");
});

/* ================ DIFF VIEWER ================ */
compareBtn.addEventListener("click", () => {
  const a = +modelA.value, b = +modelB.value;
  if (a === b) return alert("Select two different models!");
  const textA = document.getElementById(`model-${a}`).innerText;
  const textB = document.getElementById(`model-${b}`).innerText;
  const diff = Diff.diffLines(textA, textB);
  diffOutput.innerHTML = diff.map(part => {
    const cls = part.added ? "diff-added" : part.removed ? "diff-removed" : "";
    return `<span class="${cls}">${part.value}</span>`;
  }).join("");
  diffModal.style.display = "block";
});

/* ================ SPLIT MODE ================ */
splitBtn.addEventListener("click", () => {
  splitActive = !splitActive;
  const a = +modelA.value, b = +modelB.value;
  if (splitActive) {
    if (a === b) return alert("Select two different models!");
    document.body.classList.add("split-mode");
    document.querySelectorAll(".markdown-column").forEach((col, i) => {
      col.style.display = (i === a || i === b) ? "block" : "none";
    });
    splitBtn.textContent = "Exit Split Mode";
    enableScrollSync(true);
  } else {
    document.body.classList.remove("split-mode");
    document.querySelectorAll(".markdown-column").forEach(col => col.style.display = "");
    splitBtn.textContent = "Split Compare Mode";
    enableScrollSync(false);
  }
});

/* ================ SCROLL SYNC (only when active) ================ */
let syncedBoxes = [];

function visibleBoxes() {
  return [...document.querySelectorAll(".markdown-box")].filter(box => {
    const parent = box.closest(".markdown-column");
    return !box.classList.contains("collapsed") && getComputedStyle(parent).display !== "none";
  });
}
function enableScrollSync(enable) {
  scrollSyncActive = enable;
  refreshScrollSync();
}
function refreshScrollSync() {
  syncedBoxes.forEach(b => b.removeEventListener("scroll", onScrollSync));
  syncedBoxes = scrollSyncActive ? visibleBoxes() : [];
  syncedBoxes.forEach(b => b.addEventListener("scroll", onScrollSync));
}
function onScrollSync(e) {
  if (!scrollSyncActive || syncLock) return;
  syncLock = true;
  const src = e.target;
  const ratio = src.scrollTop / (src.scrollHeight - src.clientHeight);
  syncedBoxes.forEach(other => {
    if (other !== src) {
      other.scrollTop = ratio * (other.scrollHeight - other.clientHeight);
    }
  });
  syncLock = false;
}

/* ================ INIT ================ */
window.addEventListener("load", () => {
  populateDocTypeSelector();
  buildGrid();
  loadAllMarkdowns();
  enableScrollSync(false);
});
