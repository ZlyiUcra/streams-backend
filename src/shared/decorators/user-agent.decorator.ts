import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { type Request } from 'express';

import { type GqlContext } from '../types/gql-context.types';

export const UserAgent = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		if (ctx.getType() === 'http') {
			const request = ctx.switchToHttp().getRequest<Request>();
			return request.headers['user-agent'];
		} else {
			const context = GqlExecutionContext.create(ctx);
			return context.getContext<GqlContext>().req.headers['user-agent'];
		}
	}
);
