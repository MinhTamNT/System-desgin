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
  INVITED
  STANDARD
  DELETE
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
  status: String
  deviceId: String
}

type Project {
  idProject: ID!
  name: String
  description: String
  createdAt: String
  updatedAt: String
  access: String
  is_host_user: Boolean
}

type PageInfo {
  TOTALROW: Int
  IND: Int
}

type ProccessObj {
  RetCode : Int,
  RetMessgae : String

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
  access: String
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

type ProjectsResponse {
  projects: [Project]
  pageInfo: PageInfo
}

type NotificationResponse {
  notifications: [Notification]
  pageInfo: PageInfo
}

type UserStatus {
    userId: String
    status: String
  }
union AddUserResponse = User | ProccessObj
type Query {
  getUserProjects(pageIndex: Int, pageSize: Int , nameProject:String): ProjectsResponse
  searchUserByName(searchText:String!): [AddUserResponse]
  getNotificationsByUserId(pageIndex: Int, pageSize: Int): NotificationResponse
  getProjectTeams : [Project]
  getConversation: [Conversation]
  getMessageConversationId(conversationId : String): [Message]
  getUserActivityLog: [ActivityLog] 
  getRecentProjectsWithAccess: [UserProjectAccess]
  getMememberInProject (projectId: String) : [UserProjectAccess]

}


type Mutation {
    addUser(idUser:String!,name: String!, profilePicture: String , email:String! , TokenUser:String! , expireAt: String!): [AddUserResponse]
    addProject(name:String!,description:String! , listInvite:String): ProccessObj
    InvitedUser(email_content:String! , projectId:String! , userInvited:String!):Inivitation
    updateInivitation( invitation_idInvitation: String! ,status:Status): Inivitation
    createConversation(receiverId:String!): Conversation
    createMessage(message:String! , conversationId:ID): Message
    deletedProjectId(projectId:String) : ProccessObj
    updateProjectAcces( projectId: String!): ProccessObj
    updateRoleProject( projectId: String! , userId: String! , role: String!): ProccessObj
    removeUserFromProject(projectId: String!, userId: String!): ProccessObj

}
type Subscription {
  notificationCreated: Notification
  messageCreated : Message
  heartbeat: Boolean
  userStatusChanged: UserStatus
}
`;
