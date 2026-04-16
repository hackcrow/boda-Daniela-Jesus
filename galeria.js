const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// FADE
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// LOAD
async function loadImages() {
  try {
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

  } catch (err) {
    console.error("Error cargando imágenes:", err);
  }
}

// MODAL
function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.classList.add("active");
  modalImg.src = images[index];

  document.body.classList.add("modal-open");
}

// CLOSE
function closeModal() {
  document.getElementById("modal").classList.remove("active");
  document.body.classList.remove("modal-open");
}

document.getElementById("closeModal").onclick = closeModal;

document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") closeModal();
};

// SWIPE
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

// BOTÓN TOP
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

topBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 🔐 BOTÓN SECRETO
let keys = [];

document.addEventListener("keydown", (e) => {
  keys.push(e.key.toLowerCase());

  if (keys.slice(-3).join("") === "dj9") {
    document.getElementById("downloadBtn").style.display = "block";
  }
});

// 📥 DESCARGA
document.getElementById("downloadBtn").onclick = () => {
  const pass = prompt("Ingresa contraseña:");

  if (pass !== "boda123") {
    alert("Contraseña incorrecta");
    return;
  }

  images.forEach((url, i) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `foto_${i}.jpg`;
    a.click();
  });
};

// INIT
loadImages();
