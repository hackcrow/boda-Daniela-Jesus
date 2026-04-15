const API_URL = "https://TU-APP.vercel.app/api/images";

async function saveImage(url) {
  try {
    console.log("Guardando:", url);

    const res = await fetch(API_URL, {
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

async function loadImages() {
  try {
    const res = await fetch(API_URL);
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

  await fetch(API_URL, {
    method: "DELETE"
  });

  document.getElementById("gallery").innerHTML = "";
}
