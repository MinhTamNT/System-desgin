export const CREATED_NOTIFICATION = `
INSERT INTO designdb.notification (idNotification, message, is_read, createdAt, User_idUser_taker) VALUES ( ?,?, ?, NOW(), ?);

`;

export const GET_NOTIFY_BY_USERID = `
SELECT idNotification, message, is_read, createdAt, User_idUser_taker
FROM Notification
WHERE User_idUser_taker = ?;

`;
