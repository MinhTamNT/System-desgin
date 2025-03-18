import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../../helper/mail.js";
import { createNotification } from "../Notification/Notification.js";
import { ExecuteStore } from "../../config/mysqlConfig.js";
import { get } from "http";

const InivitationUser = async (
  _,
  { email_content, projectId, userInvited },
  context
) => {
  try {
    const idNotify = uuidv4();
    console.log("InivitationUser", email_content, projectId, userInvited);
    await createNotification({
      idNotify,
      message: email_content,
      userTaker: userInvited,
      userRequest: context?.uuid,
      type: "INVITED",
    });
    const newInvitation = await ExecuteStore("Invitation_CreateInvitation", [
      projectId,
      email_content,
      userInvited,
      context?.uuid,
      idNotify,
    ]);
    const data = newInvitation[0][0];
    const redis = getRedis();
    await redis.set(`invitation:${data.idInvitation}`, JSON.stringify(data) , "EX", 3600);
    console.log(`Cached invitation ${idNotify} in Redis`);

    await sendEmail(
      data.EmailUser,
      `Invite to ${data.ProjectName}`,
      "text",
      `You have been invited to join the project ${data.nameProject}`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

const updateInivitation = async (
  _,
  { invitation_idInvitation, status },
  context
) => {
  try {
    console.log("updateInivitation", invitation_idInvitation, status);
    const result = await ExecuteStore("Invitation_UpdateInvitation", [
      invitation_idInvitation,
      context?.uuid,
      status,
    ]);
    const data = result[0][0];
    console.log("updateInivitation", data);
    const type = status === "ACCEPTED" ? "ACCEPTED" : "REJECTED";
    await createNotification({
      idNotify: data.idNotify,
      message: data.message,
      userTaker: data.UserRequsted,
      userRequest: context?.uuid,
      type: type,
    });
    return data[0];
  } catch (error) {
    console.log(error);
  }
};

export { InivitationUser, updateInivitation };
