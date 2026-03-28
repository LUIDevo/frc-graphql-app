import { ApolloServer } from "apollo-server-express"; // Apollo Server for GraphQL
import express from "express"; // Express.js for HTTP server
import axios from "axios";
import { typeDefs } from "./schema/typeDefs"; // Your GraphQL schema (make sure this path is correct)
import { resolvers } from "./resolvers"; // Your GraphQL resolvers (make sure this path is correct)
import prisma from "./prisma";
const startServer = async () => {
  const app = express(); // Create an Express app
  app.use(express.json({ limit: "10mb" }));

  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    console.log("Body:", req.body);
    next();
  });
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ prisma }),
    introspection: true,
  });

  await server.start();
  app.get("/avatar/:teamNumber", async (req, res) => {
    console.log("got here");
    const teamNumber = req.params.teamNumber;
    const avatar = await prisma.avatar.findUnique({
      where: { teamNumber: Number(teamNumber) },
    });
    // console.log("got here2");
    if (!avatar || !avatar.image) {
      return res.status(404).send("Not found");
    }
    const buf = Buffer.from(avatar.image);
    console.log(avatar.image);
    console.log("Sending image, size bytes:", avatar.image.length);
    res.setHeader("Content-Type", "image/png");
    res.send(buf);
  });

  server.applyMiddleware({ app, cors: { origin: true, credentials: true } });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`),
  );
};

startServer();
