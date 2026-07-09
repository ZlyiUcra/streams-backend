import {
	Body,
	Head,
	Heading,
	Link,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components';
import { Html } from '@react-email/html';
import React from 'react';

import { type SessionMetadata } from '@/src/shared/types/session-metadata.types';

interface DeactivateTemplateProps {
	token: string;
	metadata: SessionMetadata;
}

export function DeactivateTemplate({
	token,
	metadata
}: DeactivateTemplateProps) {
	return (
		<Html>
			<Head />
			<Preview>Account deactivation</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold'>
							Request for Account deactivation
						</Heading>

						<Text className='text-black text-base mt-2'>
							You requested to deactivate your account.
						</Text>
					</Section>

					<Section className='bg-gray-100 rounded-lg p-6 text-center mb-6'>
						<Heading className='text-2xl text-black font-semibold'>
							Confirmation code
						</Heading>
						<Heading className='text-3xl text-black font-semibold'>
							{token}
						</Heading>
						<Text className='text-black'>
							This code will expire in 5 minutes.
						</Text>
					</Section>
					<Section className='bg-gray-100 rounded-lg p-6 mb-6'>
						<Heading className='text-xl font-semibold text-[#18B9AE]'>
							Request information:
						</Heading>
						<ul className='list-disc list-inside text-black mt-2'>
							<li>
								🌍 Location: {metadata.location.country},{' '}
								{metadata.location.city}
							</li>
							<li> 🖥 Operating system: {metadata.device.os}</li>
							<li> 🌐 Browser: {metadata.device.browser}</li>
							<li> 💻 IP address: {metadata.ip}</li>
						</ul>
						<Text className='text-gray-600 mt-2'>
							If you did not initiate this request, please ignore
							this message.
						</Text>
					</Section>
					<Section className='text-center mt-8'>
						<Text className='text-gray-600'>
							If you have any questions or run into any
							difficulties, feel free to reach out to our support
							team at
							<Link
								href='mailto:gochualex@gmail.com'
								className='text-[#18B9AE] underline ml-2'
							>
								Support
							</Link>
							.
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
}
