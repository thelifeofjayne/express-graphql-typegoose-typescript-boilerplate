import { doesNotThrow } from 'assert'
import passport from 'passport'
import { Strategy as FacebookStrategy, StrategyOptionWithRequest as FacebookStrategyOptionWithRequest } from 'passport-facebook'
import { Strategy as GoogleStrategy, StrategyOptionsWithRequest as GoogleStrategyOptionWithRequest } from 'passport-google-oauth20'
import { AppRequest } from '../types'

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_CALLBACK_URL, GOOGLE_APP_ID, GOOGLE_APP_SECRET, GOOGLE_CALLBACK_URL } = process.env

const FacebookConfig: FacebookStrategyOptionWithRequest = {
  clientID: FACEBOOK_APP_ID!,
  clientSecret: FACEBOOK_APP_SECRET!,
  callbackURL: FACEBOOK_CALLBACK_URL!,
  passReqToCallback: true,
}

export const PassportFacebook = () =>
  passport.use(
    new FacebookStrategy(FacebookConfig, (req: AppRequest, _, __, profile, callback) => {
      try {
        if (profile) {
          req.profile = profile
          callback(undefined, profile)
        }
      } catch (error) {
        callback(error)
      }
    })
  )

const GoogleConfig: GoogleStrategyOptionWithRequest = {
  clientID: GOOGLE_APP_ID!,
  clientSecret: GOOGLE_APP_SECRET!,
  callbackURL: GOOGLE_CALLBACK_URL!,
  passReqToCallback: true,
}

export const PassportGoogle = () =>
  passport.use(
    new GoogleStrategy(GoogleConfig, (req: AppRequest, _, __, profile, callback) => {
      try {
        if (profile) {
          req.profile = profile
          callback(undefined, profile)
        }
        callback(undefined, profile)
      } catch (error) {
        callback(error)
      }
    })
  )
