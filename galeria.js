const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let loadedImages = new Set();
let currentIndex = 0;

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  resetModalState();
  initEvents();
  loadImages();
  setInterval(loadImages, 3000);
});

window.addEventListener("pageshow", () => {
  resetModalState();
});

function resetModalState() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// ================= LOAD IMAGES =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());

    if (!res.ok) throw new Error("Error API");

    const data = await res.json();
    images = data;

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    // 🔥 PRIMERA CARGA
    if (loadedImages.size === 0) {
      gallery.innerHTML = "";

      images.forEach((imgData, index) => {
        const url =
          typeof imgData === "string"
            ? imgData
            : imgData?.url;

        if (!url) return;

        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => openModal(index);

        gallery.appendChild(img);
      });

      return;
    }

    // 🔥 NUEVAS IMÁGENES
    images.forEach((imgData, index) => {
      const url =
        typeof imgData === "string"
          ? imgData
          : imgData?.url;

      if (!url || loadedImages.has(url)) return;

      loadedImages.add(url);

      const img = document.createElement("img");
      img.src = url;
      img.classList.add("new-photo");
      img.onclick = () => openModal(index);

      gallery.prepend(img);

      setTimeout(() => {
        img.classList.remove("new-photo");
      }, 2000);
    });

  } catch (err) {
    console.error("Error cargando imágenes:", err);
  }
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (!modal || !modalImg) return;

  const imgData = images[index];

  const url =
    typeof imgData === "string"
      ? imgData
      : imgData?.url;

  if (!url) return;

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

// ================= EVENTOS =================

function initEvents() {
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");

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
}