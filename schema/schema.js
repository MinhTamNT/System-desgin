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

enum Status {
  STENT
  REJECTED
  ACCPEDTED
}


type Role {
  name: NameRole
}

type User {
  idUser: String
  name: String
  profilePicture: String
  createdAt: Date
  updatedAt: Date
  roleId: Int
}

type Project {
  idProject: String!
  name: String!
  description: String
  createdAt: String
  updatedAt: String
  access: String
  is_host_user: Boolean

}

type Inivitation {
  idInvitation:String!,
  email_content: String!,
  status: Status,
  createdAt:Date,
  updatedAt : Date,
  Project_idProject: String!,
  User_idUser_requested : String!,
  User_idUser_invited: String!
}

type Notification {
  idNotification: String!,
  message:String,
  is_read : Boolean,
  createdAt:Date,
  userTaker:[User],
}

type Query {
  getUserProjects: [Project]
  searchUserByName(searchText:String!):[User]
  getNotificationsByUserId: [Notification]
}

type Mutation {
    addUser(idUser:String!,name: String!, profilePicture: String, roleId: Int! ): User
    addProject(name:String!,description:String!):Project
    InvitedUser(email_content:String! , projectId:String! , userInvited:String!):Inivitation
    createNotification(message:String! , userTaker: String!): Notification,
}
type Subscription {
  notificationCreated: Notification

}
`;
