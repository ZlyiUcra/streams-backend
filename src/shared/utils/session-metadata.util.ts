import DeviceDetector from 'device-detector-js';
import { type Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';
import enCountries from 'i18n-iso-countries/langs/en.json';

import { type SessionMetadata } from '../types/session-metadata.types';

import { IS_DEV_ENV } from './is-dev';

countries.registerLocale(enCountries);

export function getSessionMetada(
	req: Request,
	userAgent: string
): SessionMetadata {
	const ip = IS_DEV_ENV
		? '203.171.55.70'
		: Array.isArray(req.headers['cf-connecting-ip'])
			? req.headers['cf-connecting-ip'][0]
			: req.headers['cf-connecting-ip'] ||
				(typeof req.headers['x-forwarded-for'] === 'string'
					? req.headers['x-forwarded-for']
					: req.ip);
	const location = lookup(ip || '');
	const device = new DeviceDetector().parse(userAgent);
	return {
		location: {
			country:
				countries.getName(location?.country as string, 'en') ||
				'Unknown',
			city: location?.city || 'Unknown',
			latitude: location?.ll[0] || 0,
			longitude: location?.ll[1] || 0
		},
		device: {
			browser: device.client?.name,
			os: device.os?.name,
			type: device.device?.type
		},
		ip
	} as SessionMetadata;
}
