import jwt from "jsonwebtoken";
import "dotenv/config";
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "6d9524cf-6eca-4442-af68-fe0b934c49a7", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
