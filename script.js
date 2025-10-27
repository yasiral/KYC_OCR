// === Define your OCR models ===
const models = [
  { label: "Infinity Parser", file: "assets/model1.md", color: "#007BFF" }, // Blue
  { label: "DeepSeek-OCR", file: "assets/model2.md", color: "#28A745" }, // Green
  { label: "OlmOCR2", file: "assets/model3.md", color: "#FF8800" }  // Orange
  { label: "Dots.OCR", file: "assets/model4.md", color: "#FFFF00" }  // Yellow
  // Add more if needed e.g. { label: "Model 4", file: "assets/model4.md", color: "#8e44ad" }
];

// === Dynamically populate the grid ===
const grid = document.getElementById("modelGrid");

models.forEach((model, i) => {
  const column = document.createElement("div");
  column.className = "markdown-column";
  column.innerHTML = `
    <h3 style="background-color:${model.color}">${model.label}</h3>
    <div class="markdown-box" id="model${i + 1}"></div>
  `;
  grid.appendChild(column);
});

// === Load markdown files and render them ===
async function loadMarkdown(file, containerId) {
  const response = await fetch(file);
  const text = await response.text();
  const html = marked.parse(text, { breaks: true });
  document.getElementById(containerId).innerHTML = html;
}

models.forEach((m, i) => loadMarkdown(m.file, `model${i + 1}`));

// === Modal for markdown zoom view ===
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const closeModal = document.querySelector(".close");

document.addEventListener("click", e => {
  if (e.target.classList.contains("markdown-box")) {
    modal.style.display = "block";
    modalText.innerHTML = e.target.innerHTML;
  }
});

closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

// === Side-by-side scroll synchronization ===
let isSyncing = false;
const boxes = [];

const observer = new MutationObserver(() => {
  const loadedBoxes = document.querySelectorAll(".markdown-box");
  if (loadedBoxes.length === models.length && boxes.length === 0) {
    loadedBoxes.forEach(box => boxes.push(box));
    boxes.forEach(box =>
      box.addEventListener("scroll", () => {
        if (isSyncing) return;
        isSyncing = true;
        const { scrollTop, scrollHeight, clientHeight } = box;
        const ratio = scrollTop / (scrollHeight - clientHeight);
        boxes.forEach(other => {
          if (other !== box) {
            other.scrollTop = ratio * (other.scrollHeight - other.clientHeight);
          }
        });
        isSyncing = false;
      })
    );
  }
});

observer.observe(grid, { childList: true, subtree: true });

// === Click-to-zoom KYC image ===
const kycImage = document.getElementById("kycImage");
kycImage.addEventListener("click", () => {
  kycImage.classList.toggle("enlarged");
});
