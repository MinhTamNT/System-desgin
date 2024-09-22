export const CREATE_ACTIVYTY = `
INSERT INTO activitylog (idactivityLogSchema, action, details, Project_idProject, User_idUser, createdAt ,updateDate)
    VALUES (?, ?, ?, ?, ?, NOW(),NOW())
`;

export const ActivateUser = `
 SELECT * 
        FROM activitylog 
        WHERE User_idUser = ?
`;
