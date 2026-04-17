const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let loadedImages = new Set();
let currentIndex = 0;
let isFirstLoad = true;

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

// ================= LOAD IMAGES =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    images = data;

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    // 🔥 SOLO primeras 50 (puedes ajustar)
    const latest = data.slice(0, 50);

    // ================= PRIMERA CARGA =================
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

    // ================= NUEVAS IMÁGENES =================
    latest.forEach((url, index) => {
      if (!loadedImages.has(url)) {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;

        // 🔥 animación glow + zoom
        img.classList.add("new-photo");

        img.onclick = () => openModal(index);

        // 🔥 meter arriba
        gallery.prepend(img);

        // quitar animación después
        setTimeout(() => {
          img.classList.remove("new-photo");
        }, 2000);

        // 🔥 limitar cantidad
        while (gallery.children.length > 50) {
          const last = gallery.lastChild;
          loadedImages.delete(last.src);
          gallery.removeChild(last);
        }
      }
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

  const imgData = images[index];
  const url = typeof imgData === "string" ? imgData : imgData?.url;

  modal.classList.add("active");
  modalImg.src = url;

  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// cerrar con X
document.getElementById("closeModal").onclick = closeModal;

// cerrar tocando fondo
document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") closeModal();
};

// ================= AUTO REFRESH =================

// 🔥 cada 3 segundos
loadImages();
setInterval(loadImages, 3000);
