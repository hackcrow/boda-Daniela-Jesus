const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

let images = [];
let loadedImages = new Set();
let currentIndex = 0;
let isFirstLoad = true;
let startX = 0;

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  resetModal();
});

window.addEventListener("pageshow", () => {
  resetModal();
});

function resetModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    images = data;

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    const latest = data.slice(0, 20);

    // 🔥 PRIMERA CARGA
    if (isFirstLoad) {
      gallery.innerHTML = "";
      loadedImages.clear();

      latest.forEach((item, index) => {
        const url = typeof item === "string" ? item : item?.url;
        if (!url) return;

        loadedImages.add(url);

        const el = createMediaElement(url, index);
        gallery.appendChild(el);
      });

      isFirstLoad = false;
      return;
    }

    // 🔥 NUEVAS
    latest.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

      if (!loadedImages.has(url)) {
        loadedImages.add(url);

        const el = createMediaElement(url, index);
        el.classList.add("new-photo");

        gallery.prepend(el);

        setTimeout(() => {
          el.classList.remove("new-photo");
        }, 4000);

        // limitar a 20
        while (gallery.children.length > 20) {
          const last = gallery.lastChild;
          loadedImages.delete(last.src || last.currentSrc);
          gallery.removeChild(last);
        }
      }
    });

  } catch (err) {
    console.error("❌ Error cargando:", err);
  }
}

// ================= CREAR IMG / VIDEO =================

function createMediaElement(url, index) {
  let el;

  if (isVideo(url)) {
    el = document.createElement("video");
    el.src = url;
    el.muted = true;
    el.playsInline = true;
  } else {
    el = document.createElement("img");
    el.src = url;
  }

  el.onclick = () => openModal(index);

  return el;
}

function isVideo(url) {
  return url.match(/\.(mp4|webm|mov|ogg)$/i);
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const container = document.getElementById("modalContent");

  if (!modal || !container) return;

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  container.innerHTML = "";

  if (isVideo(url)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";

    container.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";

    container.appendChild(img);
  }

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");
  const container = document.getElementById("modalContent");

  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");

  if (container) container.innerHTML = "";
}

// ================= UPLOAD =================

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");

  if (!uploadBtn || !fileInput) return;

  uploadBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const status = document.getElementById("uploadStatus");
    const text = document.getElementById("uploadText");
    const list = document.getElementById("uploadList");

    status.style.display = "block";
    text.innerText = "📦 Preparando...";
    list.innerHTML = "";

    uploadBtn.disabled = true;
    uploadBtn.innerText = "Subiendo...";

    // previews
    files.forEach((file, index) => {
      const div = document.createElement("div");
      div.className = "upload-item";
      div.id = "upload-" + index;

      const preview = URL.createObjectURL(file);

      div.innerHTML = isVideo(file.name)
        ? `<video src="${preview}" muted></video><span>📦 En espera...</span>`
        : `<img src="${preview}"><span>📦 En espera...</span>`;

      list.appendChild(div);
    });

    // subir
    for (let i = 0; i < files.length; i++) {
      text.innerText = `Subiendo ${i + 1} de ${files.length}`;
      await uploadToCloudinary(files[i], i);
    }

    text.innerText = "🎉 ¡Listo!";

    setTimeout(() => {
      status.style.display = "none";
    }, 2000);

    uploadBtn.disabled = false;
    uploadBtn.innerText = "Comparte tus fotos o videos";

    e.target.value = "";
  });

  // MODAL eventos
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("closeModal");

  if (closeBtn) closeBtn.onclick = closeModal;

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });

    // swipe
    modal.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    modal.addEventListener("touchend", (e) => {
      if (!images.length) return;

      let diff = startX - e.changedTouches[0].clientX;

      if (diff > 50) currentIndex++;
      if (diff < -50) currentIndex--;

      if (currentIndex < 0) currentIndex = images.length - 1;
      if (currentIndex >= images.length) currentIndex = 0;

      openModal(currentIndex);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

// ================= UPLOAD FUNC =================

async function uploadToCloudinary(file, index) {
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const item = document.getElementById("upload-" + index);

  try {
    item.querySelector("span").innerText = "⏳ Subiendo...";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: data.secure_url })
    });

    item.querySelector("span").innerText = "✅ Subida";

  } catch (err) {
    console.error(err);
    item.querySelector("span").innerText = "❌ Error";
  }
}

// ================= AUTO REFRESH =================

loadImages();
setInterval(loadImages, 3000);