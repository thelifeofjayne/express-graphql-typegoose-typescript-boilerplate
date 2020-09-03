import express from 'express'
import createServer from './createServer'
import mongoose from 'mongoose'
import { config } from 'dotenv'
config()
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { facebookAuthenticate, googleAuthenticate } from './utils/auth'

const { DB_PASSWORD, PORT, DB_USER, DB_ENDPOINT, DB_NAME, FRONTEND_URI } = process.env

const startSever = async () => {
  await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ENDPOINT}/${DB_NAME}?retryWrites=true&w=majority`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })

  const app = express()
  app.use(cookieParser())

  app.get('/auth/facebook', passport.authenticate('facebook'))

  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: FRONTEND_URI, scope: ['profile', 'email'] }),
    facebookAuthenticate
  )

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

  app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: FRONTEND_URI }), googleAuthenticate)

  const server = await createServer()

  server.applyMiddleware({ app })

  app.listen({ port: 5000 }, () => console.log(`Server is ready at http://localhost:${PORT || 5000}${server.graphqlPath}`))
}

startSever()
