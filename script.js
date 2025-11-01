/* ========= Config & Globals ========= */
const colorPalette = [
  "#4285F4","#34A853","#FBBC05","#EA4335",
  "#9C27B0","#00ACC1","#F4511E","#7CB342",
  "#8E24AA","#039BE5","#C0CA33"
];

// Enable KaTeX inside marked
if (window.markedKatex) marked.use(window.markedKatex({ throwOnError: false }));

const grid = document.getElementById("modelGrid");
const kycImage = document.getElementById("kycImage");
const searchBox = document.getElementById("searchBox");
const clearSearch = document.getElementById("clearSearch");
const splitBtn = document.getElementById("splitModeBtn");
const modelA = document.getElementById("modelA");
const modelB = document.getElementById("modelB");
const docSelect = document.getElementById("docTypeSelector");
const loadingIndicator = document.getElementById("loading-indicator");

const fullscreenModal = document.getElementById("fullscreen-modal");
const fullscreenBody  = document.getElementById("fullscreen-body");
document.getElementById("close-fullscreen").onclick = () => {
  fullscreenModal.classList.add("hidden"); fullscreenBody.innerHTML = "";
};

let currentDocType = "kyc";
let scrollSyncActive = false;
let syncedBoxes = [];
let syncLock = false;
let splitActive = false;
let docManifest = {};
let models = []; // built per render

/* ========= Manifest & Dropdown ========= */
async function loadManifest(){
  const res = await fetch("assets/manifest.json");
  if(!res.ok) { alert("Error loading document manifest"); return; }
  docManifest = await res.json();
  populateDocTypeSelector();
}
function populateDocTypeSelector(){
  docSelect.innerHTML = "";
  Object.entries(docManifest).forEach(([key, info])=>{
    const opt = document.createElement("option");
    opt.value = key; opt.textContent = info.label;
    docSelect.appendChild(opt);
  });
  // default to current if present, else first
  if (!docManifest[currentDocType]) currentDocType = Object.keys(docManifest)[0] || "kyc";
  docSelect.value = currentDocType;
  docSelect.addEventListener("change", ()=>{
    currentDocType = docSelect.value;
    updatePreviewImage();
    buildGrid();
  });
  updatePreviewImage();
  buildGrid();
}

/* ========= Preview Image (with spinner + fallback) ========= */
function updatePreviewImage(){
  const info = docManifest[currentDocType];
  const imagePath = info ? `assets/${currentDocType}/${info.image}` : "assets/no-preview.svg";

  loadingIndicator.style.display = "block";
  kycImage.style.opacity = 0;

  const img = new Image();
  img.src = imagePath;

  img.onload = ()=>{
    kycImage.src = imagePath;
    kycImage.alt = info ? info.label : "No preview";
    kycImage.style.opacity = 1;
    loadingIndicator.style.display = "none";
    document.getElementById("pipImg").src = kycImage.src;
  };
  img.onerror = ()=>{
    kycImage.src = "assets/no-preview.svg";
    kycImage.alt = "No preview";
    kycImage.style.opacity = 1;
    loadingIndicator.style.display = "none";
    document.getElementById("pipImg").src = kycImage.src;
  };
}
kycImage.addEventListener("click", ()=> kycImage.classList.toggle("enlarged"));

/* ========= Build Grid & Load Markdown ========= */
function buildGrid(){
  grid.innerHTML = "";

  // Your model list (label + file). 'kyc' is replaced dynamically by currentDocType
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
    { label: "MonkeyOCR", file: "assets/kyc/model11.md" }
  ];

  // headers for split dropdowns
  modelA.innerHTML = ""; modelB.innerHTML = "";
  models.forEach((m,i)=>{
    modelA.add(new Option(m.label, i)); modelB.add(new Option(m.label, i));
  });

  models.forEach((m,i)=>{
    const color = colorPalette[i % colorPalette.length];
    const col = document.createElement("div");
    col.className = "model-box";
    col.innerHTML = `
      <div class="model-header-bar" style="background:${color}">
        <h3 class="model-header" data-index="${i}">${m.label}</h3>
        <button class="maximize-btn" data-index="${i}" title="Maximize">⤢</button>
      </div>
      <div class="markdown-box" id="model-${i}"><em>Loading...</em></div>
    `;
    grid.appendChild(col);
    loadMarkdown(i);
  });

  // refresh sync if needed
  enableScrollSync(splitActive);
}

async function loadMarkdown(idx){
  const file = models[idx].file.replace("kyc", currentDocType);
  const box  = document.getElementById(`model-${idx}`);
  try{
    const res = await fetch(file);
    if(!res.ok) throw new Error("missing");
    const text = await res.text();
    const html = marked.parse(text, { breaks:true });
    // hide broken inline images inside markdown (if any)
    const safe = html.replace(/<img[^>]+src="([^"]+)"[^>]*>/g,
      (m,src)=>`<img src="${src}" onerror="this.style.display='none'" alt=""/>`);
    box.innerHTML = safe;
    box.dataset.raw = safe;

    // typeset KaTeX if present (already integrated through marked extension)

  }catch{
    box.innerHTML = `<p style="color:red">Missing file: ${file}</p>`;
  }
}

