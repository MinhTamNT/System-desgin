import { pool } from "../../config/mysqlConfig.js";
import { v4 as uuidv4 } from "uuid";
import {
  CREATED_NOTIFICATION,
  GET_NOTIFY_BY_USERID,
} from "../../Query/notify.js";
import { pubsub } from "../../resolvers/resolvers.js";

const createNotification = async ({
  message,
  userTaker,
  userRequest,
  invitation_idInvitation,
  type,
}) => {
  let connection;
  try {
    if (!userRequest || !userTaker) {
      throw new Error("Missing required parameters");
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const idNotify = uuidv4();
    const isRead = false;

    await connection.query(CREATED_NOTIFICATION, [
      idNotify,
      message,
      isRead,
      userTaker,
      userRequest,
      type,
    ]);

    await connection.commit();

    pubsub.publish("NOTIFICATION_CREATED", {
      notificationCreated: {
        idNotification: idNotify,
        message,
        is_read: isRead,
        createdAt: new Date().toISOString(),
        userTaker: userTaker,
        userRequest: userRequest,
        invitation_idInvitation,
        type,
      },
    });

    return {
      idNotification: idNotify,
      message,
      is_read: isRead,
      createdAt: new Date().toISOString(),
      userTaker,
      userRequest,
      type,
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
      is_read: Boolean(notification.is_read),
      invitation_idInvitation: notification.idInvitation,
    }));
    console.log("notifications by userId", notifications);
    return notifications;
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error getting notifications: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { createNotification, getNotificationsByUserId };
