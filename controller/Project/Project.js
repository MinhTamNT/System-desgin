import { pool } from "../../config/mysqlConfig.js";
import { v4 as uuidv4 } from "uuid";
import {
  INSERT_PROJECT,
  INSERT_USER_PROJECT,
  GET_PROJECT_BY_ID,
  GET_PROJECT_TEAM,
} from "../../Query/project.js";

const addProject = async (_, { name, description }, context) => {
  let connection;
  try {
    console.log(context?.uuid);
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

const getUserProjects = async (_, __, context) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [projects] = await connection.query(GET_PROJECT_BY_ID, [
      context?.uuid,
    ]);
    return projects.map((project) => ({
      ...project,
      is_host_user: Boolean(project.is_host_user),
    }));
  } catch (error) {
    throw new Error("Error fetching user projects: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

const getProjectTeams = async (parent, args, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [res] = await connection.query(GET_PROJECT_TEAM, [context?.uuid]);
    return projects.map((project) => ({
      ...project,
      is_host_user: Boolean(project.is_host_user),
    }));
  } catch (error) {
    throw new Error("Error fetching user projects: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { addProject, getUserProjects, getProjectTeams };
