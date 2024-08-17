import { addProject } from "../controller/Project/Project.js";
import { addNewUser } from "../controller/User/User.js";

export const resolvers = {
  Query: {},
  Mutation: {
    addUser: addNewUser,
    addProject: addProject,
  },
};
