const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 

const BIN_ID = "69dfc51b856a68218939a661";
const API_KEY = "$2a$10$eT1ZGxw9WFErBX5VhYLGnutB4dsjwHnTABwA.p76iLx90hDMW9bSO";

let loadedImages = new Set();

let isSaving = false;

// 📸 SUBIR FOTO
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ["local", "camera"],
    multiple: true,
    tags: ["bodaDanielaJesus"] // 🔥 aquí
  },
  (error, result) => {
    if (!error && result && result.event === "success") {

      const url = result.info.secure_url;

      addImage(url);
      saveImage(url);

    }
  });
}

// 🔥 AGREGAR IMAGEN AL DOM
function addImage(url) {
  if (loadedImages.has(url)) return;

  loadedImages.add(url);

  const img = document.createElement("img");
  img.src = url;

  document.getElementById("gallery").prepend(img);
}

// 🔄 CARGAR IMÁGENES DESDE JSONBIN
async function loadImages() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });

    const data = await res.json();

    data.record.imagenes.forEach(url => {
      addImage(url); // ya evita duplicados
    });

  } catch (error) {
    console.log("Error cargando imágenes:", error);
  }
}

// 💾 GUARDAR EN JSONBIN
async function saveImage(url) {
  if (isSaving) return; // evita choques
  isSaving = true;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });

    const data = await res.json();

    let images = [];

    if (data.record && Array.isArray(data.record.imagenes)) {
      images = data.record.imagenes;
    }

    if (!images.includes(url)) {
      images.unshift(url);
    }

    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify({
        imagenes: images
      })
    });

  } catch (error) {
    console.log("Error guardando:", error);
  }

  isSaving = false;
}

// 🚀 AUTO REFRESH (simula tiempo real)
setInterval(loadImages, 5000);

// 🔥 CARGA INICIAL
loadImages();
