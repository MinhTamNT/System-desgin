import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Liveblocks } from "@liveblocks/node";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import { configMySql } from "./config/mysqlConfig.js";
import { Authority } from "./middleware/verifyToken.js";
import { pubsub, resolvers } from "./resolvers/resolvers.js";
import { typeDefs } from "./schema/schema.js";
import path from "path";
import { fileURLToPath } from "url";
import adminRoute from "./controllerAdmin/routeApi.js";
import { authenticateToken } from "./middleware/adminMiddleware.js";
import jwt from "jsonwebtoken";
import {
  initRedis,
  removeConnection,
  storeConnection,
} from "./config/redis.js";
import "dotenv/config";
import { verifyGoogleToken } from "./helper/Token.js";
initRedis();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = http.createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });
const PORT = process.env.PORT || 4000;

export const liveblocks = new Liveblocks({
  secret: process.env.API_KEY_LIVE,
});
const admin = adminRoute;

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

const refreshTokenMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.uuid = decoded.uuid;
      res.locals.token = token;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        try {
          const decoded = jwt.decode(token);
          const newToken = jwt.sign(
            { uuid: decoded.uuid },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );
          res.locals.uuid = decoded.uuid;
          res.locals.token = newToken;
          res.setHeader("New-Token", newToken);
        } catch (err) {
          res.locals.uuid = null;
          res.locals.token = null;
        }
      }
    }
  }
  next();
};

app.use(cors());
app.use(bodyParser.json());
app.use(Authority);
app.use(refreshTokenMiddleware);
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", admin);
app.use("/v1", adminRoute, authenticateToken);
async function startApolloServer() {
  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: ({ req, res }) => ({
        uuid: res.locals.uuid,
        token: res.locals.token,
        newToken: res.getHeader("New-Token"),
      }),
    })
  );
}

configMySql.connect(function (err) {
  if (err) throw err;
  console.log("Connected Mysql !!!");
});

const url = `mongodb+srv://${process.env.DB_NAME_MONGODB}:${process.env.DB_PASSWORD_MONGODB}@cluster0.v49ij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection to database successful"))
  .catch((error) => console.error("Error connecting to database:", error));

const connectedUsers = new Map(); // Store userID -> connection mapping
let useStatus = {};
wsServer.on("connection", (connection, req) => {
  console.log("New client connected");

  connection.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (
        parsedMessage.type === "connection_init" &&
        parsedMessage.payload.Authorization
      ) {
        const token = parsedMessage.payload.Authorization;
        const decoded = await verifyGoogleToken(token);
        if (!decoded || !decoded.sub) {
          console.error("Invalid Google token");
          return;
        }

        console.log("User connected:", decoded.sub);
        connectedUsers.set(decoded.sub, connection);
        storeConnection(decoded.sub, connection.id);
        connection.userId = decoded.sub;
      }
      useStatus = {
        userId: connection.userId,
        status: "online",
      };
      pubsub.publish("USER_STATUS_CHANGED", {
        userId: connection.userId,
        status: "online",
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  connection.on("close", () => {
    if (!connection.userId) {
      console.warn("Connection closed but userId was undefined.");
      return;
    }

    console.log(`Client ${connection.userId} disconnected`);
    pubsub.publish("USER_STATUS_CHANGED", {
      userId: connection.userId,
      status: "offline",
    });

    connectedUsers.delete(connection.userId);
    removeConnection(connection.userId, connection);
  });
});

startApolloServer().then(() => {
  httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🛠 Admin Page available at http://localhost:${PORT}/admin`);
  });
});

const userStatuses = new Map(); // Để lưu trữ trạng thái người dùng

pubsub.subscribe("USER_STATUS_CHANGED", (payload) => {
  console.log("User status changed:", payload);
  userStatuses.set(payload.userId, payload.status);
});
