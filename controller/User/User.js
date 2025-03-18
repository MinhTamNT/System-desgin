import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import { getConnections, getRedis } from "../../config/redis.js";
import User from "../../model/User.js";

const REDIS_USER_KEY = (userId) => `user:status:${userId}`;
const REDIS_ONLINE_USERS = "online:users";
const CACHE_DURATION = 60;

const addNewUser = async (
  args,
  { idUser, name, profilePicture, email, expireAt, deviceId },
  context
) => {
  let redis;
  try {
    redis = await getRedis();
    if (!redis) {
      throw new Error("Redis client not initialized");
    }

    const existingUser = await User.findOne({ uuid: idUser });
    if (!existingUser) {
      const newUser = new User({
        name,
        profilePicture,
        uuid: context?.uuid,
      });
      await newUser.save();
    }

    const result = await ExecuteStore("UserProfile_AddUser_WithStatus", [
      context?.uuid,
      profilePicture,
      context?.token,
      expireAt,
      name,
      email,
      deviceId,
    ]);

    if (result && context?.uuid) {
      const userData = JSON.stringify({
        userId: context.uuid,
        name,
        profilePicture,
        email,
        deviceId,
        lastSeen: new Date().toISOString(),
        isOnline: true,
      });

      const pipeline = redis.pipeline();

      pipeline.setex(REDIS_USER_KEY(context.uuid), CACHE_DURATION, userData);

      pipeline.sadd(REDIS_ONLINE_USERS, context.uuid);

      await pipeline.exec();
    }

    if (result && result[0] && result[0][0].idUser) {
      return [
        {
          idUser: result[1][0].idUser,
          profilePicture: result[1][0].profilePicture,
          email: result[1][0].email,
          deviceId: deviceId,
          status: "online",
        },
      ];
    }
  } catch (error) {
    console.error("Error in addNewUser:", error);

    if (redis && context?.uuid) {
      try {
        const pipeline = redis.pipeline();
        pipeline.del(REDIS_USER_KEY(context.uuid));
        pipeline.srem(REDIS_ONLINE_USERS, context.uuid);
        await pipeline.exec().catch(console.error);
      } catch (redisError) {
        console.error("Redis cleanup error:", redisError);
      }
    }

    return [
      {
        retCode: -1,
        retMessage: error.message || "Error adding user",
      },
    ];
  }
};

const SearchUserByName = async (_, { searchText }) => {
  try {
    const result = await ExecuteStore("User_SearchUser", [searchText]);
    console.log(result);
    if (result && result[0] && result[0][0].idUser) {
      const user = result[0][0];
      const checkOnline = await getConnections(user.idUser);
      const isOnLine = checkOnline.includes(user.idUser);
      return [
        {
          __typename: "User",
          idUser: user.idUser,
          status: isOnLine,
          profilePicture: user.profilePicture,
          name: user.name,
        },
      ];
    } else {
      const error = result[0][0];
      return [
        {
          __typename: "ProccessObj",
          RetCode: error.retCode,
          RetMessgae: error.retMessage,
        },
      ];
    }
  } catch (error) {
    console.error("Error searching user:", error);
    return [
      {
        __typename: "ProccessObj",
        retCode: -5000,
        retMessage: "Internal server error",
      },
    ];
  }
};

const updateUserStatus = async (_, { userId, idLogon, deviceId }) => {
  try {
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

const checkUserOnline = async (userId) => {
  const redis = await getRedis();
  try {
    const userData = await redis.get(REDIS_USER_KEY(userId));
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error checking user online status:", error);
    return null;
  }
};

// Thêm hàm lấy danh sách users online
const getOnlineUsers = async () => {
  const redis = await getRedis();
  try {
    const userIds = await redis.smembers(REDIS_ONLINE_USERS);
    const userStatuses = await Promise.all(
      userIds.map((id) => redis.get(REDIS_USER_KEY(id)))
    );
    return userStatuses
      .filter((status) => status !== null)
      .map((status) => JSON.parse(status));
  } catch (error) {
    console.error("Error getting online users:", error);
    return [];
  }
};

const checkRedisConnection = async () => {
  try {
    const redis = getRedis();

    await redis.set("test", "working");
    const testResult = await redis.get("test");
    await redis.del("test");

    console.log("Redis Test Result:", testResult);

    // Get all online users
    const onlineUsers = await redis.smembers(REDIS_ONLINE_USERS);
    console.log("Online Users:", onlineUsers);

    return true;
  } catch (error) {
    console.error("Redis Check Error:", error);
    return false;
  }
};

export {
  addNewUser,
  SearchUserByName,
  checkUserOnline,
  getOnlineUsers,
  checkRedisConnection,
};
