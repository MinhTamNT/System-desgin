import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import {
  DELETE_PROJECT_BY_ID,
  GET_PROJECT_TEAM,
  UPDATE_USER_ROLE_IN_PROJECT,
} from "../../Query/project.js";
import { liveblocks } from "../../server.mjs";
import { createNotification } from "../Notification/Notification.js";
const addProject = async (_, { name, description }, context) => {
  try {
    const result = await ExecuteStore("Project_CreateProject", [
      name,
      description,
      null,
      context?.uuid,
    ]);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const getUserProjects = async (
  parent,
  { pageIndex, pageSize, nameProject },
  context
) => {
  try {
    const result = await ExecuteStore("UserProject_LoadProject", [
      nameProject,
      pageIndex,
      pageSize,
      context?.uuid,
    ]);

    console.log("Raw result:", result[0]);

    const projects = Array.isArray(result[0])
      ? result[0].map((project) => ({
          idProject: project.project_idProject || project.idProject,
          name: project.projectName || project.name,
          user_idUser: project.user_idUser,
          access: project.access,
          is_host_user: project.is_host_user?.data?.[0] === 1,
          lastAccessed: project.lastAccessed,
          accessCount: project.accessCount,
        }))
      : [];

    const totalRow = result[0]?.[0]?.TOTALROW || 0;

    const response = {
      projects: projects,
      pageInfo: {
        TOTALROW: totalRow,
      },
    };

    return response;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Error fetching user projects: " + error.message);
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
  try {
    const res = await ExecuteStore("Project_UpdateProjectAccess", [
      projectId,
      context?.uuid,
    ]);
    return res;
  } catch (error) {
    console.log(error);
  }
};

const getProjectMemember = async (parent, { projectId }, context) => {
  try {
    const res = await ExecuteStore("Project_GetMember", [projectId]);
    const projects = res[0]?.map((row) => ({
      ...row,
      access: row.access,
      is_host_user: row.is_host_user == 1 ? true : false,
      projectName: row.projectName,
      User: [
        {
          idUser: row.idUser,
          name: row.name,
          profilePicture: row.profilePicture,
        },
      ],
    }));
    return projects;
  } catch (error) {
    console.log(error);
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
  getProjectMemember,
  updateRoleProjects,
  removeUserFromProject,
};
