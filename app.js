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
  document.getElementById("modal").classList.remove("active");
  document.body.classList.remove("modal-open");
}

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    images = data; // 🔥 FIX CRÍTICO
    
    const gallery = document.getElementById("gallery");

    // 🔥 SOLO primeras 20 (más recientes)
    const latest = data.slice(0, 20);

    // 🔥 PRIMERA CARGA (sin animación)
    if (isFirstLoad) {
      gallery.innerHTML = "";
      loadedImages.clear();

      latest.forEach((url, index) => {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => openModal(index);

        gallery.appendChild(img); // orden correcto
      });

      isFirstLoad = false;
      return;
    }

    // 🔥 SOLO NUEVAS (sin borrar nada)
    latest.forEach((url, index) => {
      if (!loadedImages.has(url)) {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.classList.add("new-photo");
        img.onclick = () => openModal(index);

        gallery.prepend(img); // 🔥 nuevas arriba

        setTimeout(() => img.classList.remove("new-photo"), 500);

        // 🔥 mantener máximo 20
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

modal.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

modal.addEventListener("touchend", (e) => {
  let diff = startX - e.changedTouches[0].clientX;

  if (diff > 50) currentIndex++;
  if (diff < -50) currentIndex--;

  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;

  document.getElementById("modalImg").src = images[currentIndex];
});

// ================= UPLOAD =================

document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);

  const status = document.getElementById("uploadStatus");
  const text = document.getElementById("uploadText");
  const list = document.getElementById("uploadList");

  status.style.display = "block";
  list.innerHTML = "";

  let completed = 0;

  // 🔥 crear previews
  files.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "upload-item";
    div.id = "upload-" + index;

    div.innerHTML = `
      <img src="${URL.createObjectURL(file)}">
      <span>⏳ Subiendo...</span>
    `;

    list.appendChild(div);
  });

  // 🔥 subir uno por uno (mejor UX)
  for (let i = 0; i < files.length; i++) {
    await uploadToCloudinary(files[i], i, files.length);

    completed++;

    text.innerText = `Subiendo ${completed} de ${files.length}`;
  }

  text.innerText = "🎉 Subida completada";

  setTimeout(() => {
    status.style.display = "none";
  }, 2000);

  e.target.value = "";
});

async function uploadToCloudinary(file, index, total) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const item = document.getElementById("upload-" + index);

  try {
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

    // ✅ éxito
    item.querySelector("span").innerText = "✅ Subida";

  } catch (err) {
    console.error(err);

    // ❌ error
    item.querySelector("span").innerText = "❌ Error";
  }
}

// ================= AUTO REFRESH =================

loadImages();
setInterval(loadImages, 3000);

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("closeModal");

  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "modal") {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
});
