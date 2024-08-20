import { PubSub } from "graphql-subscriptions";
import {
  InivitationUser,
  updateInivitation,
} from "../controller/Invitation/Invitation.js";
import { getNotificationsByUserId } from "../controller/Notification/Notification.js";
import {
  addProject,
  getProjectTeams,
  getUserProjects,
} from "../controller/Project/Project.js";
import { addNewUser, SearchUserByName } from "../controller/User/User.js";
import { pool } from "../config/mysqlConfig.js";
import { GET_USER_BY_ID } from "../Query/user.js";
export const pubsub = new PubSub();
const NOTIFICATION_CREATED = "NOTIFICATION_CREATED";
export const resolvers = {
  Query: {
    getUserProjects: getUserProjects,
    searchUserByName: SearchUserByName,
    getNotificationsByUserId: getNotificationsByUserId,
    getProjectTeams: getProjectTeams,
  },
  Notification: {
    userRequest: async (parent) => {
      console.log(parent);
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
  Mutation: {
    addUser: addNewUser,
    addProject: addProject,
    InvitedUser: InivitationUser,
    updateInivitation: updateInivitation,
  },
  Subscription: {
    notificationCreated: {
      subscribe: () => {
        return pubsub.asyncIterator([NOTIFICATION_CREATED]);
      },
    },
  },
};
