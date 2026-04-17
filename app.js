const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

let images = [];
let loadedImages = new Set();
let currentIndex = 0;
let isFirstLoad = true;

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  resetModal();
});

window.addEventListener("pageshow", () => {
  resetModal();
});

function resetModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    images = data;

    const gallery = document.getElementById("gallery");

    const latest = data.slice(0, 20);

    if (isFirstLoad) {
      gallery.innerHTML = "";
      loadedImages.clear();

      latest.forEach((url, index) => {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => openModal(index);

        gallery.appendChild(img);
      });

      isFirstLoad = false;
      return;
    }

    latest.forEach((url, index) => {
      if (!loadedImages.has(url)) {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.classList.add("new-photo");
        img.onclick = () => openModal(index);

        gallery.prepend(img);

        setTimeout(() => img.classList.remove("new-photo"), 500);

        while (gallery.children.length > 20) {
          const last = gallery.lastChild;
          loadedImages.delete(last.src);
          gallery.removeChild(last);
        }
      }
    });

  } catch (err) {
    console.error(err);
  }
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  const imgData = images[index];

  const url =
    typeof imgData === "string"
      ? imgData
      : imgData?.url;

  modal.classList.add("active");
  modalImg.src = url;

  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// ================= SWIPE =================

let startX = 0;

const modal = document.getElementById("modal");

if (modal) {
  modal.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  modal.addEventListener("touchend", (e) => {
    if (!images.length) return;

    let diff = startX - e.changedTouches[0].clientX;

    if (diff > 50) currentIndex++;
    if (diff < -50) currentIndex--;

    if (currentIndex < 0) currentIndex = images.length - 1;
    if (currentIndex >= images.length) currentIndex = 0;

    const imgData = images[currentIndex];
    const url =
      typeof imgData === "string"
        ? imgData
        : imgData?.url;

    document.getElementById("modalImg").src = url;
  });
}

// ================= UPLOAD =================

document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const status = document.getElementById("uploadStatus");
  const text = document.getElementById("uploadText");
  const list = document.getElementById("uploadList");
  const uploadBtn = document.getElementById("uploadBtn");

  // 🔥 UI inmediata
  status.style.display = "block";
  text.innerText = "Preparando fotos...";
  list.innerHTML = "";

  uploadBtn.disabled = true;
  uploadBtn.innerText = "Subiendo fotos...";

  let completed = 0;

  // 🔥 previews
  files.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "upload-item";
    div.id = "upload-" + index;

    div.innerHTML = `
      <img src="${URL.createObjectURL(file)}">
      <span>⏳ En espera...</span>
    `;

    list.appendChild(div);
  });

  // 🔥 subida secuencial con UI fluida
  for (let i = 0; i < files.length; i++) {
    text.innerText = `Subiendo ${completed + 1} de ${files.length}`;

    await new Promise(r => setTimeout(r, 50)); // 🔥 mejora visual

    await uploadToCloudinary(files[i], i);

    completed++;
  }

  text.innerText = "🎉 ¡Tus fotos ya están en la galería!";

  setTimeout(() => {
    status.style.display = "none";
  }, 2000);

  uploadBtn.disabled = false;
  uploadBtn.innerText = "Comparte tus fotos";

  e.target.value = "";
}

// ================= UPLOAD FUNC =================

async function uploadToCloudinary(file, index) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const item = document.getElementById("upload-" + index);

  try {
    item.querySelector("span").innerText = "⏳ Subiendo...";

    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.secure_url })
    });

    item.querySelector("span").innerText = "✅ Subida";

  } catch (err) {
    console.error(err);
    item.querySelector("span").innerText = "❌ Error";
  }
}

// ================= AUTO REFRESH =================

loadImages();
setInterval(loadImages, 3000);

// ================= EVENTOS =================

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("closeModal");

  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
