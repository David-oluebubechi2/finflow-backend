import {
  Ack,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import type { Socket } from 'socket.io'
import { AuthService } from './auth.service'
import { WsAuth } from './ws-auth'
import { LoginDto, RegisterDto } from './dto/auth.dto'
import { AckFn, respond, validateDto } from '../ws/ack.util'
import { ALLOWED_ORIGINS } from '../ws/cors'

@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS } })
export class AuthGateway {
  constructor(
    private readonly auth: AuthService,
    private readonly wsAuth: WsAuth,
  ) {}

  handleConnection(socket: Socket) {
    this.wsAuth.attach(socket)
  }

  @SubscribeMessage('auth.register')
  async register(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const result = await this.auth.register(await validateDto(RegisterDto, payload))
      socket.data.user = { sub: result.user.id, email: result.user.email }
      return result
    })
  }

  @SubscribeMessage('auth.login')
  async login(@ConnectedSocket() socket: Socket, @MessageBody() payload: unknown, @Ack() ack: AckFn) {
    await respond(ack, async () => {
      const result = await this.auth.login(await validateDto(LoginDto, payload))
      socket.data.user = { sub: result.user.id, email: result.user.email }
      return result
    })
  }

  @SubscribeMessage('auth.me')
  async me(@ConnectedSocket() socket: Socket, @MessageBody() _payload: unknown, @Ack() ack: AckFn) {
    await respond(ack, async () => this.auth.profile(this.wsAuth.requireUser(socket).sub))
  }
}