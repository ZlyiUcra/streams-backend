import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

expand(config());

export const isDev = (consfigService: ConfigService) => {
	const nodeEnv = consfigService.getOrThrow<string>('NODE_ENV');
	return nodeEnv === 'development';
};

export const IS_DEV_ENV = process.env.NODE_ENV === 'development';
