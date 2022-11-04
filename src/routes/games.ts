import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function gamesRoutes(fastify: FastifyInstance) {
  fastify.get('/games/count', async () => {
    const count = await prisma.game.count();

    return { count };
  });

  //listando jogos dentro de um bolão.
  fastify.get(
    '/bets/:id/games',
    {
      onRequest: [authenticate],
    },
    async (req) => {
      const getGameParams = z.object({
        id: z.string(),
      });

      const { id } = getGameParams.parse(req.params);

      const games = await prisma.game.findMany({
        orderBy: {
          date: 'desc',
        },
        //quem faz o palpite é o participante - que pode ter diferentes palpites em outros bolões em que participa.
        include: {
          guesses: {
            where: {
              participant: {
                userId: req.user.sub,
                betId: id,
              },
            },
          },
        },
      });

      // o participante só pode fazer um palpite dentro de um jogo do bolão
      return {
        games: games.map((game) => {
          return {
            ...game,
            //se o usuário ainda não tem palpite, retorna null e o array de guesses fica undefined; caso contrário, cria o palpite - por isso o array[0]
            guess: game.guesses.length > 0 ? game.guesses[0] : null,
            guesses: undefined,
          };
        }),
      };
    }
  );
}
