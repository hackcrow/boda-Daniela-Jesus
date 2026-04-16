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


// ================= 🔥 FIX GLOBAL MODAL =================
window.addEventListener("load", () => {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (modal) modal.style.display = "none";
  if (modalImg) modalImg.src = "";

  document.body.classList.remove("modal-open");
});


// ================= MODAL =================
function openModal(url) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "flex";
  modalImg.src = url;

  // 🔥 IMPORTANTE: evita fondo negro fantasma
  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "none";
  modalImg.src = "";

  document.body.classList.remove("modal-open");
}


// ================= ANIMACIÓN =================
function addImageAnimated(url) {
  const gallery = document.getElementById("gallery");

  if (loadedImages.has(url)) return;

  loadedImages.add(url);

  const img = document.createElement("img");
  img.src = url;

  img.classList.add("new-photo");
  img.onclick = () => openModal(url);

  gallery.prepend(img);

  while (gallery.children.length > 20) {
    const last = gallery.lastChild;
    loadedImages.delete(last.src);
    gallery.removeChild(last);
  }

  setTimeout(() => img.classList.remove("new-photo"), 600);
}


// ================= LOAD =================
async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    const gallery = document.getElementById("gallery");

    const latest = data.slice(0, 20);

    if (isFirstLoad) {
      gallery.innerHTML = "";
      loadedImages.clear();

      latest.forEach(url => {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => openModal(url);

        gallery.appendChild(img);
      });

      isFirstLoad = false;
      return;
    }

    latest.forEach(url => {
      if (!loadedImages.has(url)) {
        addImageAnimated(url);
      }
    });

  } catch (error) {
    console.log("Error cargando imágenes:", error);
  }
}


// ================= UPLOAD =================
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();

    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");

    progressContainer.style.display = "block";

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        progressBar.style.width = percent + "%";
      }
    });

    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {

        progressBar.style.width = "0%";
        progressContainer.style.display = "none";

        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);

          await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: data.secure_url })
          });

          resolve();
        } else {
          reject();
        }
      }
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    xhr.open("POST", url);
    xhr.send(formData);
  });
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");

  uploadBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);

    await Promise.all(files.map(uploadToCloudinary));

    fileInput.value = "";
  });

  // 🔥 cerrar modal correctamente
  closeModalBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target.id === "modal") {
      closeModal();
    }
  };

  loadImages();
});


// 🔄 auto refresh
setInterval(loadImages, 3000);
