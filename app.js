const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 
const tag = "bodaDanielaJesus";
const BIN_ID = "69dfc51b856a68218939a661";
const API_KEY = "$2a$10$eT1ZGxw9WFErBX5VhYLGnutB4dsjwHnTABwA.p76iLx90hDMW9bSO";

let loadedImages = new Set();

// 📸 SUBIR
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ["local", "camera"],
    multiple: true,
    tags: [tag]
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      const url = result.info.secure_url;

      addImage(url);
      saveImage(url);
    }
  });
}

// 💾 GUARDAR EN LOCAL STORAGE (fallback)
function saveImage(url) {
  let images = JSON.parse(localStorage.getItem("fiestaImages")) || [];
  images.unshift(url);
  localStorage.setItem("fiestaImages", JSON.stringify(images));
}

// 🔥 AGREGAR IMAGEN
function addImage(url) {
  if (loadedImages.has(url)) return;

  loadedImages.add(url);

  const img = document.createElement("img");
  img.src = url;

  document.getElementById("gallery").prepend(img);
}

// 🔄 CARGAR DESDE LOCAL (para persistencia)
function loadLocalImages() {
  const images = JSON.parse(localStorage.getItem("fiestaImages")) || [];
  images.forEach(url => addImage(url));
}

// 🚀 AUTO REFRESH SIMULADO
setInterval(loadLocalImages, 3000);

// 🔥 INICIO
loadLocalImages();

async function loadImages() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });

    const data = await res.json();

    console.log("DATA:", data); // 👈 AGREGA ESTO

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    data.record.imagenes.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      gallery.appendChild(img);
    });

  } catch (error) {
    console.log("Error cargando imágenes:", error);
  }
}

loadImages();

async function saveImage(url) {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });

    const data = await res.json();
    const images = data.record.imagenes;

    images.unshift(url);

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
}
