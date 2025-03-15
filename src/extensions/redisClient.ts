import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // Or your custom config

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
}