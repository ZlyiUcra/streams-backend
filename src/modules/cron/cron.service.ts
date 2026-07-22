import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { MailService } from '../libs/mail/mail.service';
import { StorageService } from '../libs/storage/storage.service';

@Injectable()
export class CronService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly storageService: StorageService
	) {}

	@Cron('0 0 * * *')
	//@Cron('0/10 * * * * *')
	public async deleteDeactivatedAcconts() {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		//sevenDaysAgo.setSeconds(sevenDaysAgo.getSeconds() - 5);
		const deactivatedAccounts = await this.prismaService.user.findMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo
				}
			}
		});
		//console.log(`Deactivated accounts deleted: `, deactivatedAccounts);

		for (const user of deactivatedAccounts) {
			await this.mailService.sendAccountDeletionEmail(user.email);
			if (user.avatar) {
				await this.storageService.remove(user.avatar);
			}
		}

		await this.prismaService.user.deleteMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo
				}
			}
		});
	}
}
