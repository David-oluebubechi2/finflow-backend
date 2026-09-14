import { Module } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { TransactionsGateway } from './transactions.gateway'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [TransactionsService, TransactionsGateway],
})
export class TransactionsModule {}