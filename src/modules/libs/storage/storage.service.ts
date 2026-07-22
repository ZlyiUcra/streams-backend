import {
	DeleteObjectCommand,
	DeleteObjectCommandInput,
	PutObjectCommand,
	PutObjectCommandInput,
	S3Client
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
	private readonly client: S3Client;
	private readonly bucketName: string;

	constructor(private readonly configService: ConfigService) {
		this.client = new S3Client({
			endpoint: this.configService.getOrThrow('S3_ENDPOINT'),
			region: this.configService.getOrThrow('S3_REGION'),
			credentials: {
				accessKeyId: this.configService.getOrThrow('S3_ACCESS_KEY_ID'),
				secretAccessKey: this.configService.getOrThrow(
					'S3_SECRET_ACCESS_KEY_ID'
				)
			}
		});
		this.bucketName = this.configService.getOrThrow('S3_BUCKET_NAME');
	}
	public async upload(buffer: Buffer, key: string, mimeType: string) {
		const command: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: String(key),
			Body: buffer,
			ContentType: mimeType
		};
		await this.client.send(new PutObjectCommand(command));
	}
	public async remove(key: string) {
		const command: DeleteObjectCommandInput = {
			Bucket: this.bucketName,
			Key: String(key)
		};
		await this.client.send(new DeleteObjectCommand(command));
	}
}
