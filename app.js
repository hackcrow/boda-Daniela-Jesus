// ================= CONFIG =================
const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

const MAX_CONCURRENT_UPLOADS = 3;
const RETRIES = 2;
const TIMEOUT_MS = 30000;

let loadedImages = new Set();
window.audioEnabled = false;

let isFirstLoad = true;

function launchConfetti() {
  const duration = 1500;
  const end = Date.now() + duration;

  (function frame() {
    const colors = ["#ff00cc", "#00ffcc", "#ffff00"];

    for (let i = 0; i < 5; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "8px";
      confetti.style.height = "8px";
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.top = "0px";
      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.opacity = "1";
      confetti.style.zIndex = "9999";
      confetti.style.borderRadius = "50%";

      document.body.appendChild(confetti);

      let fall = setInterval(() => {
        const top = parseFloat(confetti.style.top);
        confetti.style.top = top + 5 + "px";
        confetti.style.opacity -= 0.02;

        if (top > window.innerHeight || confetti.style.opacity <= 0) {
          clearInterval(fall);
          confetti.remove();
        }
      }, 16);
    }

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ================= UTILS =================
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// ================= BACKEND =================
async function saveImage(url) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });
  } catch (e) {
    console.log("Error guardando:", e);
  }
}

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    const ordered = [...data]; // 👈 NO reverse aquí

    const gallery = document.getElementById("gallery");

    // 🟢 PRIMERA CARGA
    if (isFirstLoad) {
      gallery.innerHTML = "";
      loadedImages.clear();

      ordered.forEach(url => {
        loadedImages.add(url);

        const img = document.createElement("img");
        img.src = url;

        gallery.appendChild(img); // 👈 append mantiene orden real
      });

      isFirstLoad = false;
      return;
    }

    // ⚡ NUEVAS FOTOS
    let newCount = 0;

    ordered.forEach(url => {
      if (!loadedImages.has(url)) {
        loadedImages.add(url);
        addImageAnimated(url); // 👈 prepend aquí sí
        newCount++;
      }
    });

    if (newCount >= 3) {
      launchConfetti();
    }

  } catch (error) {
    console.log("Error cargando:", error);
  }
}

// ================= UI =================
function addImage(url) {
  const img = document.createElement("img");
  img.src = url;
  document.getElementById("gallery").prepend(img);
}

// 🔥 ANIMACIÓN + SONIDO
function addImageAnimated(url) {
  const img = document.createElement("img");
  img.src = url;

  img.style.opacity = "0";
  img.style.transform = "scale(0.8) translateY(20px)";

  document.getElementById("gallery").prepend(img);

  setTimeout(() => {
    img.style.transition = "all 0.5s ease";
    img.style.opacity = "1";
    img.style.transform = "scale(1) translateY(0)";

    img.style.boxShadow = "0 0 20px #00ffcc";

    setTimeout(() => {
      img.style.boxShadow = "none";
    }, 1000);

  }, 50);

  // 🔊 sonido (solo si ya hubo interacción)
  if (window.audioEnabled) {
    try {
      const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
      audio.play();
    } catch (e) {}
  }
}

// ================= PREVIEW =================
function createPreviewItem(file) {
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "80px";
  wrapper.style.margin = "5px";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.width = "100%";
  img.style.borderRadius = "8px";

  const bar = document.createElement("div");
  bar.style.position = "absolute";
  bar.style.bottom = "0";
  bar.style.left = "0";
  bar.style.height = "4px";
  bar.style.width = "0%";
  bar.style.background = "#00ffcc";

  const label = document.createElement("div");
  label.style.position = "absolute";
  label.style.top = "0";
  label.style.left = "0";
  label.style.right = "0";
  label.style.fontSize = "10px";
  label.style.background = "rgba(0,0,0,0.6)";
  label.style.color = "#fff";
  label.style.padding = "2px 4px";
  label.innerText = "En cola";

  wrapper.appendChild(img);
  wrapper.appendChild(bar);
  wrapper.appendChild(label);

  return { wrapper, bar, label };
}

// ================= CLOUDINARY =================
async function uploadToCloudinary(file, ui, attempt = 0) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    ui.label.innerText = "Subiendo…";
    ui.bar.style.width = "30%";

    const res = await fetchWithTimeout(url, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Error");

    const data = await res.json();

    ui.bar.style.width = "100%";
    ui.label.innerText = "Listo ✔";

    const imageUrl = data.secure_url;

    addImage(imageUrl);
    await saveImage(imageUrl);

    return imageUrl;

  } catch (err) {
    if (attempt < RETRIES) {
      ui.label.innerText = "Reintentando…";
      await delay(1000);
      return uploadToCloudinary(file, ui, attempt + 1);
    } else {
      ui.label.innerText = "Error ❌";
    }
  }
}

// ================= BATCHES =================
async function uploadInBatches(files, uiItems) {
  for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);
    const batchUI = uiItems.slice(i, i + MAX_CONCURRENT_UPLOADS);

    await Promise.all(
      batch.map((file, i) => uploadToCloudinary(file, batchUI[i]))
    );
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // 🔊 activar audio en primer click
  document.addEventListener("click", () => {
    window.audioEnabled = true;
  }, { once: true });

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const preview = document.getElementById("preview");

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (e) => {

    const files = Array.from(e.target.files);
    if (!files.length) return;

    preview.innerHTML = "";

    const uiItems = files.map(file => {
      const ui = createPreviewItem(file);
      preview.appendChild(ui.wrapper);
      return ui;
    });

    await uploadInBatches(files, uiItems);

    fileInput.value = "";
    loadImages();
  });

  loadImages();
});

// 🔄 AUTO REFRESH
setInterval(loadImages, 3000);
