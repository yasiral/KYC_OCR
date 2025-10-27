// === Define models ===
const models = [
  { label: "Infinity Parser", file: "assets/model1.md", color: "#007BFF" },
  { label: "DeepSeek-OCR", file: "assets/model2.md", color: "#28A745" },
  { label: "Dots.ocr", file: "assets/model3.md", color: "#FF8800" }
  { label: "OlmOCR2", file: "assets/model4.md", color: "#FF8800" }
];

// === Build grid ===
const grid = document.getElementById("modelGrid");
models.forEach((m, i) => {
  const col = document.createElement("div");
  col.className = "markdown-column";
  col.innerHTML = `
    <h3 style="background:${m.color}" data-index="${i}">${m.label}</h3>
    <div class="markdown-box" id="model${i + 1}"></div>
  `;
  grid.appendChild(col);
});

// === Load markdown ===
async function loadMarkdown(file, id) {
  const res = await fetch(file);
  const text = await res.text();
  const html = marked.parse(text, { breaks: true });
  document.getElementById(id).innerHTML = html;
}
models.forEach((m, i) => loadMarkdown(m.file, `model${i + 1}`));

// === Collapsible Sections ===
document.addEventListener("click", e => {
  if (e.target.matches(".markdown-column h3")) {
    const next = e.target.nextElementSibling;
    next.classList.toggle("collapsed");
  }
});

// === Image Zoom ===
const kycImage = document.getElementById("kycImage");
kycImage.addEventListener("click", () => kycImage.classList.toggle("enlarged"));

// === Search / Highlight ===
const searchBox = document.getElementById("searchBox");
const clearSearch = document.getElementById("clearSearch");
searchBox.addEventListener("input", () => highlight(searchBox.value));
clearSearch.onclick = () => {
  searchBox.value = "";
  highlight("");
};

function highlight(term) {
  document.querySelectorAll(".markdown-box").forEach(box => {
    let html = box.innerHTML.replace(/<\/?mark>/g, "");
    if (term) {
      const regex = new RegExp(term, "gi");
      html = html.replace(regex, match => `<mark>${match}</mark>`);
    }
    box.innerHTML = html;
  });
}

// === Diff Viewer ===
const modelA = document.getElementById("modelA");
const modelB = document.getElementById("modelB");
const compareBtn = document.getElementById("compareBtn");
const diffModal = document.getElementById("diffModal");
const diffOutput = document.getElementById("diffOutput");

models.forEach((m, i) => {
  modelA.add(new Option(m.label, i));
  modelB.add(new Option(m.label, i));
});

compareBtn.onclick = () => {
  const a = modelA.value, b = modelB.value;
  if (a === b) return alert("Select two different models!");
  const textA = document.getElementById(`model${+a + 1}`).innerText;
  const textB = document.getElementById(`model${+b + 1}`).innerText;
  const diff = Diff.diffLines(textA, textB);
  diffOutput.innerHTML = diff.map(part => {
    const cls = part.added ? "diff-added" : part.removed ? "diff-removed" : "";
    return `<span class="${cls}">${part.value}</span>`;
  }).join("");
  diffModal.style.display = "block";
};

document.querySelector(".diff-close").onclick = () => diffModal.style.display = "none";

// === Split Screen Compare Mode ===
const splitBtn = document.getElementById("splitModeBtn");
let splitActive = false;

splitBtn.onclick = () => {
  splitActive = !splitActive;
  if (splitActive) {
    const a = modelA.value, b = modelB.value;
    if (a === b) return alert("Select two different models for split mode!");
    document.body.classList.add("split-mode");
    document.querySelectorAll(".markdown-column").forEach((col, i) => {
      col.style.display = (i == a || i == b) ? "block" : "none";
    });
    splitBtn.textContent = "Exit Split Mode";
  } else {
    document.body.classList.remove("split-mode");
    document.querySelectorAll(".markdown-column").forEach(col => col.style.display = "block");
    splitBtn.textContent = "Split Compare Mode";
  }
};
