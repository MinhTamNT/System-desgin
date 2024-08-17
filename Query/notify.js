export const CREATED_NOTIFICATION = `
INSERT INTO designdb.notification (idNotification, message, is_read, createdAt, User_idUser_taker) VALUES ( ?,?, ?, NOW(), ?);

`;
