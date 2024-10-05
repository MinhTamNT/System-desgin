export const CREATED_NOTIFICATION = `
INSERT INTO designdb.notification 
(idNotification, message, is_read, createdAt, User_idUser_taker, user_idUser_requested , type) 
VALUES (?, ?, ?, NOW(), ?, ? , ?);
`;

export const GET_NOTIFY_BY_USERID = `
SELECT 
  n.*,
  i.Project_idProject,
  i.email_content,
  i.status,
  i.idInvitation
FROM Notification n
JOIN Invitation i
ON n.idNotification = i.notification_idNotification
WHERE n.User_idUser_taker = ?;

`;
