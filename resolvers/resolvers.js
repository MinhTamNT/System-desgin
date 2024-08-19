import { PubSub } from "graphql-subscriptions";
import {
  createNotfication,
  getNotificationsByUserId,
} from "../controller/Notification/Notification.js";
import { addProject, getUserProjects } from "../controller/Project/Project.js";
import { addNewUser, SearchUserByName } from "../controller/User/User.js";
import { InivitationUser } from "../controller/Invitation/Invitation.js";
export const pubsub = new PubSub();
const NOTIFICATION_CREATED = "NOTIFICATION_CREATED";
export const resolvers = {
  Query: {
    getUserProjects: getUserProjects,
    searchUserByName: SearchUserByName,
    getNotificationsByUserId: getNotificationsByUserId,
  },
  Mutation: {
    addUser: addNewUser,
    addProject: addProject,
    createNotification: createNotfication,
    InvitedUser: InivitationUser,
  },
  Subscription: {
    notificationCreated: {
      subscribe: () => {
        return pubsub.asyncIterator([NOTIFICATION_CREATED]);
      },
    },
  },
};
