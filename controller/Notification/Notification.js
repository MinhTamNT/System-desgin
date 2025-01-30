import { pool } from "../../config/mysqlConfig.js";
import {
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
  try {
    const res = await ExecuteStore("Notification_InsertNewNotify", [
      message,
      userTaker,
      userRequest,
      type,
    ]);
    const data = res[0][0];
    pubsub.publish("NOTIFICATION_CREATED", {
      notificationCreated: {
        idNotification: data.idNotify,
        message: data.message,
        is_read: data.isRead,
        createdAt: data.createdAt,
        userTaker: data.User_idUser_taker,
        userRequest: data.User_idUser_requested,
        type: data.type,
      },
    });

    return {
      idNotification: data.idNotify,
      message: data.message,
      is_read: data.isRead,
      createdAt: data.createdAt,
      userTaker: data.User_idUser_taker,
      userRequest: data.User_idUser_requested,
      type: data.type,
    };
  } catch (error) {
    console.log(error);
    return {
      retCode: -1,
      retMessage: error.message || "Error creating notification",
    };
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
