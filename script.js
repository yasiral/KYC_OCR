async function loadMarkdown(file, containerId) {
  const response = await fetch(file);
  const text = await response.text();
  const html = marked.parse(text, { breaks: true });
  document.getElementById(containerId).innerHTML = html;
}

// Load model outputs
loadMarkdown("assets/model1.md", "model1");
loadMarkdown("assets/model2.md", "model2");
loadMarkdown("assets/model3.md", "model3");

// Modal logic
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const closeModal = document.querySelector(".close");

document.querySelectorAll(".markdown-box").forEach(box => {
  box.addEventListener("click", () => {
    modal.style.display = "block";
    modalText.innerHTML = box.innerHTML;
  });
});

closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => {
  if (e.target == modal) modal.style.display = "none";
};
