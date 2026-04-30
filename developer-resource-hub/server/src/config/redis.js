import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis Caching connected");
  } catch (err) {
    console.error("Redis connection error:", err);
    // Don't throw here, allow app to run without cache if needed
  }
}

export default redisClient;