/* ========= Search / Highlight ========= */
function applyHighlight(term){
  document.querySelectorAll(".markdown-box").forEach(box=>{
    if (box.dataset.raw) box.innerHTML = box.dataset.raw;
    if (term && term.trim()){
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), "gi");
      box.innerHTML = box.innerHTML.replace(re, m=>`<mark>${m}</mark>`);
    }
  });
}
searchBox.addEventListener("input", ()=> applyHighlight(searchBox.value));
clearSearch.addEventListener("click", ()=>{
  searchBox.value = ""; applyHighlight("");
});

/* ========= Collapsible boxes & Maximize ========= */
document.addEventListener("click",(e)=>{
  // collapse on header
  if (e.target.matches(".model-header")){
    const box = e.target.closest(".model-box").querySelector(".markdown-box");
    box.classList.toggle("collapsed");
    refreshScrollSync();
  }
  // maximize to modal
  if (e.target.matches(".maximize-btn")){
    const i = +e.target.dataset.index;
    const box = document.getElementById(`model-${i}`);
    fullscreenBody.innerHTML = box.innerHTML;
    fullscreenModal.classList.remove("hidden");
  }
});

/* ========= Split Compare (show only two; synced scroll) ========= */
splitBtn.addEventListener("click", ()=>{
  splitActive = !splitActive;
  const a = +modelA.value, b = +modelB.value;
  if (splitActive){
    if (a === b){ alert("Select two different models"); splitActive = false; return; }
    document.querySelectorAll(".model-box").forEach((col,i)=>{
      col.style.display = (i===a || i===b) ? "flex" : "none";
    });
    splitBtn.textContent = "Exit Split Mode";
    enableScrollSync(true);
  } else {
    document.querySelectorAll(".model-box").forEach(col=> col.style.display = "");
    splitBtn.textContent = "Split Compare Mode";
    enableScrollSync(false);
  }
});

/* ========= Scroll Sync ========= */
function visibleBoxes(){
  return [...document.querySelectorAll(".markdown-box")].filter(box=>{
    const parent = box.closest(".model-box");
    return !box.classList.contains("collapsed") && getComputedStyle(parent).display !== "none";
  });
}
function enableScrollSync(enable){
  scrollSyncActive = enable; refreshScrollSync();
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
  const ratio = (src.scrollTop) / (src.scrollHeight - src.clientHeight || 1);
  syncedBoxes.forEach(other=>{
    if (other !== src){
      other.scrollTop = ratio * (other.scrollHeight - other.clientHeight);
    }
  });
  syncLock = false;
}

/* ========= PiP Floating Preview (draggable, screen-bounded) ========= */
const pip = document.getElementById("pip");
const pipImg = document.getElementById("pipImg");
const pipHandle = document.querySelector(".pip-handle");

let pipExpanded = false;

// Persisted position
function loadPipPos(){
  const raw = localStorage.getItem("pip-pos");
  if (!raw) return { right:16, bottom:16 }; // default
  try { return JSON.parse(raw); } catch { return { right:16, bottom:16 }; }
}
function storePipPos(pos){ localStorage.setItem("pip-pos", JSON.stringify(pos)); }

// Apply position (screen bounded)
function applyPipPos(pos){
  // Use right/bottom anchoring for simplicity
  pip.style.right = (typeof pos.right==="number" ? `${pos.right}px` : "16px");
  pip.style.bottom= (typeof pos.bottom==="number"? `${pos.bottom}px`: "16px");
}
applyPipPos(loadPipPos());

// Show/hide based on sentinel visibility
const sentinel = document.getElementById("previewSentinel");
const io = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      // We are near the top preview -> hide PiP
      pip.classList.add("hidden");
    } else {
      // Scrolled below preview -> show PiP
      pip.classList.remove("hidden");
    }
  });
},{ root:null, threshold:0.0 });
io.observe(sentinel);

// Drag logic (bounded)
let drag = { active:false, startX:0, startY:0, startRight:0, startBottom:0 };

pipHandle.addEventListener("pointerdown",(e)=>{
  drag.active = true; pipHandle.setPointerCapture(e.pointerId);
  const rect = pip.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  drag.startX = e.clientX; drag.startY = e.clientY;
  // compute current right/bottom in px
  drag.startRight = vw - rect.right;
  drag.startBottom= vh - rect.bottom;
});
pipHandle.addEventListener("pointermove",(e)=>{
  if (!drag.active) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;

  // new right/bottom
  let newRight = Math.max(0, drag.startRight - dx);
  let newBottom= Math.max(0, drag.startBottom - dy);

  // bound so the pip stays fully inside
  const rect = pip.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  newRight = Math.min(newRight, vw - 0 - 1); // safe upper bound
  newBottom= Math.min(newBottom, vh - 0 - 1);

  pip.style.right = `${newRight}px`;
  pip.style.bottom= `${newBottom}px`;
});
pipHandle.addEventListener("pointerup",(e)=>{
  if (!drag.active) return;
  drag.active = false; pipHandle.releasePointerCapture(e.pointerId);
  // store final
  const rect = pip.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  storePipPos({ right: vw - rect.right, bottom: vh - rect.bottom });
});

// Click to expand (moderate overlay size) / collapse
pipImg.addEventListener("click", ()=>{
  pipExpanded = !pipExpanded;
  if (pipExpanded){
    // moderate overlay using CSS transforms; still allow seeing grid behind
    pip.style.transition = "transform .2s ease";
    pip.style.transform = "translate(-25vw, -30vh) scale(2.5)"; // approx ~50% x 60% effect
    pip.style.zIndex = 9800;
  } else {
    pip.style.transform = "none";
    pip.style.zIndex = 9500;
  }
});

/* ========= Init ========= */
loadManifest();
