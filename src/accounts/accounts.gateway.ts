import {
  Ack,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import type { Socket } from 'socket.io'
import { AccountsService } from './accounts.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { WsAuth } from '../auth/ws-auth'
import { AckFn, respond, validateDto } from '../ws/ack.util'
import { ALLOWED_ORIGINS } from '../ws/cors'

@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS } })
export class AccountsGateway {
  constructor(
    private readonly accounts: AccountsService,
    private readonly wsAuth: WsAuth,
  ) {}

  handleConnection(socket: Socket) {
    this.wsAuth.attach(socket)
  }

  @SubscribeMessage('accounts.list')
  async list(@ConnectedSocket() socket: Socket, @MessageBody() _payload: unknown, @Ack() ack: AckFn) {
    await respond(ack, async () => this.accounts.list(this.wsAuth.requireUser(socket).sub))
  }

  @SubscribeMessage('accounts.create')
  async create(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const userId = this.wsAuth.requireUser(socket).sub
      return this.accounts.create(userId, await validateDto(CreateAccountDto, payload))
    })
  }

  @SubscribeMessage('accounts.remove')
  async remove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { id?: unknown },
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const id = Number(payload?.id)
      if (!Number.isInteger(id)) throw new Error('Invalid account id.')
      return this.accounts.remove(this.wsAuth.requireUser(socket).sub, id)
    })
  }
}