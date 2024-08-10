import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

const client = new OAuth2Client(process.env.CLIENT_ID_GOOGLE);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Invalid token");
  }
}

async function Authority(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return next();
  try {
    const user = await verifyGoogleToken(token);
    req.user = user;
    res.locals.uuid = user?.sub;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export { Authority };
