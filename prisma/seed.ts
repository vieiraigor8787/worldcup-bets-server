import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'jon doe',
      email: 'jon.doe@email.com',
      avatar: 'https://github.com/vieiraigor8787.png'
    }
  })

  const bet = await prisma.bet.create({
    data: {
      title: 'example bet1',
      code: 'bol221',
      ownerId: user.id,

      participants: {
        create: {
          userId: user.id
        } 
      }
    }
  })

  const game = await prisma.game.create({
    data: {
      date: '2022-11-03T12:00:00.848Z',
      firstCountryCode: 'SW',
      secondCountryCode: 'BR'
    }
  })

  await prisma.game.create({
    data: {
      date: '2022-11-04T12:00:00.848Z',
      firstCountryCode: 'AR',
      secondCountryCode: 'AT',

      guesses: {
        create: {
          firstCountryPoints: 2,
          secondCountryPoints: 1,

          participant: {
            connect: {
              userId_betId: {
                userId: user.id,
                betId: bet.id
              }
            }
          }
        }
      }
    }
  })
}

main()