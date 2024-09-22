import { pool } from "../../config/mysqlConfig.js";
import { ActivateUser } from "../../Query/activityLogs.js";

const getActivatyUser = async (parent, agrs, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [resutl] = await connection.query(ActivateUser, [context?.uuid]);
    console.log(resutl);
    return resutl;
  } catch (error) {
    connection.rollback();
    console.log(error);
  } finally {
    if (connection) connection.release();
  }
};
export { getActivatyUser };
