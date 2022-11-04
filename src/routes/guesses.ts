import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  //dentro de bolões, achar um bolão específico, onde existem vários jogos e dentro de jogos, achar um jogo específico onde o participante ira criar um palpite
  fastify.post(
    '/bets/:betId/games/:gameId/guesses',
    {
      onRequest: [authenticate],
    },
    async (req, reply) => {
      const createGuessParams = z.object({
        betId: z.string(),
        gameId: z.string(),
      });

      const createGuessBody = z.object({
        firstCountryPoints: z.number(),
        secondCountryPoints: z.number(),
      });

      const { betId, gameId } = createGuessParams.parse(req.params);
      const { firstCountryPoints, secondCountryPoints } = createGuessBody.parse(
        req.body
      );

      // validar se o usuário não pertencer ao bolão, não pode fazer um palpite
      const participant = await prisma.participant.findUnique({
        where: {
          userId_betId: {
            betId,
            userId: req.user.sub,
          },
        },
      });

      if (!participant) {
        return reply.status(400).send({
          message: 'Você não está permitido criar um palpite para este bolão',
        });
      }

      // nao permitir que o participante faça novo palpite no mesmo jogo no mesmo bolão
      const guess = await prisma.guess.findUnique({
        where: {
         participantId_gameId: {
          participantId: participant.id,
          gameId
         }
        }
      })

      if (guess) {
        return reply.status(400).send({
          message: "Você já enviou um palpite para este jogo neste bolão"
        })
      }

      //se o jogo não existir ou já estiver ocorrido, retorna erro
      const game = await prisma.game.findUnique({
        where: {
          id: gameId 
        }
      })

      if (!game) {
        return reply.status(400).send({
          message: "Jogo não encontrado"
        })
      }

      if (game.date < new Date()) {
        return reply.status(400).send({
          message: "Não é possível fazer palpite em jogos já realizados"
        })
      }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstCountryPoints,
          secondCountryPoints
        }
      })

      return reply.status(200).send({message: 'Palpite criado com sucesso!'});
    }
  );
}
