import { Module } from '@nestjs/common';

import { TotpResolver } from '../totp/totp.resolver';
import { TotpService } from '../totp/totp.service';

@Module({
	providers: [TotpResolver, TotpService]
})
export class TotpModule {}
