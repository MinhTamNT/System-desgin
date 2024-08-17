export const ADD_INIVITATION = `INSERT INTO designdb.invitation (idInvitation, email_content, status, createdAt, updatedAt, Project_idProject, User_idUser_requested, User_idUser_invited) 
VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?); `;
