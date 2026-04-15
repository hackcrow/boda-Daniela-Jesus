const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia";
const folder = "bodaDanielaJesus";

// 📸 SUBIR FOTO
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName,
    uploadPreset,
    folder,
    sources: ["local", "camera"],
    multiple: true
  },
  async (error, result) => {

    if (!error && result && result.event === "success") {

      const url = result.info.secure_url;

      console.log("Subida:", url);

      addImage(url);
      await saveImage(url);
    }

    // 🔥 cuando termina todo el batch
    if (result.event === "queues-end") {
      await loadImages(); // sincroniza todo
    }
  });
}

// 💾 GUARDAR
async function saveImage(url) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });
  } catch (error) {
    console.log("Error guardando:", error);
  }
}

// 📥 CARGAR TODAS
async function loadImages() {
  try {
    const res = await fetch(API_URL + "?t=" + Date.now()); // 🚫 evita caché
    const data = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    data.forEach(url => addImage(url));

  } catch (error) {
    console.log("Error cargando:", error);
  }
}

// 🖼️ AGREGAR A GALERÍA
function addImage(url) {
  const img = document.createElement("img");
  img.src = url;
  document.getElementById("gallery").prepend(img);
}

// 🗑️ BORRAR TODO
async function clearGallery() {
  const confirmDelete = confirm("¿Borrar todas las fotos?");
  if (!confirmDelete) return;

  await fetch(API_URL, { method: "DELETE" });

  document.getElementById("gallery").innerHTML = "";
}

// 🚀 INICIALIZAR
document.addEventListener("DOMContentLoaded", () => {
  loadImages();

  document.getElementById("uploadBtn").addEventListener("click", openWidget);
});

// 🔄 AUTO REFRESH (feed en vivo)
setInterval(loadImages, 2000);
