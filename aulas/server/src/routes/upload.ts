import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline) // -> pipeline is one way to know writeStream has finished it process

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // Max file size equals 5mb
      },
    })
    if (!upload) return reply.status(400).send()

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)
    if (!isValidFileFormat) {
      return reply.status(400).send()
    }
    const fileId = randomUUID()
    const extension = extname(upload.filename)
    const filename = fileId.concat(extension)
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', filename), // ---> resolve will put all paths in same pattern so they can be understood by all operat systems
    )
    await pump(upload.file, writeStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString()
    return { fileUrl }
  })
}
