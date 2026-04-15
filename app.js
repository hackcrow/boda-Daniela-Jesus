const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 
const tag = "bodaDanielaJesus";

let loadedImages = new Set();

// 📸 SUBIR
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ["local", "camera"],
    multiple: true,
    tags: [tag] // 🔥 IMPORTANTE
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      addImage(result.info.secure_url);
    }
  });
}

// 🔥 AGREGAR IMAGEN
function addImage(url) {
  if (loadedImages.has(url)) return;

  loadedImages.add(url);

  const img = document.createElement("img");
  img.src = url;

  document.getElementById("gallery").prepend(img);
}

// 🔄 CARGAR DESDE CLOUDINARY
async function loadImages() {
  try {
    const res = await fetch(`https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`);
    const data = await res.json();

    data.resources.forEach(img => {
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${img.public_id}.jpg`;
      addImage(url);
    });

  } catch (e) {
    console.log("Error cargando imágenes:", e);
  }
}

// 🚀 AUTO REFRESH (cada 5 segundos)
setInterval(loadImages, 5000);

// 🔥 CARGA INICIAL
loadImages();
