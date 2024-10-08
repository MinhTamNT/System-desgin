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
  getRecentProjectsWithAccess,
  getUserProjects,
  removeUserFromProject,
  updateRoleProjects,
  updateUserProjectAccess,
} from "../controller/Project/Project.js";
import { addNewUser, SearchUserByName } from "../controller/User/User.js";
import { pool } from "../config/mysqlConfig.js";
import { GET_USER_BY_ID } from "../Query/user.js";
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
    getRecentProjectsWithAccess: getRecentProjectsWithAccess,
    getMememberInProject: getProjectMemember,
  },
  Notification: {
    userRequest: async (parent) => {
      let connection;
      try {
        connection = await pool.getConnection();
        const [result] = await connection.query(GET_USER_BY_ID, [
          parent.userRequest,
        ]);
        return result;
      } catch (error) {
        console.log(error);
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
    messageCreated: {
      subscribe: () => {
        return pubsub.asyncIterator([MESSAGE_CREATED]);
      },
    },
  },
};
