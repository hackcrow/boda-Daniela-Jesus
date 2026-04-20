const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  resetModalState();
});

window.addEventListener("pageshow", () => {
  resetModalState();
});

function resetModalState() {
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
    if (!gallery) return;

    gallery.innerHTML = "";

    images.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

      const el = createMediaElement(url, index);
      gallery.appendChild(el);
    });

  } catch (err) {
    console.error("❌ Error cargando galería:", err);
  }
}

// ================= CREAR IMG / VIDEO =================

function createMediaElement(url, index) {

  // 🎥 VIDEO
  if (url.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");

    video.src = url;
    video.playsInline = true;
    video.muted = true;
    video.loop = true;

    // 🔥 preview automático tipo app
    video.addEventListener("mouseenter", () => video.play());
    video.addEventListener("mouseleave", () => video.pause());

    // 📱 iPhone autoplay fix
    video.addEventListener("loadeddata", () => {
      video.play().catch(() => {});
    });

    video.onclick = () => openModal(index);

    return video;
  }

  // 🖼 IMAGEN
  const img = document.createElement("img");
  img.src = url;
  img.onclick = () => openModal(index);

  return img;
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent) return;

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  modalContent.innerHTML = "";

  // 🎥 VIDEO en modal
  if (url.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    modalContent.appendChild(video);
  } 
  // 🖼 IMAGEN en modal
  else {
    const img = document.createElement("img");
    img.src = url;

    modalContent.appendChild(img);
  }

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// ================= EVENTOS =================

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("closeModal");

  if (closeBtn) closeBtn.onclick = closeModal;

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

// ================= AUTO REFRESH =================

loadImages();
setInterval(loadImages, 3000);
