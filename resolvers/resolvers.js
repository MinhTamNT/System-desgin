import { addProject, getUserProjects } from "../controller/Project/Project.js";
import { addNewUser } from "../controller/User/User.js";

export const resolvers = {
  Query: {
    getUserProjects: getUserProjects,
  },
  Mutation: {
    addUser: addNewUser,
    addProject: addProject,
  },
};
