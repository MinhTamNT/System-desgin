export const typeDefs = `#graphql
scalar Date

enum NameRole {
  ROLE_ADMIN
  ROLE_USER
  ROLE_GUEST
}

enum Permission {
  ROLE_WRITE
  ROLE_READ
}

type Role {
  name: NameRole
  permissions: [Permission]
}

type User {
  idUser: Int
  username: String
  profilePicture: String
  createdAt: Date
  updatedAt: Date
  roleId: Int
}

type Authenticate {
  idAuthenticate: Int
  authType: String
  authId: String
  createdAt: Date
  updatedAt: Date
  userId: Int
}

type Query {
  name: String
}

`;
