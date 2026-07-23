import {
	BadRequestException,
	Injectable,
	type PipeTransform
} from '@nestjs/common';
import { ReadStream } from 'fs';

import { validateFileFormat, validateFileSize } from '../utils/file.util';

type UploadedFile = {
	filename: string;
	createReadStream: () => ReadStream;
};

@Injectable()
export class FileValidationPipe implements PipeTransform {
	public async transform(value: UploadedFile): Promise<UploadedFile> {
		if (!value.filename) {
			throw new BadRequestException('No file provided');
		}
		const { filename, createReadStream } = value;

		const fileStream = createReadStream();

		const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
		const isFileFormatValid = validateFileFormat(filename, allowedFormats);
		if (!isFileFormatValid) {
			throw new BadRequestException('Unsupported file format');
		}
		const isFileSizeValid = await validateFileSize(
			fileStream,
			10 * 1024 * 1024
		);
		if (!isFileSizeValid) {
			throw new BadRequestException('File size must be less than 10 Mb');
		}
		return value;
	}
}
