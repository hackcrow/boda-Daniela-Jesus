const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

const MAX_CONCURRENT_UPLOADS = 3;

let loadedImages = new Set();
let isFirstLoad = true;
window.audioEnabled = false;

// 🔊 activar audio
document.addEventListener("click", () => {
  window.audioEnabled = true;
}, { once: true });

// ================= MODAL =================
function openModal(url) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "flex";
  modalImg.src = url;
}

// ================= ANIMACIÓN =================
function addImageAnimated(url) {
  const img = document.createElement("img");
  img.src = url;

  img.style.opacity = "0";
  img.style.transform = "scale(0.8) translateY(20px)";

  img.onclick = () => openModal(url);

  document.getElementById("gallery").prepend(img);

  setTimeout(() => {
    img.style.transition = "all 0.5s ease";
    img.style.opacity = "1";
    img.style.transform = "scale(1) translateY(0)";
  }, 50);

  if (window.audioEnabled) {
    new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3").play();
  }
}

// ================= LOAD =================
async function loadImages() {
  const res = await fetch(API_URL + "?t=" + Date.now());
  const data = await res.json();

  const gallery = document.getElementById("gallery");

  // primera carga
  if (isFirstLoad) {
    gallery.innerHTML = "";
    loadedImages.clear();

    const ordered = [...data];

    ordered.forEach(url => {
      loadedImages.add(url);

      const img = document.createElement("img");
      img.src = url;
      img.onclick = () => openModal(url);

      gallery.appendChild(img);
    });

    isFirstLoad = false;
    return;
  }

  // nuevas
  data.forEach(url => {
    if (!loadedImages.has(url)) {
      loadedImages.add(url);
      addImageAnimated(url);
    }
  });
}

// ================= UPLOAD =================
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  addImageAnimated(data.secure_url);
  lanzarConfeti();

  await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ url: data.secure_url })
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");

  uploadBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);

    await Promise.all(files.map(uploadToCloudinary));

    fileInput.value = "";
  });

  function lanzarConfeti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // cerrar modal
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");

  closeModal.onclick = () => modal.style.display = "none";

  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  loadImages();
});

// 🔄 auto refresh
setInterval(loadImages, 3000);
