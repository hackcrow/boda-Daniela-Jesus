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
