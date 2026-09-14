import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Socket } from 'socket.io'

export type AuthedUser = { sub: string; email: string }

@Injectable()
export class WsAuth {
  constructor(private readonly jwt: JwtService) {}

  attach(socket: Socket): AuthedUser | null {
    const token = (socket.handshake.auth as { token?: string } | undefined)?.token
    if (!token) return null
    try {
      const payload = this.jwt.verify<{ sub: string; email: string }>(token)
      const user: AuthedUser = { sub: payload.sub, email: payload.email }
      socket.data.user = user
      return user
    } catch {
      return null
    }
  }

  static get(socket: Socket): AuthedUser | null {
    return (socket.data?.user as AuthedUser | undefined) ?? null
  }

  requireUser(socket: Socket): AuthedUser {
    const user = WsAuth.get(socket)
    if (!user) throw new UnauthorizedException('Authentication required.')
    return user
  }
}