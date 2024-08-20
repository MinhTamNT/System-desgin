export const CREATED_NOTIFICATION = `
INSERT INTO designdb.notification 
(idNotification, message, is_read, createdAt, invitation_idInvitation, User_idUser_taker, user_idUser_requested) 
VALUES (?, ?, ?, NOW(), ?, ?, ?);
`;

export const GET_NOTIFY_BY_USERID = `
SELECT *
FROM Notification
WHERE User_idUser_taker = ?;

`;
