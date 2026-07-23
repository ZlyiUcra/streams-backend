import { ConflictException, Injectable } from '@nestjs/common';
import { type User } from '@prisma/client';
import Upload from 'graphql-upload/Upload.js';
import sharp from 'sharp';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { StorageService } from '../../libs/storage/storage.service';

import { ChangeProfileInfoInput } from './inputs/change-profile-info.input';

@Injectable()
export class ProfileService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	public async changeAvatar(user: User, file: Upload) {
		if (user.avatar) {
			await this.storageService.remove(user.avatar);
		}

		// FIX: `Upload` is a promise wrapper - `filename`/`createReadStream` live on
		// the resolved `FileUpload` from `file.promise`, not on `file` itself.
		// The old code called `file.createReadStream()`/`file.fileName` directly on
		// the wrapper, which throws (no such members) on a real GraphQL upload.
		// `createReadStream` is kept on `fileUpload` (not destructured) so it stays
		// bound to its object - @typescript-eslint/unbound-method.
		const fileUpload = await file.promise;
		const { filename } = fileUpload;

		const chunks: Buffer[] = [];
		for await (const chunk of fileUpload.createReadStream()) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);
		const fileName = `/channels/${user.userName}.webp`;

		// FIX: property is `filename` (lowercase), not `fileName`.
		if (filename && filename.endsWith('.gif')) {
			const processedBuffer = await sharp(buffer, { animated: true })
				.resize(512, 512)
				.webp()
				.toBuffer();

			await this.storageService.upload(
				processedBuffer,
				fileName,
				'image/webp'
			);
		} else {
			const processedBuffer = await sharp(buffer)
				.resize(512, 512)
				.webp()
				.toBuffer();

			await this.storageService.upload(
				processedBuffer,
				fileName,
				'image/webp'
			);
		}
		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: fileName
			}
		});

		return true;
	}
	public async removeAvatar(user: User) {
		if (!user.avatar) {
			return;
		}
		await this.storageService.remove(user.avatar);
		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: null
			}
		});
		return true;
	}
	public async changeInfo(user: User, input: ChangeProfileInfoInput) {
		const { userName, displayName, bio } = input;

		const userNameExists = await this.prismaService.user.findUnique({
			where: {
				userName
			}
		});
		if (userNameExists && userName !== user.userName) {
			throw new ConflictException('Username already exists');
		}
		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				userName,
				displayName,
				bio
			}
		});
		return true;
	}
}
