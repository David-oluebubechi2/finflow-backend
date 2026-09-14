import { MessageEvent } from '@nestjs/common'
import {
  Ack,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import type { Socket } from 'socket.io'
import { ChatService } from './chat.service'
import { AckFn, respond } from '../ws/ack.util'
import { ALLOWED_ORIGINS } from '../ws/cors'

@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS } })
export class ChatGateway {
  constructor(private readonly chat: ChatService) {}

  @SubscribeMessage('chat.answer')
  async answer(@MessageBody() payload: { message?: unknown }, @Ack() ack: AckFn) {
    await respond(ack, async () => {
      const message = typeof payload?.message === 'string' ? payload.message.trim() : ''
      if (!message) throw new Error('Missing "message".')
      const reply = await this.chat.answer(message)
      return { reply }
    })
  }

  @SubscribeMessage('chat.stream')
  stream(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { message?: unknown; requestId?: unknown },
  ) {
    const message = typeof payload?.message === 'string' ? payload.message.trim() : ''
    const requestId = typeof payload?.requestId === 'string' ? payload.requestId : 'chat'
    if (!message) {
      socket.emit('chat.error', { requestId, error: 'Missing "message".' })
      return
    }
    this.chat.stream(message).subscribe({
      next: (event: MessageEvent) => {
        const data = event.data as { delta?: string; done?: boolean; error?: string }
        if (typeof data.error === 'string') {
          socket.emit('chat.error', { requestId, error: data.error })
        } else if (data.done) {
          socket.emit('chat.done', { requestId })
        } else if (typeof data.delta === 'string') {
          socket.emit('chat.delta', { requestId, text: data.delta })
        }
      },
      error: () => {
        socket.emit('chat.error', {
          requestId,
          error: 'I could not reach an AI service right now. Please try again in a moment.',
        })
      },
    })
  }
}