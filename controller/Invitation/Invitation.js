import { v4 as uuidv4 } from "uuid";
import { createNotification } from "../Notification/Notification.js";
import { ExecuteStore } from "../../config/mysqlConfig.js";
import { sendEmail } from "../../helper/mail.js";
const InivitationUser = async (
  _,
  { email_content, projectId, userInvited},
  context
) => {
  try {
    const idNotify = uuidv4();
    const idInvitation = uuidv4();
    let emailUser = "";
    console.log("InivitationUser", email_content, projectId, userInvited);
    const check = await createNotification({
      idNotify,
      message: email_content,
      userTaker: userInvited,
      userRequest: context?.uuid,
      type: "INVITED",
      invitation_idInvitation: idInvitation,
      projectId: projectId,
    });
    if(check){
      if(check.retCode < 0){
        return {
          RetCode: check.retCode,
          RetMessage: check.retMessage,
        }
      }
      else {
       const result = await ExecuteStore("Invitation_CreateInvitation", [
          projectId,
          email_content,
          userInvited,
          context?.uuid,
          idNotify,
          idInvitation,
      ]);
      console.log("userInvited", userInvited);
      const data = result[0][0];
      emailUser = data.retMessage;
      }
      await sendEmail(emailUser, "Invitation to join project", email_content, "You have been invited to join the project");
    }
    return {
      RetCode: 0,
      RetMessage: "Invitation sent successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      RetCode: -1,
      RetMessage: "Invitation sent failed",
    };
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
