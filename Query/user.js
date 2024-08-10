export const INSERT_USER = `
  INSERT INTO User (name, profilePicture, Role_idRole, createdAt, updatedAt,uuid)
  VALUES (?, ?, ?, NOW(), NOW(), ?)
`;

export const CHECK_USER_EXISTS = `
  SELECT * FROM User WHERE name = ?
`;
  