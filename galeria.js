const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// fade
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// cargar imágenes
async function loadImages() {
  const res = await fetch(API_URL);
  images = await res.json();

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  images.forEach((url, index) => {
    const img = document.createElement("img");
    img.src = url;
    img.onclick = () => openModal(index);
    gallery.appendChild(img);
  });
}

// abrir modal
function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.classList.add("active"); // 👈 ya no usamos style.display
  modalImg.src = images[index];

  document.body.classList.add("modal-open");
}

// cerrar modal
function closeModal() {
  const modal = document.getElementById("modal");

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// eventos cierre
document.getElementById("closeModal").onclick = closeModal;

document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") closeModal();
};

// teclado
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("modal");

  if (!modal.classList.contains("active")) return;

  if (e.key === "ArrowRight") {
    currentIndex = (currentIndex + 1) % images.length;
  }

  if (e.key === "ArrowLeft") {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  document.getElementById("modalImg").src = images[currentIndex];
});

// swipe
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

// init
loadImages();
