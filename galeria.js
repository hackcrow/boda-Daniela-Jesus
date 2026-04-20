const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];

// ================= LOAD =================

async function loadImages() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    console.log("DATA:", data); // 👈 DEBUG

    images = data;

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    images.forEach((item, index) => {
      const url = typeof item === "string" ? item : item?.url;
      if (!url) return;

      let el;

      // 🎥 VIDEO
      if (url.match(/\.(mp4|mov|webm)$/i)) {
        el = document.createElement("video");
        el.src = url;
        el.controls = true;
        el.muted = true;
        el.playsInline = true;
      } else {
        el = document.createElement("img");
        el.src = url;
      }

      el.onclick = () => openModal(index);

      gallery.appendChild(el);
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

// ================= MODAL =================

function openModal(index) {
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");

  const item = images[index];
  const url = typeof item === "string" ? item : item?.url;

  modalContent.innerHTML = "";

  if (url.match(/\.(mp4|mov|webm)$/i)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    modalContent.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = url;
    modalContent.appendChild(img);
  }

  modal.style.display = "flex";
}

// ================= CLOSE =================

document.getElementById("closeModal").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
};

// ================= INIT =================

loadImages();
