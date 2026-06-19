import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'argon2';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { CreateUserInput } from './inputs/create-user.input';

@Injectable()
export class AccountService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async finAll() {
		const users = await this.prismaService.user.findMany();
		return users;
	}
	public async create(input: CreateUserInput) {
		const { userName, email, password } = input;

		const isUserNameExists = await this.prismaService.user.findUnique({
			where: {
				userName
			}
		});
		if (isUserNameExists) {
			throw new ConflictException(
				'User with this username already exists'
			);
		}
		const isEmailExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		});
		if (isEmailExists) {
			throw new ConflictException('User with this email already exists');
		}
		await this.prismaService.user.create({
			data: {
				userName,
				email,
				password: await hash(password),
				displayName: userName
			}
		});
		return true;
	}
}
