import { Response, Request } from 'express'
import { Profile as FacebookProfile } from 'passport-facebook'
import { Profile as GoogleProfile } from 'passport-google-oauth20'

export enum Roles {
  client = 'CLIENT',
  admin = 'ADMIN',
  superAdmin = 'SUPERADMIN',
}

export interface AppRequest extends Request {
  userId?: string
  tokenVersion?: number
  profile?: FacebookProfile | GoogleProfile
}

export interface AppContext {
  req: AppRequest
  res: Response
}
