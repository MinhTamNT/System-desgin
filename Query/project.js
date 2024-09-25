export const INSERT_PROJECT = `
    INSERT INTO Project (idProject, name, description, createdAt, updatedAt) 
    VALUES (?, ?, ?, NOW(), NOW())
`;

export const INSERT_USER_PROJECT = `
    INSERT INTO user_has_project (User_idUser, Project_idProject, access, is_host_user) 
    VALUES (?, ?, ?, ?)
`;

export const GET_PROJECT_BY_ID = `
select p.idProject ,name ,description, is_host_user , own.access
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

export const USER_HAS_PROJECT = `
UPDATE user_has_project
SET
    lastAccessed = NOW(),
    accessCount = accessCount + 1
WHERE
    user_idUser = ? AND
    project_idProject = ?

`;

export const GET_RECENT_PROJECT = `
SELECT uhp.user_idUser, uhp.project_idProject, p.name AS projectName, uhp.access, uhp.is_host_user, uhp.lastAccessed, uhp.accessCount
FROM user_has_project uhp
JOIN project p ON uhp.project_idProject = p.idProject
WHERE uhp.user_idUser = ?
ORDER BY uhp.lastAccessed DESC
LIMIT 5;`;

export const GET_MEMBER_IN_PROJECT = `
SELECT 
    u.idUser AS idUser,
    p.idProject AS project_idProject,
    pm.access,
    pm.is_host_user,
    pm.lastAccessed,
    pm.accessCount,
    p.name,
    u.name AS name,
    u.profilePicture AS profilePicture  -- Added comma here
FROM
    designdb.user_has_project AS pm
    INNER JOIN designdb.user u ON pm.user_idUser = u.idUser
    INNER JOIN designdb.project p ON pm.project_idProject = p.idProject
WHERE
    p.idProject = ?
`;

export const UPDATE_USER_ROLE_IN_PROJECT = `
    UPDATE user_has_project
    SET access = ? WHERE user_idUser = ? AND project_idProject = ?
`;
