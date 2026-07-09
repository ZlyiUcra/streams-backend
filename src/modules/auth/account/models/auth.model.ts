import { Field, ObjectType } from '@nestjs/graphql';

import { UserModel } from './user.model';

@ObjectType()
export class AuthModel {
	@Field(() => UserModel, { nullable: true })
	public user?: UserModel | null;

	@Field(() => String, { nullable: true })
	public message?: string | null;
}
