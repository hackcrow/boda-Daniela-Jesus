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

    // Primera carga
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

    // Nuevos elementos
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
          loadedImages.delete(last.src || last.querySelector("source")?.src);
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
  if (url.includes(".mp4") || url.includes(".mov")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.onclick = () => openModal(index);
    return video;
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.onclick = () => openModal(index);
    return img;
  }
}

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (!modal || !modalImg) return;

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  modal.classList.add("active");
  modalImg.src = url;

  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
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

      div.innerHTML = `
        ${file.type.startsWith("video") 
          ? `<video src="${preview}" width="40" height="40"></video>` 
          : `<img src="${preview}">`}
        <span>📦 En espera...</span>
      `;

      list.appendChild(div);
    });

    // subir uno por uno
    for (let i = 0; i < files.length; i++) {
      text.innerText = `Subiendo ${i + 1} de ${files.length}`;
      await uploadToCloudinary(files[i], i);
    }

    text.innerText = "🎉 ¡Listo!";

    setTimeout(() => {
      status.style.display = "none";
    }, 2000);

    uploadBtn.disabled = false;
    uploadBtn.innerText = "Comparte tus fotos";

    e.target.value = "";
  });

  // modal eventos
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("closeModal");

  if (closeBtn) closeBtn.onclick = closeModal;

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });

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

      const item = images[currentIndex];
      const url = typeof item === "string" ? item : item?.url;

      document.getElementById("modalImg").src = url;
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

// ================= UPLOAD REAL (PROGRESO %) =================

async function uploadToCloudinary(file, index) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const item = document.getElementById("upload-" + index);
  const span = item.querySelector("span");

  // límite tamaño
  if (file.size > 100 * 1024 * 1024) {
    span.innerText = "❌ Muy pesado (máx 100MB)";
    return;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        span.innerText = `⏳ ${percent}%`;
      }
    };

    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (!data.secure_url) throw new Error("No URL");

        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: data.secure_url })
        });

        span.innerText = "✅ Subida";
        resolve();

      } catch (err) {
        console.error(err);
        span.innerText = "❌ Error";
        reject(err);
      }
    };

    xhr.onerror = () => {
      span.innerText = "❌ Error red";
      reject();
    };

    xhr.send(formData);
  });
}

// ================= AUTO REFRESH =================

loadImages();
setInterval(loadImages, 3000);