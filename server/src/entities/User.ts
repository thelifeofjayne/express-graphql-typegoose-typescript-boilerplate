import { getModelForClass, prop } from '@typegoose/typegoose'
import { ObjectType, Field, ID } from 'type-graphql'

@ObjectType()
export class User {
  @Field(() => ID)
  id: string

  @Field()
  @prop({ required: true, trim: true, unique: true })
  email: string

  @Field()
  @prop({ required: true, trim: true })
  password: string
}

export const UserModel = getModelForClass(User)
