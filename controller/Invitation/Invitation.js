import { v4 as uuidv4 } from "uuid";
import { pool } from "../../config/mysqlConfig.js";
import {
  ADD_INIVITATION,
  GET_INIVITATION_BY_ID,
  UPDATE_INIVITATION,
} from "../../Query/invitation.js";
import { GET_PROJECT_ID, INSERT_USER_PROJECT } from "../../Query/project.js";
import { sendEmail } from "../../helper/mail.js";
import { GET_USER_BY_ID } from "../../Query/user.js";
import { createNotification } from "../Notification/Notification.js";

const InivitationUser = async (
  _,
  { email_content, projectId, userInvited },
  context
) => {
  let connection;
  try {
    if (!context?.uuid || !email_content || !projectId || !userInvited) {
      throw new Error("Missing required parameters");
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [resultProject] = await connection.query(GET_PROJECT_ID, [projectId]);
    if (resultProject.length === 0) {
      throw new Error("Project not found");
    }

    const idInivitation = uuidv4();

    const newNotification = await createNotification({
      message: `You have been invited to join the project ${resultProject[0].name}`,
      userTaker: userInvited,
      invitation_idInvitation: idInivitation,
      userRequest: context?.uuid,
      type: "INVITED",
    });

    const [result] = await connection.query(ADD_INIVITATION, [
      idInivitation,
      email_content,
      "SENT",
      projectId,
      context?.uuid,
      userInvited,
      newNotification?.idNotification,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Invitation not added");
    }

    await connection.commit();

    // Fetch user details
    const [getUser] = await connection.query(GET_USER_BY_ID, [userInvited]);
    if (getUser.length === 0) {
      throw new Error("User not found");
    }

    sendEmail(
      getUser[0].email,
      `Invite to ${resultProject[0].name}`,
      "text",
      `You have been invited to join the project ${resultProject[0].name}`
    );

    return result[0];
  } catch (error) {
    // Rollback in case of error
    if (connection) await connection.rollback();
    console.error("Error inviting user:", error.message);
    throw new Error("Error inviting user: " + error.message);
  } finally {
    // Release the connection
    if (connection) connection.release();
  }
};

const updateInivitation = async (
  _,
  { invitation_idInvitation, status },
  context
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.query(UPDATE_INIVITATION, [
      status,
      invitation_idInvitation,
    ]);

    await connection.commit();
    const [getInivite] = await connection.query(GET_INIVITATION_BY_ID, [
      invitation_idInvitation,
    ]);

    const [userId] = await connection.query(GET_USER_BY_ID, [
      getInivite[0].User_idUser_invited,
    ]);

    if (status === "ACCEPTED") {
      await connection.query(INSERT_USER_PROJECT, [
        getInivite[0].User_idUser_invited,
        getInivite[0].Project_idProject,
        "ROLE_WRITE",
        false,
      ]);

      await createNotification({
        message: `${userId[0].name} just ${status} your project `,
        userRequest: context?.uuid,
        invitation_idInvitation,
        userTaker: getInivite[0].User_idUser_requested,
        type: "STANDARD",
      });
    } else if (status === "REJECT") {
      await createNotification({
        message: `${userId[0].name} just ${status} your project `,
        userRequest: context?.uuid,
        invitation_idInvitation,
        userTaker: userTaker,
        type: "STANDARD",
      });
    }
    return result;
  } catch (error) {
    console.log(error);
  }
};

export { InivitationUser, updateInivitation };
