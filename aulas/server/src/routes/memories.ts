import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  // Check if user is signed in before every route
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify() // -> check if there is a token to authorize request
  })
  // Listing memories
  app.get('/memories', async (request) => {
    await request.jwtVerify() // -> check if there is a token to authorize request

    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        cratedAt: 'asc',
      },
    })
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
        createdAt: memory.cratedAt,
      }
    })
  })
  // Listing a specific memory
  app.get('/memories/:id', async (request, reply) => {
    // Params is an object and inside it is expected to be an id that is a string
    const paramsSchema = z.object({
      id: z.string().uuid(), // Validating that id is type of uuid
    })

    // Check if request.params follows Schema validation
    const { id } = paramsSchema.parse(request.params)

    // Find an unique memory which id is the id recieved as parameter
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }
    return memory
  })
  // Creating a memory
  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // Coerce convert isPublic value that comes from request into boolean
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })
    return memory
  })
  // Updating a memory
  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }
    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })
  // Deleting a memory
  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
