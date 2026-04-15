// 🔹 CONFIG (arriba de todo)
const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";


// 🔹 FUNCIONES EXISTENTES (guardar, cargar, etc.)
async function saveImage(url) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });
}

async function loadImages() {
  const res = await fetch(API_URL + "?t=" + Date.now());
  const data = await res.json();

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  data.forEach(url => addImage(url));
}

function addImage(url) {
  const img = document.createElement("img");
  img.src = url;
  document.getElementById("gallery").prepend(img);
}


// 🔥 👇 PASO 4 (FUNCIÓN DE SUBIDA)
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  const imageUrl = data.secure_url;

  addImage(imageUrl);
  await saveImage(imageUrl);
}


// 🔥 👇 PASO 3 (EVENTOS DEL INPUT)
document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const preview = document.getElementById("preview");

  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {

    const files = Array.from(e.target.files);

    preview.innerHTML = "";

    // preview
    files.forEach(file => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width = "80px";
      img.style.margin = "5px";
      preview.appendChild(img);
    });

    // subir todas
    for (const file of files) {
      await uploadToCloudinary(file);
    }

    fileInput.value = "";

    loadImages();
  });

  // cargar al inicio
  loadImages();
});


// 🔄 auto refresh
setInterval(loadImages, 3000);
