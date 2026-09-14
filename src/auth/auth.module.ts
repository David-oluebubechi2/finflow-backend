import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGateway } from './auth.gateway'
import { WsAuth } from './ws-auth'

@Module({
  providers: [AuthService, AuthGateway, WsAuth],
  exports: [WsAuth],
})
export class AuthModule {}