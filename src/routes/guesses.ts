import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count()

    return { count }
  });

  //dentro de bolões, achar um bolão específico, onde existem vários jogos e dentro de jogos, achar um jogo específico onde o participante ira criar um palpite
  fastify.post('/bets/:betId/games/:gameId/guesses', {
    onRequest: [authenticate],
  }, async (req, reply) => {
    const createGuessParams = z.object({
      betId: z.string(),
      gameId: z.string(),
    });

    const { betId, gameId } = createGuessParams.parse(req.params)
  })  
}
