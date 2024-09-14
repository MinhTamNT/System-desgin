export const INSERT_PROJECT = `
    INSERT INTO Project (idProject, name, description, createdAt, updatedAt) 
    VALUES (?, ?, ?, NOW(), NOW())
`;

export const INSERT_USER_PROJECT = `
    INSERT INTO user_has_project (User_idUser, Project_idProject, access, is_host_user) 
    VALUES (?, ?, ?, ?)
`;

export const GET_PROJECT_BY_ID = `
select p.idProject ,name ,description, is_host_user 
from designdb.project as p join designdb.user_has_project as own on p.idProject = own.Project_idProject WHERE own.user_idUser = ?
`;

export const GET_PROJECT_ID = `
    select * from designdb.project as p where p.idProject = ?
`;

export const GET_PROJECT_TEAM = `
SELECT p.idProject, p.name
FROM designdb.project as p
JOIN designdb.user_has_project as up ON p.idProject = up.Project_idProject
WHERE up.User_idUser = ?
`;

export const DELETE_PROJECT_BY_ID = `
DELETE p
FROM designdb.project p
JOIN designdb.user_has_project uhp ON p.idProject = uhp.Project_idProject
WHERE p.idProject = ? 
  AND uhp.User_idUser = ? 
  AND uhp.is_host_user = 1;;
`;
