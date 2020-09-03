import { Response } from 'express'
import { UserModel } from '../entities/User'
import { AppRequest } from '../types'
import { createToken, sendToken } from './token'

const { FRONTEND_URI } = process.env

export const isAuthenticated = async (userId?: string, tokenVersion?: number) => {
  try {
    if (!userId || tokenVersion === undefined) throw new Error('failed')
    const user = await UserModel.findById(userId)
    if (!user) throw new Error('Not authenticated !')
    if (user.tokenVersion !== tokenVersion) throw new Error('Not authenticated !')
    return user
  } catch (error) {
    throw error
  }
}

export const facebookAuthenticate = async (req: AppRequest, res: Response) => {
  if (!req.profile) return
  const { id, emails, provider } = req.profile
  try {
    const user = await UserModel.findOne({ facebookId: id })
    if (!user) {
      const newUser = await UserModel.create({ email: (emails && emails[0].value) || provider, facebookId: id, password: provider, tokenVersion: 0 })
      await newUser.save()
      const token = createToken(newUser.id, newUser.tokenVersion)
      sendToken(res, token)
    } else {
      const token = createToken(user.id, user.tokenVersion)
      sendToken(res, token)
    }
    res.redirect(FRONTEND_URI!)
  } catch (error) {}
  console.log(req.profile)
}

export const googleAuthenticate = async (req: AppRequest, res: Response) => {
  if (!req.profile) return
  const { id, emails, provider } = req.profile
  try {
    const user = await UserModel.findOne({ googleId: id })
    if (!user) {
      const newUser = await UserModel.create({ email: (emails && emails[0].value) || provider, googleId: id, password: provider, tokenVersion: 0 })
      await newUser.save()
      const token = createToken(newUser.id, newUser.tokenVersion)
      sendToken(res, token)
    } else {
      const token = createToken(user.id, user.tokenVersion)
      sendToken(res, token)
    }
    res.redirect(FRONTEND_URI!)
  } catch (error) {}
  console.log(req.profile)
}
