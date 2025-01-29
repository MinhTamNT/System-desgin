import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

const client = new OAuth2Client(process.env.CLIENT_ID_GOOGLE);

export async function verifyGoogleToken(token) {
  const convertToken = token.replace("Bearer ", "");
  const ticket = await client.verifyIdToken({
    idToken: convertToken,
    audience: process.env.CLIENT_ID,
  });
  return ticket.getPayload();
}
