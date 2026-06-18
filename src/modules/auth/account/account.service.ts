import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/src/core/prisma/prisma.service';

@Injectable()
export class AccountService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async finAll() {
		const users = await this.prismaService.user.findMany();
		return users;
	}
}
