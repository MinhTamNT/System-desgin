import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import { REUEST_JOIN_PROJECT } from "../../helper/mail.js";
import { GET_PROJECT_TEAM } from "../../Query/project.js";
import { liveblocks } from "../../server.mjs";
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
    liveblocks.prepareSession(context?.uuid, {
      projectInfo: {
        name: name,
        description: description,
      },
    });

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
          PublicProjectCount: project.PublicProjectCount,
          PrivateProjectCount: project.PrivateProjectCount,
          JoinedProjectsNotOwner: project.JoinedProjectsNotOwner,
          OwnedProjects: project.OwnedProjects,
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

const checkProject = async (parent, { projectId }, context) => {
  try {
    console.log("checkProject", projectId, context?.uuid);
    const res = await ExecuteStore("Project_CheckMember", [
      context?.uuid,
      projectId,
    ]);
    const data = res[0][0];
    console.log("checkProject", data);
    return {
      RetCode: data.retCode,
      RetMessage: data.retMessage,
    };
  } catch (error) {
    console.log(error);
  }
};

const sendProjectAccessRequestEmail = async (
  parent,
  { projectId, message, nameRequest, imageRequest, emailRequest },
  context
) => {
  try {
    const res = await ExecuteStore("Project_RequestJoin", [projectId]);
    const data = res[0][0];
    console.log("sendProjectAccessRequestEmail", data);

    const subject = "Request to join project";
    await REUEST_JOIN_PROJECT(
      data.email,
      subject,
      data.nameUserHost,
      { name: nameRequest, email: emailRequest, message: message },
      ""
    );
    console.log("user tanker", data.idUser);
    console.log("user request", context?.uuid);
    await createNotification({
      idNotify: uuidv4(),
      message: "You have been invited to join the project",
      userTaker: data.idUser,
      userRequest: context?.uuid,
      type: "STANDARD",
      projectId: projectId,
    });
    return {
      RetCode: 1,
      RetMessage: "Gửi thành công",
    };
  } catch (error) {
    console.log(error);
  }
};

const updateProjectVisibility = async (
  parent,
  { projectId, visibility },
  context
) => {
  try {
    const isPrivate = visibility === "private" ? true : false;
    const res = await ExecuteStore("Project_PublicProject", [
      projectId,
      isPrivate,
    ]);
    const data = res[0][0];
    console.log("updateProjectVisibility", data);
    return {
      RetCode: res[0][0].retCode,
      RetMessage: res[0][0].retMessage,
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
  checkProject,
  sendProjectAccessRequestEmail,
  updateProjectVisibility,
};
