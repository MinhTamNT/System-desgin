import { pool } from "../../config/mysqlConfig.js";
import User from "../../model/User.js";
import {
  INSERT_USER,
  CHECK_USER_EXISTS,
  SEARCH_USER_NAME,
} from "../../Query/user.js";
const checkUserExists = async (name) => {
  const [rows] = await pool.query(CHECK_USER_EXISTS, [name]);
  return rows.length > 0;
};

const addNewUser = async (
  _,
  { idUser, name, profilePicture, roleId, email }
) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Check if the user already exists in MongoDB
    const existingUser = await User.findOne({ uuid: idUser });
    if (!existingUser) {
      // Create a new user if not found
      const newUser = new User({
        name,
        profilePicture,
        uuid: idUser,
      });
      await newUser.save();
    }

    const userExistsInSQL = await checkUserExists(name);
    if (userExistsInSQL) {
      return;
    }

    await connection.beginTransaction();

    await connection.query(INSERT_USER, [
      idUser,
      name,
      profilePicture,
      roleId,
      email,
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
    // Release the connection
    if (connection) connection.release();
  }
};

const SearchUserByName = async (_, { searchText }) => {
  let connect;
  try {
    connect = await pool.getConnection();
    await connect.beginTransaction();
    const [resut] = await connect.query(SEARCH_USER_NAME, [`%${searchText}%`]);
    return resut;
  } catch (error) {
    console.error("Error searching user:", error);
    throw error;
  } finally {
    if (connect) connect.release();
  }
};

export { addNewUser, SearchUserByName };
