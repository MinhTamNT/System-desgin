import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/mysqlConfig.js";
import { CREATE_ACTIVYTY } from "../Query/activityLogs.js";
export const logActivity = async (action, details, projectId, userId) => {
  let connection;
  const idactivityLogSchema = uuidv4();
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.query(CREATE_ACTIVYTY, [
      idactivityLogSchema,
      action,
      details,
      projectId,
      userId,
    ]);
    await connection.commit();
    console.log("Activity logged successfully");
  } catch (error) {
    await connection.rollback();
    console.error("Error logging activity:", error);
  } finally {
    if (connection) connection.release();
  }
};
