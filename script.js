// === Define your OCR models ===
const models = [
  { label: "Model 1", file: "assets/model1.md" },
  { label: "Model 2", file: "assets/model2.md" },
  { label: "Model 3", file: "assets/model3.md" }
  // Add more: { label: "Model 4", file: "assets/model4.md" }
];

// === Populate grid dynamically ===
const grid = document.getElementById("modelGrid");

models.forEach((model, i) => {
  const column = document.createElement("div");
  column.className = "markdown-column";
  column.innerHTML = `
    <h3>${model.label}</h3>
    <div class="markdown-box" id="model${i + 1}"></div>
  `;
  grid.appendChild(column);
});

// === Load markdowns and render with Marked ===
async function loadMarkdown(file, containerId) {
  const response = await fetch(file);
  const text = await response.text();
  const html = marked.parse(text, { breaks: true });
  document.getElementById(containerId).innerHTML = html;
}

// Load all models
models.forEach((m, i) => loadMarkdown(m.file, `model${i + 1}`));

// === Modal logic ===
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
