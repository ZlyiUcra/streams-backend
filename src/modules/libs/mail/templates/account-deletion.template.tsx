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

interface AccountDeletionTemplateProps {
	domain: string;
}

export function AccountDeletionTemplate({
	domain
}: AccountDeletionTemplateProps) {
	const registerUrl = `https://${domain}/register`;
	return (
		<Html>
			<Head />
			<Preview>Account deleted</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold'>
							Your account has been completely deleted
						</Heading>

						<Text className='text-black text-base mt-2'>
							Your account has been completely erased from our
							database. All your data and information have been
							permanently deleted.
						</Text>
					</Section>

					<Section className='bg-white text-black text-center rounded-lg shadow-md p-6 mb-4'>
						<Text>
							You will no longer receive notifications via
							Telegram or email.
						</Text>
						<Text>
							If you&apos;d like to return to the platform, you
							can register using the link below:
						</Text>
						<Link
							href={registerUrl}
							className='inline-flex justify-center items-center rounded-md mt-2 text-sm font-medium text-white bg-[#18B9AE] px-5 py-2 rounded-full'
						>
							Register here
						</Link>
					</Section>
					<Section className='text-center text-black'>
						<Text>
							Thank you for using our service. We always strive to
							provide the best experience for our users, and we
							hope to see you again in the future.
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
}
