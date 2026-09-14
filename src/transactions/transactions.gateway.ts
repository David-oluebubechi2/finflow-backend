import {
  Ack,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import type { Socket } from 'socket.io'
import { TransactionsService } from './transactions.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { WsAuth } from '../auth/ws-auth'
import { AckFn, respond, validateDto } from '../ws/ack.util'
import { ALLOWED_ORIGINS } from '../ws/cors'

@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS } })
export class TransactionsGateway {
  constructor(
    private readonly transactions: TransactionsService,
    private readonly wsAuth: WsAuth,
  ) {}

  handleConnection(socket: Socket) {
    this.wsAuth.attach(socket)
  }

  @SubscribeMessage('transactions.list')
  async list(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { account?: string; kind?: 'in' | 'out' },
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const userId = this.wsAuth.requireUser(socket).sub
      const { account, kind } = payload ?? {}
      return this.transactions.list(userId, account, kind)
    })
  }

  @SubscribeMessage('transactions.create')
  async create(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const userId = this.wsAuth.requireUser(socket).sub
      return this.transactions.create(userId, await validateDto(CreateTransactionDto, payload))
    })
  }
}