import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { User, UserModel } from '../entities/User'

@Resolver()
export class AuthResolvers {
  @Query(() => [User], { nullable: 'items' })
  async users(): Promise<User[] | null> {
    try {
      return UserModel.find()
    } catch (error) {
      throw error
    }
  }
  @Mutation(() => User)
  async createUser(@Arg('email') email: string, @Arg('password') password: string) {
    try {
      const user = await UserModel.create({ email, password })
      await user.save()
      return user
    } catch (error) {
      throw error
    }
  }
}
