import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      // Githube code return in url
      code: z.string(),
    })

    const { code } = bodySchema.parse(request.body)
    const accessTokenResponse = await axios.post(
      // endpoint to get access token
      'https://github.com/login/oauth/access_token',
      // request body will be null
      null,
      {
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )

    const { access_token } = accessTokenResponse.data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const user = userResponse.data
    return { user }
  })
}
