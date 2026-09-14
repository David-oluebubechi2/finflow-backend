import { Module } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { BudgetsGateway } from './budgets.gateway'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [BudgetsService, BudgetsGateway],
})
export class BudgetsModule {}