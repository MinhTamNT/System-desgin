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
  UPDATE_USER_ROLE_IN_PROJECT,
  USER_HAS_PROJECT,
} from "../../Query/project.js";
import { liveblocks } from "../../server.mjs";
import { logActivity } from "../../helper/activity.js";
import { createNotification } from "../Notification/Notification.js";

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
    await liveblocks.createRoom(idCreated, {
      defaultAccesses: ["room:write"],
    });
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
      is_host_user: project.is_host_user.toString() === "\x00" ? false : true,
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
      is_host_user: row.is_host_user.toString() === "\x00" ? false : true,
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
      access: row.access.toString(),
      is_host_user: row.is_host_user.toString() === "\x00" ? false : true,
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

const updateRoleProjects = async (
  parent,
  { projectId, role, userId },
  context
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log(projectId, role, userId);
    const [res] = await connection.query(UPDATE_USER_ROLE_IN_PROJECT, [
      role === "VIEWER" ? "ROLE_READ" : "ROLE_WRITE",
      userId,
      projectId,
    ]);
    connection.commit();
    await createNotification({
      message: "You have been granted access to this project",
      userTaker: userId,
      invitation_idInvitation: "",
      userRequest: context?.uuid,
      type: "STANDARD",
    });
    return res;
  } catch (error) {
    connection.rollback();
    console.log(error);
  } finally {
    if (connection) connection.release;
  }
};

const removeUserFromProject = async (
  parent,
  { projectId, userId },
  context
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const currentUserId = context?.uuid;
    const [hostCheck] = await connection.query(
      "SELECT is_host_user FROM user_has_project WHERE user_idUser = ? AND project_idProject = ?",
      [currentUserId, projectId]
    );
    const isHostUser = hostCheck[0]?.is_host_user
      ? Boolean(hostCheck[0].is_host_user[0])
      : false;

    if (hostCheck.length === 0 || isHostUser !== true) {
      throw new Error(
        "You do not have permission to remove users from this project."
      );
    }

    const [res] = await connection.query(
      "DELETE FROM user_has_project WHERE user_idUser = ? AND project_idProject = ?",
      [userId, projectId]
    );

    await connection.commit();
    await createNotification({
      message: "You have been removed from this project",
      userTaker: userId,
      invitation_idInvitation: "",
      userRequest: context?.uuid,
      type: "DELETE",
    });
    return {
      message: "User has been removed from the project.",
      affectedRows: res.affectedRows,
    };
  } catch (error) {
    if (connection) await connection.rollback();
    console.log(error);
    throw new Error("An error occurred while removing the user.");
  } finally {
    if (connection) connection.release();
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
  updateRoleProjects,
  removeUserFromProject,
};
