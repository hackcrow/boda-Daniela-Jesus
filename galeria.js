const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;
let modalOpen = false;
let keys = [];
let startX = 0;

// CACHE ELEMENTS
const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeModalBtn = document.getElementById("closeModal");
const topBtn = document.getElementById("topBtn");
const downloadBtn = document.getElementById("downloadBtn");

// FADE IN
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// LOAD IMAGES
async function loadImages() {
  try {
    const res = await fetch(API_URL);
    images = await res.json();

    gallery.innerHTML = "";

    images.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;

      img.addEventListener("click", () => openModal(index));

      gallery.appendChild(img);
    });
  } catch (err) {
    console.error("Error cargando imágenes:", err);
  }
}

// OPEN MODAL
function openModal(index) {
  if (!images.length) return;

  currentIndex = index;
  modalOpen = true;

  modal.style.display = "flex";
  modalImg.src = images[currentIndex];

  document.body.classList.add("modal-open");
}

// CLOSE MODAL
function closeModal() {
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
  modalOpen = false;
}

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// NAVIGATION
function showImage(index) {
  if (!images.length) return;

  currentIndex = index;
  modalImg.src = images[currentIndex];
}

function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex);
}

function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(currentIndex);
}

// KEYBOARD NAV
document.addEventListener("keydown", (e) => {
  if (!modalOpen) {
    keys.push(e.key.toLowerCase());

    if (keys.slice(-3).join("") === "dj9") {
      downloadBtn.style.display = "block";
    }

    return;
  }

  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});

// SWIPE
modal.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

modal.addEventListener("touchend", (e) => {
  if (!modalOpen) return;

  const diff = startX - e.changedTouches[0].clientX;

  if (diff > 50) nextImage();
  if (diff < -50) prevImage();
});

// TOP BUTTON
window.addEventListener("scroll", () => {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

topBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// DOWNLOAD ALL
downloadBtn.addEventListener("click", () => {
  const pass = prompt("Contraseña:");

  if (pass !== "1234") {
    alert("Incorrecto");
    return;
  }

  images.forEach((url, i) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `foto_${i}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
});

// INIT
loadImages();
