import { pool } from "../../config/mysqlConfig.js";
import { v4 as uuidv4 } from "uuid";
import {
  CREATED_NOTIFICATION,
  GET_NOTIFY_BY_USERID,
} from "../../Query/notify.js";
import { pubsub } from "../../resolvers/resolvers.js";

const createNotfication = async (_, { message, userTaker }) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const idNotify = uuidv4();
    let isRead = false;
    const [result] = await connection.query(CREATED_NOTIFICATION, [
      idNotify,
      message,
      isRead,
      userTaker,
    ]);
    await connection.commit();

    // Make sure to publish the correct data
    pubsub.publish("NOTIFICATION_CREATED", {
      notificationCreated: {
        idNotification: idNotify,
        message,
        is_read: isRead,
        createdAt: new Date().toISOString(),
        userTaker,
      },
    });

    return {
      idNotification: idNotify,
      message,
      is_read: isRead,
      createdAt: new Date().toISOString(),
      userTaker,
    };
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error adding notification: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

const getNotificationsByUserId = async (parent, args, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.query(GET_NOTIFY_BY_USERID, [
      context?.uuid,
    ]);

    const notifications = result.map((notification) => ({
      ...notification,
      is_read: notification.is_read ? Boolean(notification.is_read) : false,
    }));

    await connection.commit();
    return notifications;
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error getting notifications: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { createNotfication, getNotificationsByUserId };
