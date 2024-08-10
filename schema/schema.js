export const typeDefs = `#graphql
scalar Date

enum NameRole {
  ROLE_ADMIN
  ROLE_USER
}

enum Permission {
  ROLE_WRITE
  ROLE_READ
}

type Role {
  name: NameRole
}

type User {
  idUser: Int
  name: String
  profilePicture: String
  createdAt: Date
  updatedAt: Date
  roleId: Int
}



type Query {
  name: String
}

type Mutation {
    addUser(name: String!, profilePicture: String, roleId: Int! , uuid : String ): User
}



`;
