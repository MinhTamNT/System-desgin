import { PubSub } from "graphql-subscriptions";
import {
  InivitationUser,
  updateInivitation,
} from "../controller/Invitation/Invitation.js";
import { getNotificationsByUserId } from "../controller/Notification/Notification.js";
import {
  addProject,
  deletedProject,
  getProjectMemember,
  getProjectTeams,
  getUserProjects,
  removeUserFromProject,
  updateRoleProjects,
  updateUserProjectAccess,
} from "../controller/Project/Project.js";
import { addNewUser, SearchUserByName } from "../controller/User/User.js";
import { ExecuteStore } from "../config/mysqlConfig.js";
import {
  createConversation,
  getConversation,
} from "../controller/Conversation/Conversation.js";
import User from "../model/User.js";
import {
  createMessage,
  getMessageConversationId,
} from "../controller/Message/Message.js";
import { getActivatyUser } from "../controller/Activaty/Activaty.js";
export const pubsub = new PubSub();
const NOTIFICATION_CREATED = "NOTIFICATION_CREATED";
const MESSAGE_CREATED = "MESSAGE_CREATED";
export const resolvers = {
  Query: {
    getUserProjects: getUserProjects,
    searchUserByName: SearchUserByName,
    getNotificationsByUserId: getNotificationsByUserId,
    getProjectTeams: getProjectTeams,
    getConversation: getConversation,
    getMessageConversationId: getMessageConversationId,
    getUserActivityLog: getActivatyUser,
    getMememberInProject: getProjectMemember,
  },
  Notification: {
    userRequest: async (parent) => {
      try {
        const result = await ExecuteStore("User_GetUserByID", [
          parent.userRequest,
        ]);
        console.log("result User", result);
        return result[0];
      } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch user");
      }
    },
  },
  Conversation: {
    members: async (parent) => {
      try {
        const members = await User.find({ uuid: { $in: parent.members } });
        return members;
      } catch (error) {
        console.error("Failed to fetch conversation members:", error);
        throw new Error("Failed to fetch conversation members");
      }
    },
  },

  Message: {
    sender: async (parent) => {
      const sender = await User.findOne({ uuid: parent.sender });
      return sender;
    },
  },
  AddUserResponse: {
    __resolveType(value) {
      console.log("Resolved value:", value);

      if (value && value.RetCode !== undefined) {
        console.log("Resolved to ProccessObj: ", value.RetCode);
        return "ProccessObj"; // Return the type name as a string
      }
      if (value && value.idUser) {
        console.log("Resolved to User: ", value.idUser);
        return "User";
      }
      console.log("Unable to determine type for value:", value);
      return null;
    },
  },

  Mutation: {
    addUser: addNewUser,
    addProject: addProject,
    InvitedUser: InivitationUser,
    updateInivitation: updateInivitation,
    createConversation: createConversation,
    createMessage: createMessage,
    deletedProjectId: deletedProject,
    updateProjectAcces: updateUserProjectAccess,
    updateRoleProject: updateRoleProjects,
    removeUserFromProject: removeUserFromProject,
  },
  Subscription: {
    notificationCreated: {
      subscribe: () => {
        return pubsub.asyncIterator([NOTIFICATION_CREATED]);
      },
    },
    heartbeat: {
      subscribe: () => pubsub.asyncIterator("HEARTBEAT"),
    },
    messageCreated: {
      subscribe: () => {
        return pubsub.asyncIterator([MESSAGE_CREATED]);
      },
    },
    userStatusChanged: {
      subscribe: () => pubsub.asyncIterator(["USER_STATUS_CHANGED"]),
      resolve: (payload) => {
        return {
          userId: payload.userId,
          status: payload.status,
        };
      },
    },
  },
};
