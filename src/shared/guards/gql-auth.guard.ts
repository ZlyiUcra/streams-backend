import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { type GqlContext } from '@/src/shared/types/gql-context.types';

@Injectable()
export class GqlAuthGuard implements CanActivate {
	public constructor(private readonly prismaService: PrismaService) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context);
		const request = ctx.getContext<GqlContext>().req;

		const userId = request.session.userId;

		// Look up the user only when the session carries a userId; otherwise
		// fall back to null so the single guard below rejects both an
		// unauthenticated session and a userId that no longer exists.
		const user = userId
			? await this.prismaService.user.findUnique({
					where: { id: userId }
				})
			: null;

		if (!user) {
			throw new UnauthorizedException('User is not authorized');
		}

		request.user = user;
		return true;
	}
}
