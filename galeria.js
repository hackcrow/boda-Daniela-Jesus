const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// ================= LOAD =================
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

// ================= MODAL =================
function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "flex";
  modalImg.src = images[index];
}

// navegar
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

// cerrar modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

// ================= SCROLL TOP =================
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});

topBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ================= BOTÓN OCULTO =================
let secretKeys = [];

document.addEventListener("keydown", (e) => {
  secretKeys.push(e.key.toLowerCase());

  // combo: d + j + 9 (puedes cambiarlo)
  if (secretKeys.slice(-3).join("") === "dj9") {
    document.getElementById("downloadBtn").style.display = "inline-block";
  }
});

// ================= DESCARGA =================
document.getElementById("downloadBtn").onclick = async () => {
  const password = prompt("Ingresa contraseña:");

  if (password !== "1234") {
    alert("Contraseña incorrecta");
    return;
  }

  alert("Preparando descarga...");

  images.forEach((url, i) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `foto_${i}.jpg`;
    a.click();
  });
};

// ================= INIT =================
loadImages();
