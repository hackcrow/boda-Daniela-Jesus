const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

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

  img.classList.add("new-photo");
  img.onclick = () => openModal(url);

  // 🔥 SIEMPRE ARRIBA
  document.getElementById("gallery").prepend(img);

  setTimeout(() => {
    img.classList.remove("new-photo");
  }, 700);

  if (window.audioEnabled) {
    new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3").play();
  }
}

// ================= LOAD =================
async function loadImages() {
  try {
   const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
    const data = await res.json();

    const gallery = document.getElementById("gallery");

    if (isFirstLoad) {
      gallery.innerHTML = "";
      loadedImages.clear();

      // 🔥 IMPORTANTE: pintar TODO en orden como viene
      data.forEach(url => {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => openModal(url);

        gallery.appendChild(img);
      });

      isFirstLoad = false;
      return;
    }

    // 🔥 SOLO agregar nuevas arriba
    data.forEach(url => {
      if (!loadedImages.has(url)) {
        loadedImages.add(url);
        addImageAnimated(url);
      }
    });

  } catch (error) {
    console.log("Error cargando imágenes:", error);
  }
}

// ================= UPLOAD =================
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    addImageAnimated(data.secure_url);

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.secure_url })
    });

  } catch (error) {
    console.log("Error subiendo:", error);
  }
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
