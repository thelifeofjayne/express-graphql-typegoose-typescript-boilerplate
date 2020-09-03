import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { User, UserModel } from '../entities/User'
import bcryptjs from 'bcryptjs'
import { createToken, sendToken, deleteToken } from '../utils/token'
import { AppContext, Roles } from '../types'
import { isAuthenticated } from '../utils/auth'
import { randomBytes } from 'crypto'
import Sendgrid, { MailDataRequired } from '@sendgrid/mail'

Sendgrid.setApiKey(process.env.SENDGRID_API_KEY!)

@Resolver()
export class AuthResolvers {
  @Query(() => [User], { nullable: 'items' })
  async users(@Ctx() { req }: AppContext): Promise<User[]> {
    try {
      const user = await isAuthenticated(req.userId, req.tokenVersion)

      const isAdmin = user.roles?.includes(Roles.admin) || user.roles?.includes(Roles.superAdmin)
      if (!isAdmin) throw new Error('not authorized !')

      return UserModel.find().sort({ createdAt: -1 })
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => User, { nullable: true })
  async signup(@Ctx() { res }: AppContext, @Arg('email') email: string, @Arg('password') password: string): Promise<User | null> {
    try {
      const hashedPassword = await bcryptjs.hash(password, 10)
      const user = await UserModel.create({ email, password: hashedPassword, tokenVersion: 0 })
      await user.save()
      const token = createToken(user.id, user.tokenVersion)
      sendToken(res, token)
      return user
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => User, { nullable: true })
  async signin(@Ctx() { res }: AppContext, @Arg('email') email: string, @Arg('password') password: string): Promise<User | null> {
    const user = await UserModel.findOne({ email })
    if (!user) throw new Error('email not found !')
    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) throw new Error('password is invalid !')
    const token = createToken(user.id, user.tokenVersion)
    sendToken(res, token)
    return user
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: AppContext): Promise<User | null> {
    try {
      const { userId, tokenVersion } = req
      const user = await isAuthenticated(userId, tokenVersion)
      return user
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => Boolean)
  async signout(@Ctx() { req, res }: AppContext): Promise<Boolean> {
    try {
      const { userId, tokenVersion } = req
      if (!userId || tokenVersion === undefined) throw new Error('Who are you !')
      const user = await isAuthenticated(userId, tokenVersion)
      user.tokenVersion++
      await user.save()
      await deleteToken(res)
      return true
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => Boolean)
  async requestResetPassword(@Arg('email') email: string): Promise<Boolean> {
    try {
      const user = await UserModel.findOne({ email })
      if (!user) throw new Error('email not found !')

      const resetPasswordToken = randomBytes(16).toString('hex')
      const resetPasswordTokenExpiry = Date.now() + 90000 // 1000 * 60 * 15
      user.resetPasswordToken = resetPasswordToken
      user.resetPasswordTokenExpiry = resetPasswordTokenExpiry
      await user.save()
      const message: MailDataRequired = {
        from: 'thelifeofjayne@gmail.com',
        to: email,
        subject: 'Reset Password',
        html: `
            <div>
            <p>click link below to reset your password.</p>
            <a href='http://localhost:5000/reset/${resetPasswordToken}'>reset password</a>
            </div>
          `,
      }
      const resp = await Sendgrid.send(message)
      if (!resp || resp[0]?.statusCode !== 202) throw new Error('Cannot send email,please try again.')
      return true
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => Boolean)
  async resetPassword(@Arg('token') token: string, @Arg('password') password: string): Promise<Boolean> {
    try {
      const user = await UserModel.findOne({ resetPasswordToken: token })
      if (!user) throw new Error('token invalid !')

      const { resetPasswordTokenExpiry } = user
      if (!resetPasswordTokenExpiry) throw new Error('no_expiry')

      const isTokenExpired = resetPasswordTokenExpiry > Date.now()
      if (isTokenExpired) {
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpiry = undefined
        await user.save()
        throw new Error('token_expired')
      }

      const hashedPassword = await bcryptjs.hash(password, 10)
      user.password = hashedPassword
      user.resetPasswordToken = undefined
      user.resetPasswordTokenExpiry = undefined
      await user.save()

      return true
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => User)
  async updateRole(@Arg('roles', () => [String]) roles: Roles[], @Arg('userId') userId: string, @Ctx() { req }: AppContext): Promise<User | null> {
    try {
      const { tokenVersion } = req
      const admin = await isAuthenticated(req.userId, tokenVersion)

      const isSuperAdmin = admin.roles?.includes(Roles.superAdmin)
      if (!isSuperAdmin) throw new Error('not authorized !')

      const user = await UserModel.findById(userId)
      if (!user) throw new Error('user not found !')

      user.roles = roles
      await user.save()
      return user
    } catch (error) {
      throw error
    }
  }
}
