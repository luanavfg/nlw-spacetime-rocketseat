import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  // Listing a memory
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        cratedAt: 'asc',
      },
    })
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        exerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  // Listing memory details
  app.get('/memories/:id', async (request) => {
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
        userId: '70d8ea55-36b4-42f8-b1e0-503f4f231172',
      },
    })
    return memory
  })

  // Updating a memory
  app.put('/memories/:id', async (request) => {
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

    const memory = await prisma.memory.update({
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
  app.delete('/memories/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
