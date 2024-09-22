import { v4 as uuidv4 } from "uuid";
import { pool } from "../../config/mysqlConfig.js";
import {
  DELETE_PROJECT_BY_ID,
  GET_MEMBER_IN_PROJECT,
  GET_PROJECT_BY_ID,
  GET_PROJECT_TEAM,
  GET_RECENT_PROJECT,
  INSERT_PROJECT,
  INSERT_USER_PROJECT,
  USER_HAS_PROJECT,
} from "../../Query/project.js";
import { liveblocks } from "../../server.mjs";
import { logActivity } from "../../helper/activity.js";

const addProject = async (_, { name, description }, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const idProject = uuidv4();
    await connection.beginTransaction();

    await connection.query(INSERT_PROJECT, [idProject, name, description]);

    const idCreated = idProject;

    await connection.query(INSERT_USER_PROJECT, [
      context?.uuid,
      idCreated,
      "ROLE_WRITE",
      true,
    ]);

    await connection.commit();
    await logActivity(
      "CREATE_PROJECT",
      `Created project: ${name}`,
      idCreated,
      context?.uuid
    );
    // await liveblocks.createRoom(idCreated);
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

const getUserProjects = async (parent, args, context) => {
  console.log(context?.uuid);
  let connection;
  try {
    connection = await pool.getConnection();

    const [projects] = await connection.query(GET_PROJECT_BY_ID, [
      context?.uuid,
    ]);
    console.log(projects);
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

const deletedProject = async (_, { projectId }, context) => {
  let connection;
  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [result] = await connection.query(DELETE_PROJECT_BY_ID, [
      projectId,
      context?.uuid,
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return {
        message:
          "Project not found or you are not authorized to delete this project.",
      };
    }
    await connection.commit();

    await liveblocks.deleteRoom(projectId);

    return { message: "Project deleted successfully." };
  } catch (error) {
    console.error("Error deleting project:", error);

    if (connection) await connection.rollback();

    return { message: "Error deleting project." };
  } finally {
    if (connection) connection.release();
  }
};

const updateUserProjectAccess = async (parent, { projectId }, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [res] = await pool.query(USER_HAS_PROJECT, [
      context?.uuid,
      projectId,
    ]);
    connection.commit();
    return res;
  } catch (error) {
    connection.rollback();
    console.log(error);
  } finally {
    if (connection) connection.release;
  }
};

const getRecentProjectsWithAccess = async (parent, args, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [res] = await connection.query(GET_RECENT_PROJECT, [context?.uuid]);

    const projects = res.map((row) => ({
      ...row,
      access: Boolean(row?.access),
      is_host_user: Boolean(row?.is_host_user),
      projectName: row.projectName,
    }));

    console.log(projects);

    return projects;
  } catch (error) {
    if (connection) await connection.rollback(); // rollback nếu có lỗi
    console.log(error);
    throw new Error("Error fetching recent projects");
  } finally {
    if (connection) connection.release(); // Gọi phương thức release
  }
};

const getProjectMemember = async (parent, { projectId }, context) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [res] = await pool.query(GET_MEMBER_IN_PROJECT, [projectId]);
    const projects = res.map((row) => ({
      ...row,
      access: Boolean(row?.access),
      is_host_user: row.is_host_user.toString() === "\x00" ? false : true , // Convert buffer to boolean
      projectName: row.projectName,
      User: [
        {
          idUser: row.idUser,
          name: row.name,
          profilePicture: row.profilePicture,
        },
      ],
    }));
    console.log(projects);
    connection.commit();
    return projects;
  } catch (error) {
    connection.rollback();
    console.log(error);
  } finally {
    if (connection) connection.release;
  }
};

export {
  addProject,
  deletedProject,
  getProjectTeams,
  getUserProjects,
  updateUserProjectAccess,
  getRecentProjectsWithAccess,
  getProjectMemember,
};
