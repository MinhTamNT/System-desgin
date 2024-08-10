import { addNewUser } from "../controller/User/User.js";

export const resolvers = {
  Query: {},
  Mutation: {
    addUser: addNewUser,
  },
};
