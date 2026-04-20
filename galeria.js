const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    console.log("DATA:", data); // debug

    images = data;

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    gallery.innerHTML = "";

    images.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

      let el;

      // 🎥 VIDEO
      if (url.match(/\.(mp4|mov|webm)$/i)) {
        el = document.createElement("video");
        el.src = url;
        el.controls = true;
        el.muted = true;
        el.playsInline = true;
      } 
      // 🖼 IMAGEN
      else {
        el = document.createElement("img");
        el.src = url;
      }

      // 🔥 SI FALLA (404), SE ELIMINA
      el.onerror = () => {
        console.warn("❌ Archivo roto eliminado:", url);
        el.remove();
      };

      el.onclick = () => openModal(index);

      gallery.appendChild(el);
    });

  } catch (err) {
    console.error("❌ Error cargando:", err);
  }
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (!modal || !modalImg) return;

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  // 🎥 VIDEO
  if (url.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";

    video.onerror = () => {
      console.warn("❌ Video roto en modal:", url);
      closeModal();
    };

    modalImg.replaceWith(video);
    video.id = "modalImg";
  } 
  // 🖼 IMAGEN
  else {
    modalImg.src = url;

    modalImg.onerror = () => {
      console.warn("❌ Imagen rota en modal:", url);
      closeModal();
    };
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

// ================= EVENTS =================

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
