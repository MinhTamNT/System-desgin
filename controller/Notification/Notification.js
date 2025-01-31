import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import { pubsub } from "../../resolvers/resolvers.js";

const createNotification = async ({
  idNotify,
  message,
  userTaker,
  userRequest,
  type,
}) => {
  try {
    const res = await ExecuteStore("Notification_InsertNewNotify", [
      idNotify,
      message,
      userTaker,
      userRequest,
      type,
    ]);
    const data = res[0][0];
    pubsub.publish("NOTIFICATION_CREATED", {
      notificationCreated: {
        idNotification: idNotify,
        message: message,
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

const getNotificationsByUserId = async (
  parent,
  { pageIndex, pageSize },
  context
) => {
  try {
    const notifications = await ExecuteStore(
      "Notification_GetUserNotification",
      [context?.uuid, pageIndex, pageSize]
    );
    const dataNotify = Array.isArray(notifications[0])
      ? notifications[0].map((notification) => (

        {
          idNotification: notification.idNotification,
          message: notification.message,
          is_read: Boolean(notification.is_read),
          createdAt: notification.createdAt,
          userTaker: notification.User_idUser_taker,
          userRequest: notification.User_idUser_requested,
          type: notification.type,
          invitation_idInvitation: notification.idInvitation,
        }))
      : [];

    const totalRow = notifications[0]?.[0]?.TOTALROW || 0;
    const response = {
      notifications: dataNotify,
      pageInfo: {
        TOTALROW: totalRow,
      },
    };

    return response;
  } catch (error) {
    throw new Error("Error getting notifications: " + error.message);
  }
};

export { createNotification, getNotificationsByUserId };
