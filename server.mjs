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
import { resolvers } from "./resolvers/resolvers.js";
import { typeDefs } from "./schema/schema.js";
import path from "path";
import { fileURLToPath } from "url";
import adminRoute from "./controllerAdmin/routeApi.js";
import { authenticateToken } from "./middleware/adminMiddleware.js";
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

app.use(cors());
app.use(bodyParser.json());
app.use(Authority);
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

startApolloServer().then(() => {
  httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🛠 Admin Page available at http://localhost:${PORT}/admin`);
  });
});
