import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { authRoutes } from "./routes/auth";
import { betRoutes } from "./routes/bets";
import { guessRoutes } from "./routes/guesses";
import { userRoutes } from "./routes/users";

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  })

  await fastify.register(cors, {
    origin: true,
  })

  await fastify.register(jwt, {
    secret: 'worldcupbett'
  }),

  await fastify.register(betRoutes)
  await fastify.register(userRoutes)
  await fastify.register(guessRoutes)
  await fastify.register(authRoutes)  

  await fastify.listen({ port: 3333, host: "0.0.0.0" })
}

bootstrap()
