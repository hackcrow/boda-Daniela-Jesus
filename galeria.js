const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// FADE
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// LOAD
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

// MODAL
function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "flex";
  modalImg.src = images[index];

  document.body.classList.add("modal-open");
}

// CERRAR
document.getElementById("closeModal").onclick = () => {
  document.getElementById("modal").style.display = "none";
  document.body.classList.remove("modal-open");
};

document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") {
    e.target.style.display = "none";
    document.body.classList.remove("modal-open");
  }
};

// TECLADO
document.addEventListener("keydown", (e) => {
  if (document.getElementById("modal").style.display !== "flex") return;

  if (e.key === "ArrowRight") {
    currentIndex = (currentIndex + 1) % images.length;
  }

  if (e.key === "ArrowLeft") {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  document.getElementById("modalImg").src = images[currentIndex];
});

// SWIPE
let startX = 0;

const modal = document.getElementById("modal");

modal.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

modal.addEventListener("touchend", (e) => {
  let diff = startX - e.changedTouches[0].clientX;

  if (diff > 50) currentIndex = (currentIndex + 1) % images.length;
  if (diff < -50) currentIndex = (currentIndex - 1 + images.length) % images.length;

  document.getElementById("modalImg").src = images[currentIndex];
});

// BOTON TOP
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

topBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// BOTON SECRETO
let keys = [];

document.addEventListener("keydown", (e) => {
  keys.push(e.key.toLowerCase());

  if (keys.slice(-3).join("") === "dj9") {
    document.getElementById("downloadBtn").style.display = "block";
  }
});

// DESCARGA
document.getElementById("downloadBtn").onclick = () => {
  const pass = prompt("Contraseña:");

  if (pass !== "1234") return alert("Incorrecto");

  images.forEach((url, i) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `foto_${i}.jpg`;
    a.click();
  });
};

// INIT
loadImages();
