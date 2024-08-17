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

type Project {
  idProject:String,
  name:String,
  description:String,  
  createdAt: Date
  updatedAt: Date

}


type Query {
  name: String
}

type Mutation {
    addUser(idUser:String!,name: String!, profilePicture: String, roleId: Int! ): User
    addProject(name:String!,description:String!):Project

}



`;
