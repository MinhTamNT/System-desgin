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
  invitation_idInvitation,
  userRequest,
  type,
}) => {
  let connection;
  try {
    if (!userRequest || !userTaker || !invitation_idInvitation) {
      throw new Error("Missing required parameters");
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const idNotify = uuidv4();
    const isRead = false;

    const [result] = await connection.query(CREATED_NOTIFICATION, [
      idNotify,
      message,
      isRead,
      invitation_idInvitation,
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
        invitation_idInvitation,
        userTaker,
        userRequest: userRequest,
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
    }));
    return notifications;
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error getting notifications: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { createNotification, getNotificationsByUserId };
