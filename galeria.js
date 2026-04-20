const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let loadedSet = new Set();

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// ================= HELPERS =================

// 🔥 obtener timestamp desde Cloudinary
function getTimestamp(url) {
  const match = url.match(/\/v(\d+)\//);
  return match ? parseInt(match[1]) : 0;
}

// 🔥 convertir videos a mp4 compatible
function fixVideoUrl(url) {
  if (url.includes("/video/upload/")) {
    return url.replace("/upload/", "/upload/f_mp4/");
  }
  return url;
}

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    // 🔥 ordenar por más recientes
    data.sort((a, b) => {
      const urlA = typeof a === "string" ? a : a?.url;
      const urlB = typeof b === "string" ? b : b?.url;

      return getTimestamp(urlB) - getTimestamp(urlA);
    });

    images = data;

    data.forEach((item) => {
      const rawUrl = typeof item === "string" ? item : item?.url;
      if (!rawUrl) return;

      const url = fixVideoUrl(rawUrl);

      // 🔥 evitar duplicados
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

      // ❌ si falla, eliminar
      el.onerror = () => {
        el.remove();
        loadedSet.delete(url);
      };

      // 🔥 abrir modal con URL directa (sin index bug)
      el.onclick = () => openModal(url);

      // 🔥 agregar en orden correcto
      gallery.appendChild(el);
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// ================= MODAL =================

function openModal(url) {
  const modal = document.getElementById("modal");
  let modalMedia = document.getElementById("modalImg");

  if (!modal || !modalMedia) return;

  const fixedUrl = fixVideoUrl(url);

  // 🔥 limpiar contenido anterior
  const newMedia = modalMedia.cloneNode();
  modalMedia.replaceWith(newMedia);
  modalMedia = newMedia;

  // 🎥 VIDEO
  if (fixedUrl.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");
    video.src = fixedUrl;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";

    newMedia.replaceWith(video);
    video.id = "modalImg";
  } 
  // 🖼 IMAGEN
  else {
    newMedia.src = fixedUrl;
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
setInterval(loadImages, 5000);
