import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = "images";

export default async function handler(req, res) {

  if (req.method === "GET") {
    const images = await redis.lrange(KEY, 0, -1);
    return res.status(200).json(images || []);
  }

  if (req.method === "POST") {
    const { url } = req.body;

    if (url) {
      await redis.lpush(KEY, url);
    }

    return res.status(200).json({ success: true });
  }

}

if (url) {
  const exists = await redis.lrange(KEY, 0, -1);

  if (!exists.includes(url)) {
    await redis.lpush(KEY, url);
  }
}

await redis.ltrim(KEY, 0, 199); // máximo 200 fotos
