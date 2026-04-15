const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 

const BIN_ID = "69dfc51b856a68218939a661";
const API_KEY = "$2a$10$eT1ZGxw9WFErBX5VhYLGnutB4dsjwHnTABwA.p76iLx90hDMW9bSO";

let loadedImages = new Set();

let isSaving = false;

// 📸 SUBIR FOTO
function openWidget() {
  let uploadedImages = [];

  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ["local", "camera"],
    multiple: true
  },
  (error, result) => {

    if (!error && result) {

      if (result.event === "success") {
        uploadedImages.push(result.info.secure_url);
        addImage(result.info.secure_url); // se ve inmediato
      }

      // 🔥 cuando termina todo el batch
      if (result.event === "queues-end") {
        saveMultipleImages(uploadedImages);
        uploadedImages = [];
      }

    }
  });
}

// 🔥 AGREGAR IMAGEN AL DOM
function addImage(url) {
  if (loadedImages.has(url)) return;

  const img = document.createElement("img");
  img.src = url;

  img.onerror = () => {
    console.log("Imagen eliminada:", url);
  };

  loadedImages.add(url);
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
function saveImage(url) {
  saveQueue = saveQueue.then(async () => {
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

      console.log("Guardado:", url);

    } catch (error) {
      console.log("Error guardando:", error);
    }
  });
}

async function saveMultipleImages(newUrls) {
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

    // 🔥 agregar todas juntas
    newUrls.forEach(url => {
      if (!images.includes(url)) {
        images.unshift(url);
      }
    });

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

    console.log("Guardadas todas:", newUrls.length);

  } catch (error) {
    console.log("Error guardando múltiples:", error);
  }
}

// 🚀 AUTO REFRESH (simula tiempo real)
setInterval(loadImages, 5000);

// 🔥 CARGA INICIAL
loadImages();
