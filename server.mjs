import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
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
    ApolloServerPluginDrainHttpServer({ httpServer }),
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

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
}

configMySql.connect(function (err) {
  if (err) throw err;
  console.log("Connected Mysql !!!");
});

const url = `mongodb+srv://${process.env.DB_NAME_MONGODB}:${process.env.DB_PASSWORD_MONGODB}@cluster0.v49ij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//Connect to mongodb
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
  });
});
