import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import { WebSocketServer } from "ws";
import { resolvers } from "./resolvers/resolvers.js";
import { typeDefs } from "./schema/schema.js";
import { configMySql } from "./config/mysqlConfig.js";
import mongoose from "mongoose";
import { Authority } from "./middleware/verifyToken.js";
import { expressMiddleware } from "@apollo/server/express4";

const app = express();
const httpServer = http.createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });
const PORT = process.env.PORT || 4000;

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
// Connect to MongoDB
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection to database successful"))
  .catch((error) => console.error("Error connecting to database:", error));

// Start Apollo Server and listen for incoming requests
startApolloServer().then(() => {
  httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
});
