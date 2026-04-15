let images = [];

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(images);
  }

  if (req.method === "POST") {
    const { url } = req.body;

    if (url && !images.includes(url)) {
      images.unshift(url);
    }

    return res.status(200).json({ success: true });
  }
}
