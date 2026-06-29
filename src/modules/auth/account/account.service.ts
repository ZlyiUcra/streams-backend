import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'argon2';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { VerificationService } from '../verification/verification.service';

import { CreateUserInput } from './inputs/create-user.input';

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService
	) {}

	public async finAll() {
		const users = await this.prismaService.user.findMany();
		return users;
	}

	public async me(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			}
		});
		return user;
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
		const user = await this.prismaService.user.create({
			data: {
				userName,
				email,
				password: await hash(password),
				displayName: userName
			}
		});
		await this.verificationService.sendVerificationToken(user);
		return true;
	}
}
