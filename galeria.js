const API_URL = "https://boda-daniela-jesus.vercel.app/api/images";

let images = [];
let currentIndex = 0;

async function loadAll() {
  const res = await fetch(API_URL + "?t=" + Date.now());
  images = await res.json();

  const gallery = document.getElementById("gallery");

  images.forEach((url, index) => {
    const img = document.createElement("img");
    img.src = url;
    img.onclick = () => openModal(index);
    gallery.appendChild(img);
  });
}

function openModal(index) {
  currentIndex = index;
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = images[index];
}

// 👉 navegación
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") currentIndex++;
  if (e.key === "ArrowLeft") currentIndex--;

  currentIndex = (currentIndex + images.length) % images.length;
  document.getElementById("modalImg").src = images[currentIndex];
});

// 👉 scroll top
document.getElementById("topBtn").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 👉 descarga protegida
document.getElementById("downloadBtn").onclick = async () => {
  const pass = prompt("Password:");
  if (pass !== "1234") return alert("No autorizado");

  images.forEach(url => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.click();
  });
};

loadAll();
