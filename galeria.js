const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// FADE
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// =====================
// LOAD IMAGES
// =====================
async function loadImages() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error("API falló: " + res.status);
    }

    images = await res.json();

    const gallery = document.getElementById("gallery");

    if (!gallery) {
      console.error("NO EXISTE #gallery");
      return;
    }

    gallery.innerHTML = "";

    images.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;

      // 🔥 CLICK PARA ABRIR MODAL (CLAVE)
      img.addEventListener("click", () => {
        openModal(index);
      });

      gallery.appendChild(img);
    });

  } catch (err) {
    console.error("ERROR GALERÍA:", err);
  }
}

// =====================
// MODAL
// =====================
function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");

  console.log("URL imagen:", images[currentIndex]); // DEBUG IMPORTANTE

  if (!modal || !modalImg) return;

  modal.classList.remove("hidden");

  const url =
    typeof images[currentIndex] === "string"
      ? images[currentIndex]
      : images[currentIndex]?.url;

  modalImg.src = url;

  modalImg.style.display = "block";
  modalImg.style.opacity = "1";
  modalImg.style.maxWidth = "90%";
  modalImg.style.maxHeight = "90%";

  document.body.classList.add("modal-open");
}

// click fuera del modal
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (e.target === modal) closeModal();
});

// =====================
// SWIPE
// =====================
let startX = 0;

document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
  const modal = document.getElementById("modal");

  if (!modal || modal.classList.contains("hidden")) return;

  let diff = startX - e.changedTouches[0].clientX;

  if (diff > 50) currentIndex++;
  if (diff < -50) currentIndex--;

  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;

  const modalImg = document.getElementById("modal-img");
  if (modalImg) {
    modalImg.src = images[currentIndex];
  }
});

// =====================
// BOTÓN TOP
// =====================
const topBtn = document.getElementById("topBtn");

if (topBtn) {
  window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  topBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

// =====================
// DESCARGA
// =====================
const downloadBtn = document.getElementById("downloadBtn");

if (downloadBtn) {
  downloadBtn.onclick = () => {
    const pass = prompt("Ingresa contraseña:");

    if (pass !== "boda123") {
      alert("Contraseña incorrecta");
      return;
    }

    images.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `foto_${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };
}

// INIT
loadImages();
