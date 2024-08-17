export const INSERT_USER = `
  INSERT INTO User (idUser ,name, profilePicture, Role_idRole, createdAt, updatedAt)
  VALUES (?,?, ?, ?, NOW(), NOW())
`;

export const CHECK_USER_EXISTS = `
  SELECT * FROM User WHERE name = ?
`;
