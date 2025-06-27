import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import ws from "ws";
import { ApolloServer, GraphQLRequest } from "@apollo/server";
import { PubSub } from "graphql-subscriptions";
import {
  ExpressContextFunctionArgument,
  expressMiddleware,
} from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { Modules } from "./modules";
import { TokenUtils } from "./utils";
import { db } from "./db";
import { GraphQLError } from "graphql";
import { ErrorCodes } from "./constants";
import { LoggingUtility } from "./utils/logger.utils";

const pubsub = new PubSub();

const { WebSocketServer } = ws;

export const createHttpServer = async () => {
  const schema = makeExecutableSchema({
    typeDefs: Modules.map((module) => module.types),
    resolvers: Modules.map((module) => module.resolvers),
  });

  const app = express();

  app.use(express.json());
  app.use(cors());

  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              wsServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }: ExpressContextFunctionArgument) => {
        const authorization = req.headers.authorization;

        const { body, headers } = req;

        const { query, variables } = body as GraphQLRequest;

        LoggingUtility.logGraphQLRequest({ query, variables }, headers);

        if (!authorization) {
          return {
            req,
            pubsub,
          };
        }

        const userFromToken = TokenUtils.decodeJWT(authorization);

        if (!userFromToken) {
          throw new GraphQLError(ErrorCodes.UNAUTHORIZED);
        }

        const user = await db
          .selectFrom("user_data")
          .selectAll()
          .where("email", "=", userFromToken)
          .executeTakeFirst();

        if (!user) {
          throw new GraphQLError(ErrorCodes.UNAUTHORIZED);
        }

        return {
          pubsub,
          user,
          req,
        };
      },
    }),
  );

  return { httpServer };
};
