export const INSERT_USER = `
  INSERT INTO User (username, profilePicture, roleId, createdAt, updatedAt)
  VALUES (?, ?, ?, NOW(), NOW())
`;

export const INSERT_AUTHENTICATE = `
  INSERT INTO Authenticate (authType, authId, createdAt, updatedAt, userId)
  VALUES (?, ?, NOW(), NOW(), ?)
`;

export const SELECT_AUTHENTICATE_BY_USER_ID = `
  SELECT * FROM Authenticate WHERE userId = ?
`;
