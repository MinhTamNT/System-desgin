import { PubSub } from "graphql-subscriptions";
import { createNotfication } from "../controller/Notification/Notification.js";
import { addProject, getUserProjects } from "../controller/Project/Project.js";
import { addNewUser } from "../controller/User/User.js";
export const pubsub = new PubSub();
const NOTIFICATION_CREATED = "NOTIFICATION_CREATED";
export const resolvers = {
  Query: {
    getUserProjects: getUserProjects,
  },
  Mutation: {
    addUser: addNewUser,
    addProject: addProject,
    createNotification: createNotfication,
  },
  Subscription: {
    notificationCreated: {
      subscribe: () => {
        pubsub.asyncIterator([NOTIFICATION_CREATED]);
      },
    },
  },
};
