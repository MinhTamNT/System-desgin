import { pool } from "../../config/mysqlConfig.js";
import { v4 as uuidv4 } from "uuid";
import { ADD_INIVITATION } from "../../Query/invitation.js";
import { createNotification } from "../controller/Notification/Notification.js";
import { sendEmail } from "../../helper/mail.js";

const InivitationUser = async (
  _,
  { email_content, projectId, userInvited },
  context
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const idInivitation = uuidv4();
    await connection.beginTransaction();

    const [result] = await connection.query(ADD_INIVITATION, [
      idInivitation,
      email_content,
      "SENT",
      projectId,
      context?.uuid,
      userInvited,
    ]);

    await createNotification(_, {
      message: `You have been invited to join the project ${projectId}`,
      userTaker: userInvited,
    });

    await connection.commit();

    return result;
  } catch (error) {
    if (connection) await connection.rollback();
    throw new Error("Error inviting user: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export { InivitationUser };
