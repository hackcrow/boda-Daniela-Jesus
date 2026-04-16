const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

// ================= INIT / RESET =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  resetModalState();
});

window.addEventListener("pageshow", () => {
  resetModalState();
});

function resetModalState() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("active");
  }

  document.body.classList.remove("modal-open");
}

// ================= LOAD IMAGES =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());

    if (!res.ok) throw new Error("Error API: " + res.status);

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

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (!modal || !modalImg) return;

  modal.classList.add("active");
  modalImg.src = images[index];

  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");

  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// cerrar con X
document.getElementById("closeModal").onclick = closeModal;

// cerrar clic en fondo
document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") closeModal();
};

// ================= SWIPE =================

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

// ================= TECLAS (TOGGLE BOTÓN) =================

let keys = [];

document.addEventListener("keydown", (e) => {
  keys.push(e.key.toLowerCase());

  if (keys.length > 3) keys.shift();

  const combo = keys.join("");
  const btn = document.getElementById("downloadBtn");

  if (!btn) return;

  if (combo === "dj9") {
    btn.style.display = "block";
  }

  if (combo === "dj0") {
    btn.style.display = "none";
  }
});

// ================= BOTÓN TOP =================

const topBtn = document.getElementById("topBtn");

if (topBtn) {
  window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  topBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

// ================= DESCARGA =================

document.getElementById("downloadBtn").onclick = async () => {
  const pass = prompt("Ingresa contraseña:");

  if (pass !== "boda123") {
    alert("Contraseña incorrecta");
    return;
  }

  const btn = document.getElementById("downloadBtn");
  btn.innerText = "Generando ZIP...";

  const zip = new JSZip();

  try {
    const folder = zip.folder("fotos_boda");

    for (let i = 0; i < images.length; i++) {
      const url = images[i];

      const response = await fetch(url);
      const blob = await response.blob();

      folder.file(`foto_${i + 1}.jpg`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "fotos_boda.zip";
    a.click();

    URL.revokeObjectURL(a.href);

  } catch (err) {
    console.error(err);
    alert("Error al generar ZIP");
  }

  btn.innerText = "Descargar ZIP";
};

// ================= INIT =================

loadImages();
