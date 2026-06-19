import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { type Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { LoginInput } from './inputs/login.input';

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {}

	public async login(req: Request, input: LoginInput) {
		const { login, password } = input;
		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ userName: { equals: login } },
					{ email: { equals: login } }
				]
			}
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		const isValidPassworrd = await verify(user.password, password);
		if (!isValidPassworrd) {
			throw new UnauthorizedException('Wrong password');
		}
		return new Promise((resolve, reject) => {
			req.session.createdAt = new Date();
			req.session.userId = user.id;
			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Session was not saved'
						)
					);
				}
				resolve({ user });
			});
		});
	}

	public async logout(req: Request) {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Session was not destroyed'
						)
					);
				}
				req.res?.clearCookie(
					this.configService.getOrThrow<string>('SESSION_NAME')
				);
				resolve(true);
			});
		});
	}
}
