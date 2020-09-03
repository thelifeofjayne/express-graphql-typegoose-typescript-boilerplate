import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

const { SECRET_KEY, TOKEN_NAME } = process.env

export const createToken = (userId: string, tokenVersion: number) => {
  return jwt.sign({ userId, tokenVersion }, SECRET_KEY!, { expiresIn: '7d' })
}

export const sendToken = (res: Response, token: string) => {
  res.cookie(TOKEN_NAME!, token, { httpOnly: true })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY!)
}

export const deleteToken = (res: Response) => {
  res.clearCookie(TOKEN_NAME!)
}
