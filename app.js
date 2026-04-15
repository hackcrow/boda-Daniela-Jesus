
const cloudName = "TU_CLOUD_NAME";
const folder = "TU_FOLDER";

let loadedImages = new Set();

async function loadImages() {
  try {
    const url = `https://res.cloudinary.com/${cloudName}/image/list/${folder}.json`;

    const res = await fetch(url);
    const data = await res.json();

    // Ordenar por fecha (más nuevas primero)
    const images = data.resources.sort((a, b) => b.created_at.localeCompare(a.created_at));

    images.forEach(img => {
      if (!loadedImages.has(img.public_id)) {

        loadedImages.add(img.public_id);

        const image = document.createElement("img");
        image.src = `https://res.cloudinary.com/${cloudName}/image/upload/${img.public_id}.jpg`;

        image.style.opacity = 0;
        image.onload = () => {
          image.style.transition = "0.5s";
          image.style.opacity = 1;
        };

        document.getElementById("gallery").prepend(image);
      }
    });

  } catch (err) {
    console.log("Error cargando imágenes:", err);
  }
}

// 🔄 Cargar cada 5 segundos
setInterval(loadImages, 5000);

// 🚀 Primera carga inmediata
loadImages();
