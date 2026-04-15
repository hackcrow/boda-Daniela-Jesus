const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 
const folder = "bodaDanielaJesus";

// 📸 SUBIR
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    folder: folder,
    sources: ["local", "camera"],
    multiple: true
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      addImage(result.info.secure_url);
    }
  });
}

// 🔥 AGREGAR IMAGEN
function addImage(url) {
  const img = document.createElement("img");
  img.src = url;
  document.getElementById("gallery").prepend(img);
}

// 🔄 CARGAR IMÁGENES (PRO TIP: lista manual)
async function loadImages() {
  try {
    // ⚠️ aquí usamos una lista manual temporal
    const images = [
      // pega aquí URLs de prueba si quieres
    ];

    images.forEach(url => addImage(url));

  } catch (e) {
    console.log(e);
  }
}
