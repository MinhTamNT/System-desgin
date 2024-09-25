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

enum TypeNotify {
  INIVITED
  STANDARD
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
  idUser:String
  uuid: String
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


type Conversation {
  id: ID!
  members : [User]
  createdAt: Date
  updatedAt: Date
  messageCount: Int
}


type Message {
  conversationId : ID 
  sender : User 
  text :  String 
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

type UserProjectAccess {
  user_idUser: String
  project_idProject: String
  access: Boolean
  is_host_user: Boolean
  lastAccessed: Date
  accessCount: Int
  projectName:String
  User: [User]
}

type Notification {
  idNotification: String!,
  type : TypeNotify
  message:String,
  is_read : Boolean,
  createdAt:Date,
  invitation_idInvitation:String
  userRequest: [User]
}

type ActivityLog {
  idactivityLogSchema: String!
  action: String!
  details: String
  createdAt: Date
  Project_idProject: String
  User_idUser: String
}

type News {
  message:String
}


type Query {
  getUserProjects: [Project]
  searchUserByName(searchText:String!):[User]
  getNotificationsByUserId: [Notification]
  getProjectTeams : [Project]
  getConversation: [Conversation]
  getMessageConversationId(conversationId : String): [Message]
  getUserActivityLog: [ActivityLog] 
  getRecentProjectsWithAccess: [UserProjectAccess]
  getMememberInProject (projectId: String) : [UserProjectAccess]

}

type Mutation {
    addUser(idUser:String!,name: String!, profilePicture: String, roleId: Int! , email:String!): User
    addProject(name:String!,description:String!):Project
    InvitedUser(email_content:String! , projectId:String! , userInvited:String!):Inivitation
    updateInivitation( invitation_idInvitation: String! ,status:Status): Inivitation
    createConversation(receiverId:String!): Conversation
    createMessage(message:String! , conversationId:ID): Message
    deletedProjectId(projectId:String) : News
    updateProjectAcces( projectId: String!): UserProjectAccess
    updateRoleProject( projectId: String! , userId: String! , role: String!): UserProjectAccess
    

}
type Subscription {
  notificationCreated: Notification
  messageCreated : Message

}
`;
