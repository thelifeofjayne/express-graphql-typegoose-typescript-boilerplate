import { getModelForClass, prop } from '@typegoose/typegoose'
import { ObjectType, Field, ID } from 'type-graphql'
import { Roles } from '../types'

@ObjectType()
export class User {
  @Field(() => ID)
  id: string

  @Field()
  @prop({ required: true, trim: true, unique: true, lowercase: true })
  email: string

  @Field()
  @prop({ required: true, trim: true })
  password: string

  @prop({ required: true, default: 0 })
  tokenVersion: number

  @prop()
  resetPasswordToken?: string

  @prop()
  resetPasswordTokenExpiry?: number

  @prop()
  googleId?: string

  @prop()
  facebookId?: string

  @Field(() => [String])
  @prop({ type: String, required: true, enum: Roles, default: [Roles.client] })
  roles?: Roles[]

  @Field()
  createdAt?: Date

  @Field()
  updatedAt?: Date
}

export const UserModel = getModelForClass(User, { schemaOptions: { timestamps: true } })
