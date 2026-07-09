import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { type Request } from 'express';
import { type SessionData } from 'express-session';
import { TOTP } from 'otpauth';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { getSessionMetada } from '@/src/shared/utils/session-metadata.util';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';

import { VerificationService } from '../verification/verification.service';

import { LoginInput } from './inputs/login.input';

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService,
		private readonly verificationService: VerificationService
	) {}

	public async findByUser(req: Request) {
		const userId = req.session.userId;

		if (!userId) {
			throw new NotFoundException('User is not in the session');
		}

		const folder = this.configService.getOrThrow<string>('SESSION_FOLDER');
		const keys = await this.redisService.client.keys(`${folder}*`);

		const userSessions: Array<SessionData & { id: string }> = [];

		for (const key of keys) {
			const sessionData = await this.redisService.client.get(key);

			if (sessionData) {
				const session = JSON.parse(sessionData) as SessionData;

				if (session.userId === userId) {
					userSessions.push({
						...session,
						createdAt: session.createdAt
							? new Date(session.createdAt)
							: session.createdAt,
						id: key.split(':')[1]
					});
				}
			}
		}

		userSessions.sort(
			(a, b) =>
				new Date(b.createdAt ?? 0).getTime() -
				new Date(a.createdAt ?? 0).getTime()
		);

		// exclude the current session so the client can list "other devices"
		return userSessions.filter(session => session.id !== req.session.id);
	}
	public async findCurrent(req: Request) {
		const sessionId = req.session.id;

		const sessionData = (await this.redisService.client.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)) as string;

		const session = JSON.parse(sessionData) as SessionData;
		return {
			...session,
			createdAt: session.createdAt
				? new Date(session.createdAt)
				: session.createdAt,
			id: sessionId
		};
	}

	public async login(req: Request, input: LoginInput, userAgent: string) {
		const { login, password, pin } = input;
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
		if (!user.isEmailVerified) {
			await this.verificationService.sendVerificationToken(user);
			throw new BadRequestException(
				'Account is not verified. Please check your email for confirmation'
			);
		}
		if (user.isTotpEnabled) {
			if (!pin) {
				return { message: 'TOTP pin is required' };
			}
			const totp = new TOTP({
				issuer: 'StreamsBackend',
				label: `${user.email}`,
				algorithm: 'SHA1',
				digits: 6,
				secret: user.totpSecret ? user.totpSecret : ''
			});
			const delta = totp.validate({ token: pin });
			if (delta === null) {
				throw new BadRequestException('Invalid pin');
			}
		}
		const metadata = getSessionMetada(req, userAgent);

		return { user: await saveSession(req, user, metadata) };
	}

	@Authorization()
	public async logout(req: Request) {
		return destroySession(req, this.configService);
	}
	public clearSession(req: Request) {
		req.res?.clearCookie(
			this.configService.getOrThrow<string>('SESSION_NAME')
		);
		return true;
	}
	public async remove(req: Request, id: string) {
		if (req.session.id === id) {
			throw new ConflictException('Current session cannot be deleted');
		}
		await this.redisService.client.del(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
		);
		return true;
	}
}
