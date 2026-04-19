const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

let images = [];
let loadedImages = new Set();
let currentIndex = 0;
let startX = 0;

// ================= INIT =================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  loadImages();
  setInterval(loadImages, 3000);
});

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now());
    const data = await res.json();

    images = data;

    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    gallery.innerHTML = "";

    data.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

      const el = createMedia(url, index);
      gallery.appendChild(el);
    });

  } catch (err) {
    console.error(err);
  }
}

// ================= MEDIA =================

function isVideo(url) {
  return url.match(/\.(mp4|webm|mov|ogg)$/i);
}

function createMedia(url, index) {
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

// ================= MODAL =================

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("modal");
  const container = document.getElementById("modalContent");

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  container.innerHTML = "";

  if (isVideo(url)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;

    container.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = url;

    container.appendChild(img);
  }

  modal.classList.add("active");
}

// cerrar modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("modal").classList.remove("active");
};

document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").classList.remove("active");
  }
};

// ================= UPLOAD =================

document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const status = document.getElementById("uploadStatus");
  const text = document.getElementById("uploadText");
  const list = document.getElementById("uploadList");

  status.style.display = "block";
  list.innerHTML = "";

  for (let i = 0; i < files.length; i++) {
    const div = document.createElement("div");
    div.className = "upload-item";

    div.innerHTML = `<span>⏳ Subiendo ${files[i].name}</span>`;
    list.appendChild(div);

    await upload(files[i]);
  }

  text.innerText = "🎉 Listo!";
  setTimeout(() => status.style.display = "none", 2000);
});

// ================= CLOUDINARY =================

async function uploadToCloudinary(file, index) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const item = document.getElementById("upload-" + index);

  try {
    item.querySelector("span").innerText = "⏳ Subiendo...";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    // 🔥 IMPORTANTE para videos grandes
    formData.append("resource_type", "auto");

    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Error Cloudinary: " + res.status);
    }

    const data = await res.json();

    console.log("🔥 Cloudinary response:", data);

    if (!data.secure_url) {
      throw new Error("No URL recibida");
    }

    // guardar en tu API
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: data.secure_url })
    });

    item.querySelector("span").innerText = "✅ Subida";

  } catch (err) {
    console.error("❌ ERROR REAL:", err);
    item.querySelector("span").innerText = "❌ Error";
  }
}