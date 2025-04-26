import { v4 as uuidv4 } from "uuid";
import { createNotification } from "../Notification/Notification.js";
import { ExecuteStore } from "../../config/mysqlConfig.js";

const InivitationUser = async (
  _,
  { email_content, projectId, userInvited },
  context
) => {
  try {
    const idNotify = uuidv4();
    const idInvitation = uuidv4();
    console.log("InivitationUser", email_content, projectId, userInvited);
    await createNotification({
      idNotify,
      message: email_content,
      userTaker: userInvited,
      userRequest: context?.uuid,
      type: "INVITED",
      invitation_idInvitation: idInvitation,
      projectId: projectId,
    });

   await ExecuteStore("Invitation_CreateInvitation", [
      projectId,
      email_content,
      userInvited,
      context?.uuid,
      idNotify,
      idInvitation,
    ]);
    
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
   

    console.log("createNotification", data);
    
    const idNotify = uuidv4();
    await createNotification({
      idNotify,
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
