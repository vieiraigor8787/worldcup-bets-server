import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import ShortUniqueId from 'short-unique-id';
import { prisma } from '../lib/prisma';

export async function betRoutes(fastify: FastifyInstance) {
  fastify.get('/bets/count', async () => {
    const count = await prisma.bet.count();

    return { count };
  });

  fastify.post("/bets", async (request, reply) => {
    const createBetBody = z.object({
      title: z.string()
    })

    const { title } = createBetBody.parse(request.body)

    const generateCode = new ShortUniqueId({ length: 6 })

    const code = String(generateCode().toUpperCase())

    try {
      await request.jwtVerify()
      // user already authenticated
      await prisma.bet.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub
            }
          }
        }
      })
    } catch {
      // create new user
      await prisma.bet.create({
        data: {
          title,
          code
        }
      })
    }

    return reply.status(201).send({code})
  })
}
