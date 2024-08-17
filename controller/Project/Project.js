import { pool } from "../../config/mysqlConfig.js";
import { v4 as uuidv4 } from "uuid";
import { INSERT_PROJECT, INSERT_USER_PROJECT } from "../../Query/project.js";

const addProject = async (_, { name, description }, context) => {
  let connection;
  try {
    console.log("Context User UUID", context?.uuid);
    connection = await pool.getConnection();
    const idProject = uuidv4();
    await connection.beginTransaction();

    const [result] = await connection.query(INSERT_PROJECT, [
      idProject,
      name,
      description,
    ]);

    const idCreated = idProject;

    await connection.query(INSERT_USER_PROJECT, [
      context?.uuid,
      idCreated,
      "ROLE_WRITE",
      true,
    ]);

    await connection.commit();

    return {
      idProject: idCreated,
      name,
      description,
    };
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error adding project: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { addProject };
