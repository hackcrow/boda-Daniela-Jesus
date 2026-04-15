
const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 
const folder = "upload";

let loadedImages = new Set();

// BOTÓN SUBIR
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    folder: folder,
    sources: ["local", "camera"],
    multiple: true
  });
}

// FEED EN VIVO
async function loadImages() {
  try {
    const url = `https://res.cloudinary.com/${cloudName}/image/list/${folder}.json`;

    const res = await fetch(url);
    const data = await res.json();

    const images = data.resources.sort((a, b) => b.created_at.localeCompare(a.created_at));

    images.forEach(img => {
      if (!loadedImages.has(img.public_id)) {
        loadedImages.add(img.public_id);

        const image = document.createElement("img");
        image.src = `https://res.cloudinary.com/${cloudName}/image/upload/${img.public_id}.jpg`;

        document.getElementById("gallery").prepend(image);
      }
    });

  } catch (err) {
    console.log("Error cargando imágenes:", err);
  }
}

// refresca cada 5 seg
setInterval(loadImages, 5000);

// primera carga
loadImages();
