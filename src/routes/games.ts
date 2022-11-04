import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function gamesRoutes(fastify: FastifyInstance) {
  fastify.get('/games/count', async () => {
    const count = await prisma.game.count()

    return { count }
  });

  fastify.get(
    '/bets/:id/games',
    {
      onRequest: [authenticate],
    },
    async (req) => {
      const getGameParams = z.object({
        id: z.string(),
      })

      const { id } = getGameParams.parse(req.params)

      const games = await prisma.game.findMany({
        orderBy: {
         date: 'desc' 
        }
      })

      return { games }
    }
  );
}
