import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import ShortUniqueId from 'short-unique-id';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function betRoutes(fastify: FastifyInstance) {
  fastify.get('/bets/count', async () => {
    const count = await prisma.bet.count();

    return { count };
  });

  fastify.post('/bets', async (request, reply) => {
    const createBetBody = z.object({
      title: z.string(),
    });

    const { title } = createBetBody.parse(request.body);

    const generateCode = new ShortUniqueId({ length: 6 });

    const code = String(generateCode().toUpperCase());

    try {
      await request.jwtVerify();
      // user already authenticated
      await prisma.bet.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch {
      // create new user
      await prisma.bet.create({
        data: {
          title,
          code,
        },
      });
    }

    return reply.status(201).send({ code });
  });

  //participants
  fastify.post(
    '/bets/:id/join',
    {
      //rota somente acessivel se o usuário estiver autenticado
      onRequest: [authenticate],
    },
    async (req, reply) => {
      const joinBetBody = z.object({
        code: z.string(),
      });

      const { code } = joinBetBody.parse(req.body);

      const bet = await prisma.bet.findUnique({
        //encontrar bolão por codigo
        where: {
          code,
        },
        // traz uma lista apenas em que o id do usuario participante seja igual ao id do usuario logado
        include: {
          participants: {
            where: {
              userId: req.user.sub,
            },
          },
        },
      });

      //se nao existir bolão através do código digitado pelo usuario, exibir msg de erro
      if (!bet) {
        return reply.status(400).send({
          message: 'bolão não encontrado',
        });
      }

      if (bet.participants.length > 0) {
        return reply.status(400).send({
          message: 'Você já está participando deste bolão',
        });
      }

      // quando usuário entrar num bolão sem dono, automaticamente ele vira o owner.
      if (!bet.ownerId) {
        await prisma.bet.update({
          where: {
            id: bet.id,
          },
          data: {
            ownerId: req.user.sub,
          },
        });
      }

      // caso tenha passado por todas as validações acima
      // criar participante com id do bolão e do usuario logado
      await prisma.participant.create({
        data: {
          betId: bet.id,
          userId: req.user.sub,
        },
      });

      return reply
        .status(201)
        .send({
          message: `Agora você está participando do bolão ${bet.title}`,
        });
    }
  );

  // retornar todos os bolões que o usuário está participando
  fastify.get(
    '/bets',
    {
      onRequest: [authenticate],
    },
    async (req) => {
      const bets = await prisma.bet.findMany({
        where: {
          participants: {
            some: {
              userId: req.user.sub,
            },
          },
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
          participants: {
            select: {
              id: true,

              user: {
                select: {
                  avatar: true
                }
              }
            },
            take: 4,
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { bets };
    }
  );
}
