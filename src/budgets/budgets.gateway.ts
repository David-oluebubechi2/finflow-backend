import {
  Ack,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import type { Socket } from 'socket.io'
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto, UpdateBudgetSpentDto } from './dto/create-budget.dto'
import { WsAuth } from '../auth/ws-auth'
import { AckFn, respond, validateDto } from '../ws/ack.util'
import { ALLOWED_ORIGINS } from '../ws/cors'

@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS } })
export class BudgetsGateway {
  constructor(
    private readonly budgets: BudgetsService,
    private readonly wsAuth: WsAuth,
  ) {}

  handleConnection(socket: Socket) {
    this.wsAuth.attach(socket)
  }

  @SubscribeMessage('budgets.list')
  async list(@ConnectedSocket() socket: Socket, @MessageBody() _payload: unknown, @Ack() ack: AckFn) {
    await respond(ack, async () => this.budgets.list(this.wsAuth.requireUser(socket).sub))
  }

  @SubscribeMessage('budgets.create')
  async create(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: unknown,
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const userId = this.wsAuth.requireUser(socket).sub
      return this.budgets.create(userId, await validateDto(CreateBudgetDto, payload))
    })
  }

  @SubscribeMessage('budgets.update')
  async update(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { id?: unknown; spent?: unknown },
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const userId = this.wsAuth.requireUser(socket).sub
      const id = Number(payload?.id)
      if (!Number.isInteger(id)) throw new Error('Invalid budget id.')
      const dto = await validateDto(UpdateBudgetSpentDto, payload)
      return this.budgets.updateSpent(userId, id, dto)
    })
  }

  @SubscribeMessage('budgets.remove')
  async remove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { id?: unknown },
    @Ack() ack: AckFn,
  ) {
    await respond(ack, async () => {
      const id = Number(payload?.id)
      if (!Number.isInteger(id)) throw new Error('Invalid budget id.')
      return this.budgets.remove(this.wsAuth.requireUser(socket).sub, id)
    })
  }
}