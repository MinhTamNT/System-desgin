import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import { DELETE_PROJECT_BY_ID, GET_PROJECT_TEAM } from "../../Query/project.js";
import { InivitationUser } from "../Invitation/Invitation.js";
import { createNotification } from "../Notification/Notification.js";
import { v4 as uuidv4 } from "uuid";
const addProject = async (_, { name, description, listInvite }, context) => {
  try {
    console.info("addProject", name, description, listInvite);
    const projectID = uuidv4();
    console.log("projectID", projectID);
    const result = await ExecuteStore("Project_CreateProject", [
      projectID,
      name,
      description,
      context?.uuid,
    ]);
    if (listInvite !== null) {
      const listInviteTmp = listInvite.split(",");
      listInviteTmp.map(async (user) => {
        await InivitationUser(
          null,
          {
            email_content: `You have been invited to join the project ${name}`,
            projectId: projectID,
            userInvited: user,
          },
          context
        );
      });
    }
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
  try {
    const res = await ExecuteStore("Project_DeleteProject", [
      projectId,
      context?.uuid,
    ]);
    return {
      RetCode: res[0][0].retCode,
      RetMessgae: res[0][0].retMessage,
    };
  } catch (error) {
    console.log(error);
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
  try {
    console.log("role", role, userId, projectId);
    const res = await ExecuteStore("Project_UpdateRoleMember", [
      role === "VIEWER" ? "ROLE_READ" : "ROLE_WRITE",
      userId,
      projectId,
    ]);
    await createNotification({
      idNotify: uuidv4(),
      message: "You have been granted access to this project",
      userTaker: userId,
      invitation_idInvitation: "",
      userRequest: context?.uuid,
      type: "STANDARD",
    });
    const data = res[0][0];
    console.log("data", data);
    return {
      RetCode: data.retCode,
      RetMessgae: data.retMessage,
    };
  } catch (error) {
    console.log(error);
  }
};

const removeUserFromProject = async (
  parent,
  { projectId, userId },
  context
) => {
  try {
    const res = await ExecuteStore("Project_RemoveMemmberInProject", [
      context?.uuid,
      userId,
      projectId,
    ]);
    const data = res[0][0];
    await createNotification({
      idNotify: uuidv4(),
      message: "You have been removed from this project",
      userTaker: userId,
      userRequest: context?.uuid,
      type: "STANDARD",
    });
    return {
      RetCode: data.retCode,
      RetMessage: data.retMessage,
    };
  } catch (error) {
    console.log(error);
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
