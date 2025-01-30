import Redis from "ioredis";

let redisClient = null;

export const initRedis = async () => {
  try {
    if (!redisClient) {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          const delay = Math.min(times * 10, 2000);
          return delay;
        },
      });

      redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      redisClient.on("connect", () => {
        console.log("Redis Client Connected");
      });
    }
    return redisClient;
  } catch (error) {
    console.error("Redis initialization error:", error);
    throw new Error("Failed to initialize Redis client");
  }
};

export const getRedis = async () => {
  if (!redisClient) {
    await initRedis();
  }
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};
export function storeConnection(userId, connectionId) {
  redisClient.sadd("online:users", userId);
}

export function getConnections(userId) {
  return new Promise((resolve, reject) => {
    redisClient.smembers(`${userId}`, (err, connections) => {
      if (err) return reject(err);
      resolve(connections);
    });
  });
}

export function removeConnection(userId, connectionId) {
  redisClient.srem("online:users", userId);
  console.log(`Removed ${userId} from Redis`);
}
