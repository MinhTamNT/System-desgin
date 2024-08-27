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

async function refreshAccessToken(refreshToken) {
  try {
    const newTokens = await client.refreshToken(refreshToken);
    return newTokens.credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Could not refresh access token");
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
    if (error.message === "Invalid token" && req.cookies.refreshToken) {
      try {
        token = await refreshAccessToken(req.cookies.refreshToken);
        req.headers["authorization"] = `Bearer ${token}`;
        const user = await verifyGoogleToken(token);
        req.user = user;
        res.locals.uuid = user?.sub;
        next();
      } catch (refreshError) {
        res.status(401).json({ error: "Invalid token and could not refresh" });
      }
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  }
}

export { Authority };
