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
  const gallery = document.getElementById("gallery");

  // 🔥 evitar duplicados
  if (loadedImages.has(url)) return;

  loadedImages.add(url);

  const img = document.createElement("img");
  img.src = url;

  img.classList.add("new-photo");
  img.onclick = () => openModal(url);

  gallery.prepend(img);

  // 🔥 mantener máximo 20
  while (gallery.children.length > 20) {
    const last = gallery.lastChild;
    loadedImages.delete(last.src);
    gallery.removeChild(last);
  }

  setTimeout(() => img.classList.remove("new-photo"), 600);
}

  // 🔥 mantener máximo 20
  while (gallery.children.length > 20) {
    const last = gallery.lastChild;
    loadedImages.delete(last.src);
    gallery.removeChild(last);
  }

  // limpiar clase
  setTimeout(() => img.classList.remove("new-photo"), 600);
}

// ================= LOAD =================
async function loadImages() {
  const res = await fetch(API_URL + "?t=" + Date.now());
  const data = await res.json();

  const gallery = document.getElementById("gallery");

  // 🔥 SOLO 20 MÁS RECIENTES
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
      loadedImages.add(url);
      addImageAnimated(url);
    }
  });
}

// ================= UPLOAD CON PROGRESO =================
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();

    const progressBar = document.getElementById("progressBar");
    progressBar.style.display = "block";

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        progressBar.style.width = percent + "%";
      }
    });

    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {
        progressBar.style.width = "0%";
        progressBar.style.display = "none";

        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);

          //addImageAnimated(data.secure_url);

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

  uploadBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    await Promise.all(files.map(uploadToCloudinary));
    fileInput.value = "";
  });

  loadImages();
});

setInterval(loadImages, 3000);
