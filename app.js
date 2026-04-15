const cloudName = "dazidfv1m";
const uploadPreset = "fiesta-mia"; 

// 📸 SUBIR FOTO
function openWidget() {
  cloudinary.openUploadWidget({
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ["local", "camera"],
    multiple: true
  },
  async (error, result) => {

    if (!error && result && result.event === "success") {
      const url = result.info.secure_url;

      addImage(url);     // se ve inmediato
      await saveImage(url); // se guarda en Vercel
    }

  });
}

// 🔥 AGREGAR IMAGEN AL DOM
function addImage(url) {
  const img = document.createElement("img");
  img.src = url;

  img.onerror = () => {
    console.log("Imagen eliminada:", url);
  };

  document.getElementById("gallery").prepend(img);
}

// 💾 GUARDAR EN VERCEL API
async function saveImage(url) {
  try {
    await fetch("/api/images", {
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

// 🔄 CARGAR IMÁGENES DESDE API
async function loadImages() {
  try {
    const res = await fetch("/api/images");
    const data = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    data.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      gallery.appendChild(img);
    });

  } catch (error) {
    console.log("Error cargando imágenes:", error);
  }
}

async function clearGallery() {
  const confirmDelete = confirm("¿Seguro que quieres borrar TODAS las fotos?");
  if (!confirmDelete) return;

  await fetch("/api/images", {
    method: "DELETE"
  });

  document.getElementById("gallery").innerHTML = "";
}

// 🚀 AUTO REFRESH (cada 3 segundos)
setInterval(loadImages, 3000);

// 🔥 CARGA INICIAL
loadImages();

