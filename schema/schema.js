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
  ACCEPTED
}


type Role {
  name: NameRole
}

type User {
  idUser: String
  name: String
  email:String
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
  invitation_idInvitation:String
  userRequest: [User]
}

type Query {
  getUserProjects: [Project]
  searchUserByName(searchText:String!):[User]
  getNotificationsByUserId: [Notification]
  getProjectTeams : [Project]
}

type Mutation {
    addUser(idUser:String!,name: String!, profilePicture: String, roleId: Int! , email:String!): User
    addProject(name:String!,description:String!):Project
    InvitedUser(email_content:String! , projectId:String! , userInvited:String!):Inivitation
    updateInivitation( invitation_idInvitation: String! ,status:Status): Inivitation
}
type Subscription {
  notificationCreated: Notification

}
`;
