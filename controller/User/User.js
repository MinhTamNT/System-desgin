import { pool } from "../../config/mysqlConfig.js";
import { INSERT_USER, CHECK_USER_EXISTS } from "../../Query/user.js";
const checkUserExists = async (name) => {
  const [rows] = await pool.query(CHECK_USER_EXISTS, [name]);
  return rows.length > 0;
};

const addNewUser = async (_, { idUser, name, profilePicture, roleId }) => {
  let connection;
  try {
    connection = await pool.getConnection();

    if (await checkUserExists(name)) {
      return;
    }

    await connection.beginTransaction();
    const [result] = await connection.query(INSERT_USER, [
      idUser,
      name,
      profilePicture,
      roleId,
    ]);

    await connection.commit();

    return {
      name,
      profilePicture,
      roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error adding user: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { addNewUser };
