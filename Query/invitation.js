export const ADD_INIVITATION = `INSERT INTO designdb.invitation (idInvitation, email_content, status, createdAt, updatedAt, Project_idProject, User_idUser_requested, User_idUser_invited , notification_idNotification) 
VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ? , ?); `;

export const UPDATE_INIVITATION = `
UPDATE designdb.notification AS n
JOIN designdb.invitation AS i
ON i.notification_idNotification = n.idNotification
SET
  status = ? ,
  n.is_read = 1 
WHERE i.idInvitation = ?
`;

export const GET_INIVITATION_BY_ID = `
  SELECT * from designdb.invitation as n where n.idInvitation = ?
`;
