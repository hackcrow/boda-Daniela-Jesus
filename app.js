// ================= CONFIG =================
const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

// Ajusta según el evento/red
const MAX_CONCURRENT_UPLOADS = 3;   // 🔥 3–4 recomendado
const RETRIES = 2;                  // reintentos por archivo
const TIMEOUT_MS = 30000;           // 30s por subida

// ================= UTILS =================
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ================= BACKEND =================
async function saveImage(url) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
  } catch (e) {
    console.log("Error guardando:", e);
  }
}

async function loadImages() {
  try {
    // evita caché
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    data.forEach(url => addImage(url));
  } catch (e) {
    console.log("Error cargando:", e);
  }
}

// ================= UI =================
function addImage(url) {
  const img = document.createElement("img");
  img.src = url;
  document.getElementById("gallery").prepend(img);
}

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
  bar.style.borderRadius = "4px";

  const label = document.createElement("div");
  label.style.position = "absolute";
  label.style.top = "0";
  label.style.left = "0";
  label.style.right = "0";
  label.style.fontSize = "10px";
  label.style.background = "rgba(0,0,0,0.6)";
  label.style.color = "#fff";
  label.style.padding = "2px 4px";
  label.style.borderTopLeftRadius = "8px";
  label.style.borderTopRightRadius = "8px";
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

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    if (!data.secure_url) throw new Error("No secure_url");

    ui.bar.style.width = "100%";
    ui.label.innerText = "Listo ✔";

    const imageUrl = data.secure_url;

    // UI inmediata
    addImage(imageUrl);

    // persistencia
    await saveImage(imageUrl);

    return imageUrl;

  } catch (err) {
    console.log("Error subiendo:", file.name, err);

    if (attempt < RETRIES) {
      ui.label.innerText = `Reintentando (${attempt + 1})…`;
      await delay(800 * (attempt + 1)); // backoff simple
      return uploadToCloudinary(file, ui, attempt + 1);
    } else {
      ui.label.innerText = "Error ❌";
      ui.bar.style.background = "#ff4d4d";
      throw err;
    }
  }
}

// ================= CONCURRENCIA (BATCHES) =================
async function uploadInBatches(files, uiItems, batchSize = MAX_CONCURRENT_UPLOADS) {
  for (let i = 0; i < files.length; i += batchSize) {
    const batchFiles = files.slice(i, i + batchSize);
    const batchUI = uiItems.slice(i, i + batchSize);

    // marca en cola
    batchUI.forEach(ui => ui.label.innerText = "En cola…");

    await Promise.all(
      batchFiles.map((file, idx) => uploadToCloudinary(file, batchUI[idx]))
    );
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const preview = document.getElementById("preview");

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    preview.innerHTML = "";

    // crear preview + refs UI
    const uiItems = files.map(file => {
      const ui = createPreviewItem(file);
      preview.appendChild(ui.wrapper);
      return ui;
    });

    // 🔥 subida en paralelo controlado
    await uploadInBatches(files, uiItems, MAX_CONCURRENT_UPLOADS);

    // limpia input
    fileInput.value = "";

    // sincroniza feed
    await loadImages();
  });

  // carga inicial
  loadImages();
});

// 🔄 auto-refresh (suave)
setInterval(loadImages, 3000);
