/* ===========================================================
   OCR Model Comparison Dashboard (Inline Models Version)
   =========================================================== */

/* ====== MODEL LIST (inline, dynamically swapped by docType) ====== */
let models = [
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
  { label: "IBM GraniteDocling-258M", file: "assets/kyc/ibm_granite_docling.md" },
  { label: "Dolphin", file: "assets/kyc/dolphin.md" },
  { label: "GotOCR 2.0", file: "assets/kyc/gotocr2.md" }
];

/* ====== GLOBALS ====== */
const colorPalette = [
  "#4285F4","#34A853","#FBBC05","#EA4335",
  "#9C27B0","#00ACC1","#F4511E","#7CB342",
  "#8E24AA","#039BE5","#C0CA33","#5E35B1",
  "#00897B","#F06292"
];

const grid            = document.getElementById("modelGrid");
const kycImage        = document.getElementById("kycImage");
const docSelect       = document.getElementById("docTypeSelector");
const searchBox       = document.getElementById("searchBox");
const clearSearch     = document.getElementById("clearSearch");
const modelA          = document.getElementById("modelA");
const modelB          = document.getElementById("modelB");
const splitBtn        = document.getElementById("splitModeBtn");
const compareBtn      = document.getElementById("compareBtn");
const loadingIndicator= document.getElementById("loading-indicator");
const readmeToggle    = document.getElementById("readmeToggle");
const readmeBody      = document.getElementById("readmeBody");
const readmeSection   = document.getElementById("readme");

const fullscreenModal = document.getElementById("fullscreen-modal");
const fullscreenBody  = document.getElementById("fullscreen-body");
document.getElementById("close-fullscreen").onclick = () => {
  fullscreenModal.classList.add("hidden");
  fullscreenBody.innerHTML = "";
};

let currentDocType = "kyc";
let docManifest = {};
let splitActive = false;
let scrollSyncActive = false;
let syncedBoxes = [];
let syncLock = false;

/* ====== INIT ====== */
(async function init(){
  await loadManifest();
  populateDocTypeSelector();
  updatePreviewImage();
  buildGrid();
  buildReadme();
})();

/* ====== LOAD MANIFEST ====== */
async function loadManifest(){
  try {
    const res = await fetch("assets/manifest.json");
    docManifest = await res.json();
  } catch (err) {
    console.warn("Could not load manifest.json, using fallback.", err);
    docManifest = {
      "kyc": { label: "KYC Form", image: "KYC_form.jpg" }
    };
  }
}

/* ====== DOC SELECTOR ====== */
function populateDocTypeSelector(){
  docSelect.innerHTML = "";
  Object.entries(docManifest).forEach(([key,info])=>{
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = info.label;
    docSelect.appendChild(opt);
  });
  if (!docManifest[currentDocType]) {
    currentDocType = Object.keys(docManifest)[0] || "kyc";
  }
  docSelect.value = currentDocType;
  docSelect.addEventListener("change", ()=>{
    currentDocType = docSelect.value;
    updatePreviewImage();
    buildGrid();
    buildReadme();
  });
}

/* ====== PREVIEW IMAGE ====== */
function updatePreviewImage(){
  const info = docManifest[currentDocType];
  const path = info ? `assets/${currentDocType}/${info.image}` : "assets/no-preview.svg";

  loadingIndicator.style.display = "block";
  const img = new Image();
  img.src = path;
  img.onload = () => {
    kycImage.src = path;
    kycImage.alt = info ? info.label : "Document preview";
    loadingIndicator.style.display = "none";
  };
  img.onerror = () => {
    kycImage.src = "assets/no-preview.svg";
    kycImage.alt = "No preview";
    loadingIndicator.style.display = "none";
  };
}

// zoom on click
kycImage.addEventListener("click", ()=> {
  kycImage.classList.toggle("enlarged");
});

/* ====== BUILD GRID ====== */
function buildGrid(){
  grid.innerHTML = "";

  modelA.innerHTML = "";
  modelB.innerHTML = "";

  models.forEach((m, i) => {
    modelA.add(new Option(m.label, i));
    modelB.add(new Option(m.label, i));
  });

  models.forEach((m, i) => {
    const color = colorPalette[i % colorPalette.length];
    const col = document.createElement("div");
    col.className = "model-box";
    col.innerHTML = `
      <div class="model-header-bar" style="background:${color}">
        <h3 class="model-header" data-index="${i}">${m.label}</h3>
        <button class="maximize-btn" data-index="${i}" title="Maximize">⤢</button>
      </div>
      <div class="markdown-box" id="model-${i}"><em>Loading…</em></div>
    `;
    grid.appendChild(col);
    loadMarkdownForModel(i);
  });

  enableScrollSync(splitActive);
}

async function loadMarkdownForModel(idx){
  const m = models[idx];
  const box = document.getElementById(`model-${idx}`);
  const path = m.file.replace("kyc", currentDocType);

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("missing");
    const text = await res.text();
    const html = marked.parse(text, { breaks:true });
    box.dataset.raw = html;
    box.innerHTML = html;
  } catch (err) {
    box.innerHTML = `<p style="color:red">No output available for "${m.label}" on "${currentDocType}".</p>`;
  }
}

