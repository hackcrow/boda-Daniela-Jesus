import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = "images";

export default async function handler(req, res) {
  try {

    // 📥 GET (obtener todas)
    if (req.method === "GET") {
      const images = await redis.lrange(KEY, 0, -1);
      return res.status(200).json(images || []);
    }

    // 📤 POST (guardar)
    if (req.method === "POST") {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "No URL" });
      }

      await redis.lpush(KEY, url);

      return res.status(200).json({ success: true });
    }

    // 🗑️ DELETE (borrar todo)
    if (req.method === "DELETE") {
      await redis.del(KEY);
      return res.status(200).json({ success: true });
    }

    return res.status(405).end();

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
