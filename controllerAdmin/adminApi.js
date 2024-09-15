import { pool } from "../config/mysqlConfig.js";

const getAllUser = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM user");
    return rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const deleteUserById = async (idUser) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "DELETE FROM user WHERE idUser = ?",
      [idUser]
    );
    return result;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export { getAllUser, deleteUserById };
