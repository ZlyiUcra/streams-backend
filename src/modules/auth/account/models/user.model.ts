import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
	@Field(() => ID)
	public id!: string;

	@Field(() => String)
	public email!: string;

	@Field(() => String)
	public password!: string;

	@Field(() => String)
	public userName!: string;

	@Field(() => String)
	public displayName!: string;

	@Field(() => String, { nullable: true })
	public avatar!: string | null;

	@Field(() => String, { nullable: true })
	public bio!: string | null;

	@Field(() => Date)
	public createdAt!: Date;

	@Field(() => Date)
	public updatedAt!: Date;
}
