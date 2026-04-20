const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let loadedSet = new Set();
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

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    images = data;

    data.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

      // 🔥 ya existe → no lo agregues
      if (loadedSet.has(url)) return;

      loadedSet.add(url);

      let el;

      // 🎥 VIDEO
      if (url.match(/\.(mp4|mov|webm)$/i)) {
        el = document.createElement("video");
        el.src = url;
        el.muted = true;
        el.playsInline = true;
        el.controls = true;
      } 
      // 🖼 IMAGEN
      else {
        el = document.createElement("img");
        el.src = url;
      }

      // ❌ si falla, lo quitamos
      el.onerror = () => {
        el.remove();
        loadedSet.delete(url);
      };

      el.onclick = () => openModal(index);

      // 🔥 SI ES NUEVA → arriba
      gallery.prepend(el);
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  if (!modal || !modalImg) return;

  // 🎥 VIDEO
  if (url.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";

    modalImg.replaceWith(video);
    video.id = "modalImg";
  } 
  // 🖼 IMAGEN
  else {
    modalImg.src = url;
  }

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

// ================= CLOSE =================

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
setInterval(loadImages, 5000); // 🔥 más relajado (antes 3000)
