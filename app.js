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
    console.log("Guardando:", url);

    const res = await fetch("/api/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    console.log("Respuesta API:", data);

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

let isAdmin = false;
const ADMIN_PASSWORD = "1234"; // 🔐 cámbiala

// 👀 activar modo admin con tecla secreta
document.addEventListener("keydown", (e) => {
  if (e.key === "A" && e.shiftKey) {
    const pass = prompt("Contraseña admin:");

    if (pass === ADMIN_PASSWORD) {
      isAdmin = true;
      showAdminButton();
    } else {
      alert("Contraseña incorrecta");
    }
  }
});

// 🔥 mostrar botón
function showAdminButton() {
  const btn = document.createElement("button");
  btn.innerText = "🗑️ Limpiar fotos";
  btn.className = "btn-clear";
  btn.onclick = clearGallery;

  document.body.appendChild(btn);
}

// 🧨 borrar todo
async function clearGallery() {
  const confirmDelete = confirm("¿Seguro que quieres borrar TODAS las fotos?");
  if (!confirmDelete) return;

  await fetch("/api/images", {
    method: "DELETE"
  });

  document.getElementById("gallery").innerHTML = "";
}
