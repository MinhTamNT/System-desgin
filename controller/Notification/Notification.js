import { pool } from "../../config/mysqlConfig.js";
import { v4 as uuidv4 } from "uuid";
import { CREATED_NOTIFICATION } from "../../Query/notify.js";
import { pubsub } from "../../resolvers/resolvers.js"; // Đảm bảo đường dẫn đúng

const createNotfication = async (_, { message, userTaker }) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const idNotify = uuidv4();
    await connection.beginTransaction();
    let isRead = false;
    const [result] = await connection.query(CREATED_NOTIFICATION, [
      idNotify,
      message,
      isRead,
      userTaker,
    ]);
    await connection.commit();

    pubsub.publish("NOTIFICATION_CREATED", { notificationCreated: result });

    return result;
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error adding notification: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { createNotfication };
