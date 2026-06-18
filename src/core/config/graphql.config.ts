import { type ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { join } from 'path';

import { isDev } from '@/src/shared/utils/is-dev';

export interface GqlContext {
	req: Request;
	res: Response;
}

export function getGraphQLConfig(
	configService: ConfigService
): ApolloDriverConfig {
	return {
		playground: isDev(configService),
		path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
		autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'),
		sortSchema: true,
		context: ({ req, res }: GqlContext) => ({ req, res })
	};
}
