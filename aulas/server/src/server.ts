import fastify from 'fastify'
import cors from '@fastify/cors'
import { memoriesRoutes } from './routes/memories'
import 'dotenv/config'
import { authRoutes } from './routes/auth'

const app = fastify()
app.register(
  cors,
  { origin: true }, // Any frontend url can access the API
)
app.register(authRoutes)
app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })

// API RESTful - existem alguns padrões a serem seguidos
