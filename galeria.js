const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    images = data;

    const gallery = document.getElementById("gallery");
    if (!gallery) {
      console.error("❌ No existe #gallery");
      return;
    }

    gallery.innerHTML = "";

    images.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

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

      el.style.width = "100%";
      el.style.marginBottom = "10px";
      el.onclick = () => openModal(index);

      gallery.appendChild(el);
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent) {
    console.error("❌ Modal no existe");
    return;
  }

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  modalContent.innerHTML = "";

  if (url.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.width = "100%";

    modalContent.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100%";

    modalContent.appendChild(img);
  }

  modal.style.display = "flex";
}

// ================= CLOSE =================

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

// ================= EVENTS =================

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");

  if (closeBtn) closeBtn.onclick = closeModal;

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });
  }

  loadImages();
});
