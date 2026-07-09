import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenType, type User } from '@prisma/client';
import { verify } from 'argon2';
import { type Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetada } from '@/src/shared/utils/session-metadata.util';
import { destroySession } from '@/src/shared/utils/session.util';

import { MailService } from '../../libs/mail/mail.service';

import { DeactivateAccountInput } from './inputs/deactivate-account.input';

@Injectable()
export class DeactivateService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService
	) {}

	public async deactivate(
		req: Request,
		input: DeactivateAccountInput,
		user: User,
		userAgents: string
	) {
		const { email, password, pin } = input;
		if (email !== user.email) {
			throw new BadRequestException(
				'Email does not match the logged-in user'
			);
		}
		const isPasswordValid = await verify(user.password, password);

		if (!isPasswordValid) {
			throw new BadRequestException('Invalid password');
		}
		if (!pin) {
			await this.sendDeactivateToken(req, user, userAgents);
			return {
				message:
					'A deactivation token has been sent to your email. Please enter it to continue.'
			};
		}
		await this.validateDeactivateToken(req, pin);
		return { user };
	}

	private async validateDeactivateToken(req: Request, token: string) {
		const existingToken = await this.prismaService.token.findUnique({
			where: { token, type: TokenType.DEACTIVATE_ACCOUNT }
		});

		if (!existingToken) {
			throw new NotFoundException('Token was not found');
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date();
		if (hasExpired) {
			throw new BadRequestException('Token is expired');
		}

		if (!existingToken.userId) {
			throw new NotFoundException('Token was not found');
		}

		await this.prismaService.user.update({
			where: { id: existingToken.userId },
			data: { isDeactivated: true, deactivatedAt: new Date() }
		});
		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.DEACTIVATE_ACCOUNT
			}
		});

		return destroySession(req, this.configService);
	}

	public async sendDeactivateToken(
		req: Request,
		user: User,
		userAgents: string
	) {
		const deactivateToken = await generateToken(
			this.prismaService,
			user,
			TokenType.DEACTIVATE_ACCOUNT,
			false
		);

		const metadata = getSessionMetada(req, userAgents);

		await this.mailService.sendDeactivateToken(
			user.email,
			deactivateToken.token,
			metadata
		);
		return true;
	}
}
