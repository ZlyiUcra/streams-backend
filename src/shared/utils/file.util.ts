import { ReadStream } from 'fs';

export function validateFileFormat(
	filename: string,
	allowedFileFormats: string[]
) {
	const fileParts = filename.split('.');
	const extention = fileParts[fileParts.length - 1];

	return allowedFileFormats.includes(extention);
}

export async function validateFileSize(
	fileStream: ReadStream,
	allowedFileSizeInBytes: number
) {
	return new Promise((res, rej) => {
		let fileSizeInBytes = 0;

		fileStream
			.on('data', (data: Buffer | string) => {
				if (typeof data === 'string') {
					fileSizeInBytes = Buffer.byteLength(data);
				} else {
					fileSizeInBytes = data.byteLength;
				}
			})
			.on('end', () => {
				res(fileSizeInBytes <= allowedFileSizeInBytes);
			})
			.on('error', rej);
	});
}
