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
];

const HEADER_COLORS = [
  "#0d6efd", // blue
  "#28a745", // green
  "#ff8800", // orange
  "#8e44ad", // purple
  "#20c997", // teal
  "#e83e8c", // pink
  "#6c757d", // gray
  "#fd7e14", // amber
  "#17a2b8", // cyan
];

/* =========================================================
   Build grid + controls
========================================================= */
const grid = document.getElementById("modelGrid");

// Create columns
models.forEach((m, i) => {
  const col = document.createElement("div");
  col.className = "markdown-column";
  col.innerHTML = `
    <h3 style="--head:${HEADER_COLORS[i % HEADER_COLORS.length]}" data-index="${i}">${m.label}</h3>
    <div class="markdown-box" id="model-${i}" data-index="${i}"><em>Loading...</em></div>
  `;
  grid.appendChild(col);
});

// Populate selects
const modelA = document.getElementById("modelA");
const modelB = document.getElementById("modelB");
models.forEach((m, i) => {
  modelA.add(new Option(m.label, i));
  modelB.add(new Option(m.label, i));
});

/* =========================================================
   Markdown loading + caching of raw HTML for highlight reset
========================================================= */
async function loadMarkdown(file, id) {
  const res = await fetch(file);
  const text = await res.text();
  const html = marked.parse(text, { breaks: true });
  const box = document.getElementById(id);
  box.innerHTML = html;
  box.dataset.raw = html; // store pristine HTML for clean highlighting toggles
}
models.forEach((m, i) => loadMarkdown(m.file, `model-${i}`));

/* =========================================================
   Collapsible sections (click header toggles the next box)
========================================================= */
document.addEventListener("click", (e) => {
  if (e.target.matches(".markdown-column h3")) {
    const body = e.target.nextElementSibling;
    body.classList.toggle("collapsed");
    // Recompute scroll-sync list when collapsing/expanding
    refreshScrollSync();
  }
});

/* =========================================================
   Image zoom 25% <-> 80%
========================================================= */
const kycImage = document.getElementById("kycImage");
kycImage.addEventListener("click", () => {
  kycImage.classList.toggle("enlarged");
});

/* =========================================================
   Modal for enlarging a markdown box on click
========================================================= */
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const closeModalEls = document.querySelectorAll(".close");

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("markdown-box")) {
    modal.style.display = "block";
    modalText.innerHTML = e.target.innerHTML;
  }
});

closeModalEls.forEach((x) =>
  x.addEventListener("click", () => {
    modal.style.display = "none";
    diffModal.style.display = "none";
  })
);

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === diffModal) diffModal.style.display = "none";
});

/* =========================================================
   Search / Highlight across all boxes (safe restore)
========================================================= */
const searchBox = document.getElementById("searchBox");
const clearSearch = document.getElementById("clearSearch");

function applyHighlight(term) {
  document.querySelectorAll(".markdown-box").forEach((box) => {
    // Restore pristine HTML first
    if (box.dataset.raw) box.innerHTML = box.dataset.raw;

    if (term && term.trim()) {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(esc, "gi");
      box.innerHTML = box.innerHTML.replace(regex, (m) => `<mark>${m}</mark>`);
    }
  });
}

searchBox.addEventListener("input", () => applyHighlight(searchBox.value));
clearSearch.addEventListener("click", () => {
  searchBox.value = "";
  applyHighlight("");
});

/* =========================================================
   Line-by-Line Diff Viewer
========================================================= */
const diffModal = document.getElementById("diffModal");
const diffOutput = document.getElementById("diffOutput");
const compareBtn = document.getElementById("compareBtn");

compareBtn.addEventListener("click", () => {
  const a = parseInt(modelA.value, 10);
  const b = parseInt(modelB.value, 10);
  if (a === b || isNaN(a) || isNaN(b)) {
    alert("Select two different models to compare.");
    return;
  }
  const textA = document.getElementById(`model-${a}`).innerText;
  const textB = document.getElementById(`model-${b}`).innerText;

  const parts = Diff.diffLines(textA, textB);
  diffOutput.innerHTML = parts
    .map((p) => {
      const cls = p.added ? "diff-added" : p.removed ? "diff-removed" : "";
      return `<span class="${cls}">${p.value.replace(/</g, "&lt;")}</span>`;
    })
    .join("");
  diffModal.style.display = "block";
});

/* =========================================================
   Split-Screen Compare Mode (show only two)
========================================================= */
const splitBtn = document.getElementById("splitModeBtn");
let splitActive = false;

function setSplitMode(on) {
  splitActive = on;
  if (!on) {
    document.body.classList.remove("split-mode");
    document.querySelectorAll(".markdown-column").forEach((col) => {
      col.style.display = "";
    });
    refreshScrollSync();
    splitBtn.textContent = "Split Compare Mode";
    return;
  }

  const a = parseInt(modelA.value, 10);
  const b = parseInt(modelB.value, 10);
  if (a === b || isNaN(a) || isNaN(b)) {
    alert("Select two different models for split mode.");
    return;
  }

  document.body.classList.add("split-mode");
  document.querySelectorAll(".markdown-column").forEach((col, idx) => {
    col.style.display = (idx === a || idx === b) ? "" : "none";
  });
  refreshScrollSync(); // resync only visible
  splitBtn.textContent = "Exit Split Mode";
}

splitBtn.addEventListener("click", () => setSplitMode(!splitActive));

/* =========================================================
   Synchronized Scrolling (visible boxes only)
========================================================= */
let syncLock = false;
let syncedBoxes = [];

function visibleMarkdownBoxes() {
  return Array.from(document.querySelectorAll(".markdown-box"))
    .filter((el) => {
      const cs = getComputedStyle(el);
      const parent = el.closest(".markdown-column");
      return cs.display !== "none" &&
             cs.visibility !== "hidden" &&
             !el.classList.contains("collapsed") &&
             getComputedStyle(parent).display !== "none";
    });
}

function attachScrollSync() {
  // remove old listeners by cloning nodes (simple and safe)
  syncedBoxes.forEach((b) => {
    const clone = b.cloneNode(true);
    b.parentNode.replaceChild(clone, b);
  });

  syncedBoxes = visibleMarkdownBoxes();
  syncedBoxes.forEach((box) => {
    box.addEventListener("scroll", () => {
      if (syncLock) return;
      syncLock = true;
      const { scrollTop, scrollHeight, clientHeight } = box;
      const ratio =
        (scrollHeight - clientHeight) > 0
          ? scrollTop / (scrollHeight - clientHeight)
          : 0;

      syncedBoxes.forEach((other) => {
        if (other === box) return;
        const max = other.scrollHeight - other.clientHeight;
        other.scrollTop = ratio * (max <= 0 ? 0 : max);
      });
      syncLock = false;
    });
  });
}

function refreshScrollSync() {
  // slight delay to allow layout changes to settle
  setTimeout(attachScrollSync, 0);
}

// initial attach once content loads
window.addEventListener("load", refreshScrollSync);
