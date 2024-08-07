import { pool } from "../config/mysqlConfig.js";
import {
  INSERT_AUTHENTICATE,
  INSERT_USER,
  SELECT_AUTHENTICATE_BY_USER_ID,
} from "../Query/user.js";

export const resolvers = {
  Query: {},
  Mutation: {
    addUser: async (_, { username, profilePicture, roleId }) => {
      let connection;
      try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // Tạo người dùng mới
        const [result] = await connection.query(INSERT_USER, [
          username,
          profilePicture,
          roleId,
        ]);

        const newUserId = result.insertId;

        console.log(newUserId);
        
        await connection.query(INSERT_AUTHENTICATE, [
          "LOCAL",
          newUserId,
          newUserId,
        ]);

        await connection.commit();

        connection.release();

        return {
          idUser: newUserId,
          username,
          profilePicture,
          roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } catch (error) {
        if (connection) await connection.rollback();
        throw new Error("Error adding user: " + error.message);
      }
    },
  },
};
