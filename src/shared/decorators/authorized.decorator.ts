import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { type User } from '@prisma/client';
import { type Request } from 'express';

import { type GqlContext } from '@/src/shared/types/gql-context.types';

export const Authorized = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		let user: User | undefined;

		if (ctx.getType() === 'http') {
			user = ctx.switchToHttp().getRequest<Request>().user;
		} else {
			const context = GqlExecutionContext.create(ctx);
			user = context.getContext<GqlContext>().req.user;
		}

		return data ? user?.[data] : user;
	}
);
