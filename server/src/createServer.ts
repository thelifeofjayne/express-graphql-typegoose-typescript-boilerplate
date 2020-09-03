import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserModel } from './entities/User'
import { AuthResolvers } from './resolvers/AuthResolvers'
import { AppContext } from './types'
import { createToken, sendToken, verifyToken } from './utils/token'

export default async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolvers],
    emitSchemaFile: { path: './src/schema.graphql' },
    validate: false,
  })
  return new ApolloServer({
    schema,
    context: async ({ req, res }: AppContext) => {
      const { TOKEN_NAME } = process.env
      const token = req.cookies[TOKEN_NAME!]
      try {
        const decodedToken = verifyToken(token) as {
          userId: string
          tokenVersion: number
          iat: number
          exp: number
        } | null
        if (decodedToken) {
          if (Date.now() / 1000 - decodedToken.iat > 43200 /* 12 * 60 * 60 */) {
            const { userId, tokenVersion } = decodedToken
            const user = await UserModel.findById(userId)
            if (!user) throw new Error('user not found !')
            if (user.tokenVersion !== tokenVersion) throw new Error('who are u ?')
            user.tokenVersion++
            const updatedUser = await user.save()
            if (!updatedUser) throw new Error('database error')
            const token = createToken(updatedUser.id, updatedUser.tokenVersion)
            decodedToken.userId = updatedUser.id
            decodedToken.tokenVersion = updatedUser.tokenVersion
            sendToken(res, token)
          }
          req.userId = decodedToken.userId
          req.tokenVersion = decodedToken.tokenVersion
        }
      } catch (error) {
        req.userId = undefined
        req.tokenVersion = undefined
      }
      return { req, res }
    },
  })
}