/* ====== SEARCH / HIGHLIGHT ====== */
function applyHighlight(term){
  document.querySelectorAll(".markdown-box").forEach(box=>{
    if (box.dataset.raw) {
      box.innerHTML = box.dataset.raw;
    }
    if (term && term.trim()) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "gi");
      box.innerHTML = box.innerHTML.replace(re, m=>`<mark>${m}</mark>`);
    }
  });
}
searchBox.addEventListener("input", ()=> applyHighlight(searchBox.value));
clearSearch.addEventListener("click", ()=>{
  searchBox.value = "";
  applyHighlight("");
});

/* ====== COLLAPSE / MAXIMIZE ====== */
document.addEventListener("click",(e)=>{
  if (e.target.classList.contains("model-header")) {
    const parent = e.target.closest(".model-box");
    const box = parent.querySelector(".markdown-box");
    box.classList.toggle("collapsed");
    refreshScrollSync();
  }

  if (e.target.classList.contains("maximize-btn")){
    const idx = +e.target.dataset.index;
    const srcBox = document.getElementById(`model-${idx}`);
    fullscreenBody.innerHTML = srcBox.innerHTML;
    fullscreenModal.classList.remove("hidden");
  }
});

/* ====== SPLIT MODE ====== */
splitBtn.addEventListener("click", ()=>{
  splitActive = !splitActive;
  const a = +modelA.value;
  const b = +modelB.value;
  if (splitActive) {
    if (a === b) {
      alert("Pick two different models");
      splitActive = false;
      return;
    }
    document.querySelectorAll(".model-box").forEach((el, i)=>{
      el.style.display = (i === a || i === b) ? "flex" : "none";
    });
    splitBtn.textContent = "Exit Split Mode";
    enableScrollSync(true);
  } else {
    document.querySelectorAll(".model-box").forEach(el => el.style.display = "");
    splitBtn.textContent = "Split Compare Mode";
    enableScrollSync(false);
  }
});

/* ====== DIFF VIEW ====== */
compareBtn.addEventListener("click", ()=>{
  const a = +modelA.value;
  const b = +modelB.value;
  if (a === b){
    alert("Select two different models to diff.");
    return;
  }
  const boxA = document.getElementById(`model-${a}`);
  const boxB = document.getElementById(`model-${b}`);
  const textA = boxA ? boxA.textContent : "";
  const textB = boxB ? boxB.textContent : "";
  const diff = Diff.createTwoFilesPatch("Model A","Model B",textA,textB);
  fullscreenBody.innerHTML = `<pre style="white-space:pre-wrap">${diff}</pre>`;
  fullscreenModal.classList.remove("hidden");
});

/* ====== SCROLL SYNC ====== */
function visibleBoxes(){
  return [...document.querySelectorAll(".markdown-box")].filter(box=>{
    const parent = box.closest(".model-box");
    return !box.classList.contains("collapsed") && getComputedStyle(parent).display !== "none";
  });
}
function enableScrollSync(enable){
  scrollSyncActive = enable;
  refreshScrollSync();
}
function refreshScrollSync(){
  syncedBoxes.forEach(b=> b.removeEventListener("scroll", onScrollSync));
  syncedBoxes = scrollSyncActive ? visibleBoxes() : [];
  syncedBoxes.forEach(b=> b.addEventListener("scroll", onScrollSync));
}
function onScrollSync(e){
  if (!scrollSyncActive || syncLock) return;
  syncLock = true;
  const src = e.target;
  const ratio = src.scrollTop / ((src.scrollHeight - src.clientHeight) || 1);
  syncedBoxes.forEach(other=>{
    if (other !== src){
      other.scrollTop = ratio * (other.scrollHeight - other.clientHeight);
    }
  });
  syncLock = false;
}

/* ====== DYNAMIC README ====== */
function buildReadme(){
  const modelCount = models.length;
  const modelNames = models.map(m => m.label).join(", ");

  const docEntries = Object.entries(docManifest);
  const docCount = docEntries.length;
  const docLines = docEntries.map(([k,v])=> `• ${v.label} (folder: ${k})`).join("<br>");

  readmeBody.innerHTML = `
    <p>This dashboard benchmarks <strong>${modelCount}</strong> OCR / document-understanding models side-by-side for multiple document types.</p>
    <p><strong>Models:</strong> ${modelNames}</p>
    <p><strong>Document Types (${docCount}):</strong><br>${docLines}</p>
    <p><strong>Usage Guide:</strong></p>
    <ul>
      <li>Select a form/document from the dropdown in the top bar.</li>
      <li>The right panel shows the input image (always visible for reference).</li>
      <li>Scroll the left column to view model outputs and click headers to collapse sections.</li>
      <li>Use Split Compare mode to compare two models with synced scrolling.</li>
      <li>Use the Search box to highlight text across all outputs.</li>
    </ul>
  `;
}

/* ====== README COLLAPSE TOGGLE ====== */
readmeToggle.addEventListener("click", ()=>{
  readmeSection.classList.toggle("collapsed");
});
