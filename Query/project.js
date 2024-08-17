export const INSERT_PROJECT = `
    INSERT INTO Project (idProject, name, description, createdAt, updatedAt) 
    VALUES (?, ?, ?, NOW(), NOW())
`;

export const INSERT_USER_PROJECT = `
    INSERT INTO user_has_project (User_idUser, Project_idProject, acess, is_host_user) 
    VALUES (?, ?, ?, ?)
`;

export const GET_PROJECT_BY_ID = `
select p.idProject ,name ,description, is_host_user 
from designdb.project as p join designdb.user_has_project as own on p.idProject = own.Project_idProject 
where own.User_idUser = ?

`;
