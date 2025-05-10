import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import { pubsub } from "../../resolvers/resolvers.js";

const createNotification = async ({
  idNotify,
  message,
  userTaker,
  userRequest,
  type,
  invitation_idInvitation,
  projectId,
}) => {
  try {
    const res = await ExecuteStore("Notification_InsertNewNotify", [
      idNotify,
      message,
      userTaker,
      userRequest,
      type,
      projectId
    ]);
    const data = res[0][0];
   

    console.log("createNotification", data);
    if(data?.retCode){
      return {
        retCode: data.retCode,
        retMessage: data.retMessage || "Error creating notification",
      };
    }

    pubsub.publish("NOTIFICATION_CREATED", {
      notificationCreated: {
        idNotification: idNotify,
        message: message,
        is_read: data.isRead,
        createdAt: data.createdAt,
        userTaker: data.User_idUser_receiver,
        userRequest: data.User_idUser_sender,
        type: data.type,
        invitation_idInvitation: invitation_idInvitation,
      },
    });

    return {
      idNotification: data.idNotify,
      message: data.message,
      is_read: data.isRead,
      createdAt: data.createdAt,
      userTaker: data.User_idUser_receiver,
      userRequest: data.User_idUser_requested,
      type: data.type,
      invitation_idInvitation: invitation_idInvitation,
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
          userTaker: notification.User_idUser_receiver,
          userRequest: notification.User_idUser_sender,
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
