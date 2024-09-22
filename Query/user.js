export const INSERT_USER = `
  INSERT INTO User (idUser ,name, profilePicture, Role_idRole, createdAt, updatedAt , email)
  VALUES (?,?, ?, ?, NOW(), NOW() , ?)
`;

export const CHECK_USER_EXISTS = `
  SELECT * FROM User WHERE name = ?
`;

export const SEARCH_USER_NAME = `
  SELECT u.*
  FROM user as u
  JOIN role as r ON u.Role_idRole = r.idRole
  WHERE u.name LIKE ? AND r.name = "ROLE_USER"
`;

export const GET_USER_BY_ID = `
select * from designdb.user as u where u.idUser = ?
`;
