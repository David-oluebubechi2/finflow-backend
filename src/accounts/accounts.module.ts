import { Module } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { AccountsGateway } from './accounts.gateway'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [AccountsService, AccountsGateway],
})
export class AccountsModule {}